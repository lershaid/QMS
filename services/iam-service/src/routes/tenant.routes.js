const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/v1/tenants:
 *   get:
 *     summary: Get all tenants
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Get tenants endpoint' });
});

module.exports = router;
