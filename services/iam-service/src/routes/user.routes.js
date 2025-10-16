const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Get users endpoint' });
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', (req, res) => {
  res.status(200).json({ message: 'Get user by ID endpoint' });
});

module.exports = router;
