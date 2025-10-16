const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Register a new user
 */
const register = async (tenantId, email, password, firstName, lastName) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (existingUser) {
    const error = new Error('User already exists with this email');
    error.statusCode = 400;
    throw error;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      tenantId,
      email,
      passwordHash,
      firstName,
      lastName,
    },
  });

  // Remove password from response
  const { passwordHash: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

/**
 * Login user and generate tokens
 */
const login = async (email, password, ipAddress, userAgent) => {
  // Find user
  const user = await prisma.user.findFirst({
    where: {
      email,
      isActive: true,
    },
    include: {
      tenant: true,
      userRoles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // Check if tenant is active
  if (!user.tenant.isActive) {
    const error = new Error('Organization account is inactive');
    error.statusCode = 403;
    throw error;
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // Extract permissions
  const permissions = user.userRoles.flatMap((ur) =>
    ur.role.permissions.map((rp) => ({
      resource: rp.permission.resource,
      action: rp.permission.action,
    }))
  );

  // Generate JWT tokens
  const accessToken = generateAccessToken(user, permissions);
  const refreshToken = generateRefreshToken(user);

  // Create session
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: accessToken,
      refreshToken,
      ipAddress,
      userAgent,
      expiresAt,
    },
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'LOGIN',
      resource: 'auth',
      ipAddress,
      userAgent,
    },
  });

  // Remove sensitive data
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
    expiresIn: '24h',
  };
};

/**
 * Logout user
 */
const logout = async (token) => {
  await prisma.session.delete({
    where: { token },
  });
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (refreshToken) => {
  // Find session
  const session = await prisma.session.findUnique({
    where: { refreshToken },
    include: {
      user: {
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!session) {
    const error = new Error('Invalid refresh token'); error.statusCode = 401; throw error;
  }

  // Check if session expired
  if (new Date() > session.expiresAt) {
    await prisma.session.delete({ where: { id: session.id } });
    const error = new Error('Session expired'); error.statusCode = 401; throw error;
  }

  // Extract permissions
  const permissions = session.user.userRoles.flatMap((ur) =>
    ur.role.permissions.map((rp) => ({
      resource: rp.permission.resource,
      action: rp.permission.action,
    }))
  );

  // Generate new access token
  const accessToken = generateAccessToken(session.user, permissions);

  // Update session
  await prisma.session.update({
    where: { id: session.id },
    data: { token: accessToken },
  });

  return { accessToken };
};

/**
 * Generate access token (JWT)
 */
const generateAccessToken = (user, permissions) => {
  return jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      permissions,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '24h' }
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      type: 'refresh',
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const error = new Error('Invalid or expired token');
    error.statusCode = 401;
    throw error;
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  verifyToken,
};
