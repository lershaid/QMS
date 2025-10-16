const express = require('express');
const authService = require('../services/auth.service');
const { validate, schemas } = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * Register a new user
 */
router.post('/register', validate(schemas.register), async (req, res) => {
  try {
    const { tenantId, email, password, firstName, lastName } = req.body;
    
    const user = await authService.register(
      tenantId,
      email,
      password,
      firstName,
      lastName
    );
    
    res.status(201).json({
      code: 201,
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(error.statusCode || 500).json({
      code: error.statusCode || 500,
      message: error.message || 'Registration failed',
    });
  }
});

/**
 * Login user
 */
router.post('/login', validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await authService.login(email, password);
    
    res.status(200).json({
      code: 200,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(error.statusCode || 500).json({
      code: error.statusCode || 500,
      message: error.message || 'Login failed',
    });
  }
});

/**
 * Logout user
 */
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      await authService.logout(token);
    }
    
    res.status(200).json({
      code: 200,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      code: 500,
      message: 'Logout failed',
    });
  }
});

/**
 * Refresh access token
 */
router.post('/refresh', validate(schemas.refreshToken), async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    const result = await authService.refreshAccessToken(refreshToken);
    
    res.status(200).json({
      code: 200,
      message: 'Token refreshed successfully',
      data: result,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(error.statusCode || 500).json({
      code: error.statusCode || 500,
      message: error.message || 'Token refresh failed',
    });
  }
});

/**
 * Verify token
 */
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: 'No token provided',
      });
    }
    
    const user = await authService.verifyToken(token);
    
    res.status(200).json({
      code: 200,
      message: 'Token valid',
      data: user,
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(401).json({
      code: 401,
      message: 'Invalid token',
    });
  }
});

module.exports = router;
