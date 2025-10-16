require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'capa-service',
    timestamp: new Date().toISOString(),
  });
});


app.listen(PORT, () => {
  logger.info(`capa-service listening on port ${PORT}`);
});

module.exports = app;
