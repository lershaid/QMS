const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Get templates endpoint' });
});

router.post('/', (req, res) => {
  res.status(201).json({ message: 'Create template endpoint' });
});

module.exports = router;
