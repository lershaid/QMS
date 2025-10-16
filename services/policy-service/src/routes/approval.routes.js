const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  res.status(201).json({ message: 'Submit approval endpoint' });
});

router.get('/:id', (req, res) => {
  res.status(200).json({ message: 'Get approval tasks endpoint' });
});

module.exports = router;
