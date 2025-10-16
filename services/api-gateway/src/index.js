require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('./middleware/auth.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3001',
  /^https:\/\/.*\.github\.dev$/,  // GitHub Codespaces
  /^https:\/\/.*\.githubpreview\.dev$/,  // GitHub Codespaces preview
];

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed patterns
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return allowed === origin;
      if (allowed instanceof RegExp) return allowed.test(origin);
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
  optionsSuccessStatus: 204,
}));

// Handle OPTIONS requests explicitly before other middleware
app.options('*', cors());

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
    pathRewrite: (path) => {
      // Keep the full path - don't remove service prefix
      return path;
    },
    onError: (err, req, res) => {
      console.error(`Proxy error for ${req.url}:`, err.message);
      res.status(502).json({
        code: 502,
        message: 'Bad Gateway - Service unavailable',
      });
    },
    onProxyReq: (proxyReq, req) => {
      console.log(`Proxying ${req.method} ${req.url} to ${target}`);
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
app.use('/api/v1/documents', authMiddleware, createProxy(services.document));
app.use('/api/v1/audits', authMiddleware, createProxy(services.audit));
app.use('/api/v1/capa', authMiddleware, createProxy(services.capa));
app.use('/api/v1/risks', authMiddleware, createProxy(services.risk));
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Gateway listening on port ${PORT}`);
  console.log(`Proxying to ${Object.keys(services).length} microservices`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;
