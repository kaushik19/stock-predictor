const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Generate JWT access token
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Generate JWT refresh token
 * @param {string} userId - User ID
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    { expiresIn: '30d' }
  );
};

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
};

/**
 * Extract token from authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null if not found
 */
const extractToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.replace('Bearer ', '');
};

/**
 * Generate secure random token for password reset, email verification, etc.
 * @param {number} length - Token length (default: 32)
 * @returns {string} Random token
 */
const generateSecureToken = (length = 32) => {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Check if token is expired
 * @param {Object} decodedToken - Decoded JWT token
 * @returns {boolean} True if token is expired
 */
const isTokenExpired = (decodedToken) => {
  const currentTime = Math.floor(Date.now() / 1000);
  return decodedToken.exp < currentTime;
};

/**
 * Get token expiration time in human readable format
 * @param {Object} decodedToken - Decoded JWT token
 * @returns {Date} Expiration date
 */
const getTokenExpiration = (decodedToken) => {
  return new Date(decodedToken.exp * 1000);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with score and feedback
 */
const validatePasswordStrength = (password) => {
  const result = {
    isValid: false,
    score: 0,
    feedback: []
  };

  if (!password) {
    result.feedback.push('Password is required');
    return result;
  }

  if (password.length < 6) {
    result.feedback.push('Password must be at least 6 characters long');
  } else {
    result.score += 1;
  }

  if (password.length >= 8) {
    result.score += 1;
  }

  if (/[a-z]/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('Password should contain lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('Password should contain uppercase letters');
  }

  if (/\d/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('Password should contain numbers');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('Password should contain special characters');
  }

  result.isValid = result.score >= 4 && password.length >= 6 && result.feedback.length === 0;

  if (result.isValid && result.feedback.length === 0) {
    result.feedback.push('Password strength is good');
  }

  return result;
};

module.exports = {
  generateToken,
  generateRefreshToken,
  hashPassword,
  comparePassword,
  verifyToken,
  extractToken,
  generateSecureToken,
  isTokenExpired,
  getTokenExpiration,
  validatePasswordStrength
};