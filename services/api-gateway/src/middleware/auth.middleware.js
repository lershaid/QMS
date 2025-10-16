const axios = require('axios');

/**
 * Authentication middleware for API Gateway
 * Verifies JWT token with IAM service
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 401,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with IAM service
    const iamServiceUrl = process.env.IAM_SERVICE_URL || 'http://iam-service:3001';
    
    try {
      const response = await axios.get(`${iamServiceUrl}/api/v1/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Attach user info to request
      req.user = response.data.data;
      req.token = token;
      
      next();
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return res.status(401).json({
          code: 401,
          message: 'Invalid or expired token'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      code: 500,
      message: 'Authentication service unavailable',
    });
  }
};

module.exports = authMiddleware;
