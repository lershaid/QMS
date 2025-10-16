const winston = require('winston');

/**
 * Create a logger instance for a microservice
 * @param {string} serviceName - Name of the microservice
 * @returns {winston.Logger} Configured logger instance
 */
const createLogger = (serviceName) => {
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    ),
    defaultMeta: { service: serviceName },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(
            ({ level, message, timestamp, service, ...metadata }) => {
              let msg = `${timestamp} [${service}] ${level}: ${message}`;
              if (Object.keys(metadata).length > 0) {
                msg += ` ${JSON.stringify(metadata)}`;
              }
              return msg;
            }
          )
        ),
      }),
    ],
  });

  // Add file transport in production
  if (process.env.NODE_ENV === 'production') {
    logger.add(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
      })
    );
    logger.add(new winston.transports.File({ filename: 'logs/combined.log' }));
  }

  return logger;
};

module.exports = { createLogger };
