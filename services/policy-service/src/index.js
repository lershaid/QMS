require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const policyRoutes = require('./routes/policy.routes');
const versionRoutes = require('./routes/version.routes');
const approvalRoutes = require('./routes/approval.routes');
const templateRoutes = require('./routes/template.routes');

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet());
app.use(cors());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'QMS Policy Lifecycle Service API',
      version: '1.0.0',
      description: 'Policy creation, approval, versioning, and publishing service',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'policy-service',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1/policies', policyRoutes);
app.use('/api/v1/versions', versionRoutes);
app.use('/api/v1/approvals', approvalRoutes);
app.use('/api/v1/templates', templateRoutes);

// Error handling

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: 'Route not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.info(`Policy Service listening on port ${PORT}`);
  console.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.info('HTTP server closed');
  });
});

module.exports = app;
