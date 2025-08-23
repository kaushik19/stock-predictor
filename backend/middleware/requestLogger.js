const morgan = require('morgan');
const { logger } = require('./errorHandler');

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req, res) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '-';
});

// Custom token for request ID (if available)
morgan.token('request-id', (req) => {
  return req.id || '-';
});

// Custom token for user ID (if authenticated)
morgan.token('user-id', (req) => {
  return req.user?.id || 'anonymous';
});

// Development format - colorized and detailed
const developmentFormat = morgan(':method :url :status :res[content-length] - :response-time ms :user-id', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
});

// Production format - JSON structured logging
const productionFormat = morgan((tokens, req, res) => {
  return JSON.stringify({
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    contentLength: tokens.res(req, res, 'content-length'),
    responseTime: tokens['response-time'](req, res),
    userAgent: tokens['user-agent'](req, res),
    ip: tokens['remote-addr'](req, res),
    userId: tokens['user-id'](req, res),
    requestId: tokens['request-id'](req, res),
    timestamp: new Date().toISOString()
  });
}, {
  stream: {
    write: (message) => logger.info(JSON.parse(message.trim()))
  }
});

// Skip logging for health checks in production
const skipHealthCheck = (req, res) => {
  return process.env.NODE_ENV === 'production' && req.url === '/health';
};

module.exports = {
  developmentLogger: morgan('dev', { skip: skipHealthCheck }),
  productionLogger: productionFormat,
  requestLogger: process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat
};