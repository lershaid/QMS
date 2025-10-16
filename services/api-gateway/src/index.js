require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('./middleware/auth.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS must come before other middleware
app.use(cors({
  origin: true, // Allow all origins (for development)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // 24 hours
}));

// Handle OPTIONS requests explicitly
app.options('*', cors());

// Security middleware (after CORS)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Body parser
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => req.method === 'OPTIONS', // Skip rate limiting for preflight
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
  });
});

// Service routes configuration
const services = {
  iam: process.env.IAM_SERVICE_URL || 'http://iam-service:3001',
  policy: process.env.POLICY_SERVICE_URL || 'http://policy-service:3002',
  document: process.env.DOCUMENT_SERVICE_URL || 'http://document-service:3003',
  audit: process.env.AUDIT_SERVICE_URL || 'http://audit-service:3004',
  capa: process.env.CAPA_SERVICE_URL || 'http://capa-service:3005',
  risk: process.env.RISK_SERVICE_URL || 'http://risk-service:3006',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:3007',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3008',
};

// Proxy configuration
const createProxy = (target) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    logLevel: 'debug',
    onError: (err, req, res) => {
      console.error(`Proxy error for ${req.url}:`, err.message);
      res.status(502).json({
        code: 502,
        message: 'Bad Gateway - Service unavailable',
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying ${req.method} ${req.url} to ${target}${req.url}`);
    },
  });
};

// Authentication routes (no auth required)
app.use('/api/v1/auth', createProxy(services.iam));

// Protected routes (require authentication)
app.use('/api/v1/users', authMiddleware, createProxy(services.iam));
app.use('/api/v1/roles', authMiddleware, createProxy(services.iam));
app.use('/api/v1/tenants', authMiddleware, createProxy(services.iam));

app.use('/api/v1/policies', authMiddleware, createProxy(services.policy));
app.use('/api/v1/versions', authMiddleware, createProxy(services.policy));
app.use('/api/v1/approvals', authMiddleware, createProxy(services.policy));
app.use('/api/v1/templates', authMiddleware, createProxy(services.policy));

app.use('/api/v1/documents', authMiddleware, createProxy(services.document));
app.use('/api/v1/audits', authMiddleware, createProxy(services.audit));
app.use('/api/v1/nonconformities', authMiddleware, createProxy(services.capa));
app.use('/api/v1/corrective-actions', authMiddleware, createProxy(services.capa));
app.use('/api/v1/risks', authMiddleware, createProxy(services.risk));
app.use('/api/v1/objectives', authMiddleware, createProxy(services.risk));
app.use('/api/v1/analytics', authMiddleware, createProxy(services.analytics));
app.use('/api/v1/notifications', authMiddleware, createProxy(services.notification));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: 'Route not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
  console.log(`Proxying to ${Object.keys(services).length} microservices`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;
