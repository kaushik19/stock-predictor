const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { getFromCache } = require('../config/database');
const { logger } = require('./errorHandler');

/**
 * Authentication middleware to verify JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Check if token is blacklisted
    const isBlacklisted = await getFromCache(`blacklisted_token_${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been invalidated'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
    
    // Check if user session exists in cache
    const userSession = await getFromCache(`user_session_${decoded.userId}`);
    if (!userSession) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.'
      });
    }

    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Add user to request object
    req.user = user;
    req.userId = user._id;
    
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.replace('Bearer ', '');

    // Check if token is blacklisted
    const isBlacklisted = await getFromCache(`blacklisted_token_${token}`);
    if (isBlacklisted) {
      return next(); // Continue without authentication
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id;
    }

    next();

  } catch (error) {
    // Log error but continue without authentication
    logger.warn('Optional auth error:', error.message);
    next();
  }
};

/**
 * Role-based authorization middleware
 * @param {Array} allowedRoles - Array of allowed roles
 * @returns {Function} Middleware function
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // If no roles specified, just check if user is authenticated
    if (allowedRoles.length === 0) {
      return next();
    }

    // Check if user has required role (for future implementation)
    const userRole = req.user.role || 'user';
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Investment experience based authorization
 * @param {Array} allowedExperience - Array of allowed experience levels
 * @returns {Function} Middleware function
 */
const authorizeByExperience = (allowedExperience = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userExperience = req.user.profile?.investmentExperience || 'beginner';
    
    if (allowedExperience.length > 0 && !allowedExperience.includes(userExperience)) {
      return res.status(403).json({
        success: false,
        message: `This feature requires ${allowedExperience.join(' or ')} investment experience`
      });
    }

    next();
  };
};

/**
 * Risk tolerance based authorization
 * @param {Array} allowedRiskLevels - Array of allowed risk tolerance levels
 * @returns {Function} Middleware function
 */
const authorizeByRiskTolerance = (allowedRiskLevels = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRiskTolerance = req.user.profile?.riskTolerance || 'medium';
    
    if (allowedRiskLevels.length > 0 && !allowedRiskLevels.includes(userRiskTolerance)) {
      return res.status(403).json({
        success: false,
        message: `This feature requires ${allowedRiskLevels.join(' or ')} risk tolerance`
      });
    }

    next();
  };
};

/**
 * Rate limiting for authentication endpoints
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Middleware function
 */
const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  return async (req, res, next) => {
    try {
      const clientIP = req.ip || req.connection.remoteAddress;
      const key = `auth_attempts_${clientIP}`;
      
      // Get current attempts from cache
      const attempts = await getFromCache(key) || 0;
      
      if (attempts >= maxAttempts) {
        return res.status(429).json({
          success: false,
          message: 'Too many authentication attempts. Please try again later.',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }

      // Continue to next middleware
      next();

    } catch (error) {
      logger.error('Auth rate limit error:', error);
      next(); // Continue on error
    }
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  authorizeByExperience,
  authorizeByRiskTolerance,
  authRateLimit
};