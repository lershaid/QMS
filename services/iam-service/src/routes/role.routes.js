const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Get roles endpoint' });
});

module.exports = router;
