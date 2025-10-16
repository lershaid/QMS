require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'document-service',
    timestamp: new Date().toISOString(),
  });
});


app.listen(PORT, () => {
  logger.info(`document-service listening on port ${PORT}`);
});

module.exports = app;
