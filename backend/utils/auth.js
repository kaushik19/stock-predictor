const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Password utility functions
 */
const passwordUtils = {
  /**
   * Hash a password
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  },

  /**
   * Compare password with hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} True if password matches
   */
  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  },

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} Validation result
   */
  validatePasswordStrength(password) {
    const result = {
      isValid: true,
      score: 0,
      feedback: []
    };

    // Length check
    if (password.length < 6) {
      result.isValid = false;
      result.feedback.push('Password must be at least 6 characters long');
    } else if (password.length >= 8) {
      result.score += 1;
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      result.score += 1;
    } else {
      result.feedback.push('Add uppercase letters for stronger password');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      result.score += 1;
    } else {
      result.feedback.push('Add lowercase letters for stronger password');
    }

    // Number check
    if (/\d/.test(password)) {
      result.score += 1;
    } else {
      result.feedback.push('Add numbers for stronger password');
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      result.score += 1;
    } else {
      result.feedback.push('Add special characters for stronger password');
    }

    // Common password check
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'qwerty',
      'letmein', 'welcome', 'monkey', '1234567890'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      result.isValid = false;
      result.score = 0;
      result.feedback.push('This password is too common. Please choose a unique password');
    }

    // Set strength level
    if (result.score >= 4) {
      result.strength = 'strong';
    } else if (result.score >= 3) {
      result.strength = 'medium';
    } else if (result.score >= 2) {
      result.strength = 'weak';
    } else {
      result.strength = 'very weak';
    }

    return result;
  },

  /**
   * Generate a secure random password
   * @param {number} length - Password length
   * @returns {string} Generated password
   */
  generateSecurePassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }
};

/**
 * JWT utility functions
 */
const jwtUtils = {
  /**
   * Generate access token
   * @param {string} userId - User ID
   * @param {Object} payload - Additional payload
   * @returns {string} JWT token
   */
  generateAccessToken(userId, payload = {}) {
    return jwt.sign(
      { userId, ...payload },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { 
        expiresIn: process.env.JWT_EXPIRE || '7d',
        issuer: 'stock-predictor-api',
        audience: 'stock-predictor-client'
      }
    );
  },

  /**
   * Generate refresh token
   * @param {string} userId - User ID
   * @returns {string} Refresh token
   */
  generateRefreshToken(userId) {
    return jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { 
        expiresIn: '30d',
        issuer: 'stock-predictor-api',
        audience: 'stock-predictor-client'
      }
    );
  },

  /**
   * Generate password reset token
   * @param {string} userId - User ID
   * @returns {string} Reset token
   */
  generateResetToken(userId) {
    return jwt.sign(
      { userId, type: 'reset' },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { 
        expiresIn: '1h',
        issuer: 'stock-predictor-api',
        audience: 'stock-predictor-client'
      }
    );
  },

  /**
   * Generate email verification token
   * @param {string} userId - User ID
   * @returns {string} Verification token
   */
  generateVerificationToken(userId) {
    return jwt.sign(
      { userId, type: 'verification' },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { 
        expiresIn: '24h',
        issuer: 'stock-predictor-api',
        audience: 'stock-predictor-client'
      }
    );
  },

  /**
   * Verify and decode JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded payload
   */
  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key', {
      issuer: 'stock-predictor-api',
      audience: 'stock-predictor-client'
    });
  },

  /**
   * Decode JWT token without verification (for debugging)
   * @param {string} token - JWT token
   * @returns {Object} Decoded payload
   */
  decodeToken(token) {
    return jwt.decode(token, { complete: true });
  },

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} True if expired
   */
  isTokenExpired(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  },

  /**
   * Get token expiration time
   * @param {string} token - JWT token
   * @returns {Date|null} Expiration date
   */
  getTokenExpiration(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return null;
      
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }
};

/**
 * Session utility functions
 */
const sessionUtils = {
  /**
   * Generate session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  },

  /**
   * Generate CSRF token
   * @returns {string} CSRF token
   */
  generateCSRFToken() {
    return crypto.randomBytes(16).toString('hex');
  },

  /**
   * Create session data
   * @param {Object} user - User object
   * @returns {Object} Session data
   */
  createSessionData(user) {
    return {
      userId: user._id,
      email: user.email,
      name: user.profile?.name,
      investmentExperience: user.profile?.investmentExperience,
      riskTolerance: user.profile?.riskTolerance,
      lastActivity: new Date(),
      createdAt: new Date()
    };
  },

  /**
   * Update session activity
   * @param {Object} sessionData - Current session data
   * @returns {Object} Updated session data
   */
  updateSessionActivity(sessionData) {
    return {
      ...sessionData,
      lastActivity: new Date()
    };
  },

  /**
   * Check if session is expired
   * @param {Object} sessionData - Session data
   * @param {number} maxAge - Max age in milliseconds
   * @returns {boolean} True if expired
   */
  isSessionExpired(sessionData, maxAge = 7 * 24 * 60 * 60 * 1000) {
    if (!sessionData || !sessionData.lastActivity) return true;
    
    const now = new Date();
    const lastActivity = new Date(sessionData.lastActivity);
    
    return (now - lastActivity) > maxAge;
  }
};

/**
 * Security utility functions
 */
const securityUtils = {
  /**
   * Generate secure random string
   * @param {number} length - String length
   * @returns {string} Random string
   */
  generateRandomString(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  },

  /**
   * Hash sensitive data
   * @param {string} data - Data to hash
   * @returns {string} Hashed data
   */
  hashData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  },

  /**
   * Sanitize user input
   * @param {string} input - User input
   * @returns {string} Sanitized input
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  },

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Check for suspicious activity patterns
   * @param {Object} requestData - Request data
   * @returns {Object} Security assessment
   */
  assessSecurityRisk(requestData) {
    const risk = {
      level: 'low',
      factors: [],
      score: 0
    };

    // Check for rapid requests
    if (requestData.requestCount > 100) {
      risk.factors.push('High request frequency');
      risk.score += 2;
    }

    // Check for unusual user agent
    if (!requestData.userAgent || requestData.userAgent.length < 10) {
      risk.factors.push('Suspicious user agent');
      risk.score += 1;
    }

    // Check for multiple failed attempts
    if (requestData.failedAttempts > 5) {
      risk.factors.push('Multiple failed attempts');
      risk.score += 3;
    }

    // Determine risk level
    if (risk.score >= 5) {
      risk.level = 'high';
    } else if (risk.score >= 3) {
      risk.level = 'medium';
    }

    return risk;
  }
};

module.exports = {
  passwordUtils,
  jwtUtils,
  sessionUtils,
  securityUtils
};