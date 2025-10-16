#!/bin/bash

# Script to generate boilerplate for remaining microservices

SERVICES=(
  "document-service:3003"
  "audit-service:3004"
  "capa-service:3005"
  "risk-service:3006"
  "analytics-service:3007"
  "notification-service:3008"
)

for service_info in "${SERVICES[@]}"; do
  IFS=':' read -r service port <<< "$service_info"
  service_dir="services/$service"
  
  mkdir -p "$service_dir/src/routes"
  mkdir -p "$service_dir/src/services"
  mkdir -p "$service_dir/prisma"
  
  # Create package.json
  cat > "$service_dir/package.json" << EOF
{
  "name": "@qms/$service",
  "version": "1.0.0",
  "description": "QMS $service",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "dependencies": {
    "@qms/common": "file:../../shared/common",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
EOF

  # Create index.js
  cat > "$service_dir/src/index.js" << EOF
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { createLogger, errorHandler } = require('@qms/common');

const logger = createLogger('$service');
const app = express();
const PORT = process.env.PORT || $port;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: '$service',
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(\`$service listening on port \${PORT}\`);
});

module.exports = app;
EOF

  # Create Dockerfile
  cat > "$service_dir/Dockerfile" << EOF
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE $port
CMD ["node", "src/index.js"]
EOF

  echo "Created boilerplate for $service"
done

echo "All microservices boilerplate created!"
