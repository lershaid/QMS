const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Validate JWT secrets on startup
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set and at least 32 characters long');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

/**
 * Register a new user
 */
const register = async (tenantId, email, password, firstName, lastName) => {
  // Check if user already exists (using compound unique constraint)
  const existingUser = await prisma.user.findUnique({
    where: {
      tenantId_email: {
        tenantId,
        email,
      },
    },
  });

  if (existingUser) {
    const error = new Error('User already exists with this email');
    error.statusCode = 400;
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      tenantId,
      email,
      passwordHash: hashedPassword,
      firstName,
      lastName,
    },
  });

  // Remove password from response
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Login user
 */
const login = async (email, password) => {
  // Find user by email (note: email alone is not unique, but we search all tenants)
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
    include: {
      tenant: true,
    },
  });

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // Check if user is active
  if (!user.isActive) {
    const error = new Error('User account is inactive');
    error.statusCode = 403;
    throw error;
  }

  // Check if tenant is active
  if (!user.tenant.isActive) {
    const error = new Error('Organization account is inactive');
    error.statusCode = 403;
    throw error;
  }

  // Verify password (schema field is 'passwordHash')
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Create session
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  await prisma.session.create({
    data: {
      userId: user.id,
      token: accessToken,
      refreshToken,
      expiresAt,
    },
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Remove sensitive data
  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

/**
 * Logout user
 */
const logout = async (token) => {
  await prisma.session.deleteMany({
    where: { token },
  });
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    const session = await prisma.session.findFirst({
      where: {
        refreshToken,
        userId: decoded.userId,
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      const error = new Error('Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }

    // Generate new access token
    const accessToken = generateAccessToken(session.user);

    // Update session
    await prisma.session.update({
      where: { id: session.id },
      data: { token: accessToken },
    });

    return { accessToken };
  } catch (err) {
    const error = new Error('Invalid refresh token');
    error.statusCode = 401;
    throw error;
  }
};

/**
 * Generate access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '1h' }
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
    },
    JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    const err = new Error('Invalid or expired token');
    err.statusCode = 401;
    throw err;
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  verifyToken,
};
