const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
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
} = require('../utils/authUtils');

describe('Authentication Utilities', () => {
  
  describe('Token Generation', () => {
    test('should generate valid access token', () => {
      const userId = '507f1f77bcf86cd799439011';
      const token = generateToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verify token structure
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
      expect(decoded.userId).toBe(userId);
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });

    test('should generate valid refresh token', () => {
      const userId = '507f1f77bcf86cd799439011';
      const refreshToken = generateRefreshToken(userId);

      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');

      // Verify token structure
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
      expect(decoded.userId).toBe(userId);
      expect(decoded.type).toBe('refresh');
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });

    test('should generate different tokens for different users', () => {
      const userId1 = '507f1f77bcf86cd799439011';
      const userId2 = '507f1f77bcf86cd799439012';
      
      const token1 = generateToken(userId1);
      const token2 = generateToken(userId2);

      expect(token1).not.toBe(token2);

      const decoded1 = jwt.verify(token1, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
      const decoded2 = jwt.verify(token2, process.env.JWT_SECRET || 'your-super-secret-jwt-key');

      expect(decoded1.userId).toBe(userId1);
      expect(decoded2.userId).toBe(userId2);
    });
  });

  describe('Password Hashing', () => {
    test('should hash password correctly', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hashes are typically 60 chars
    });

    test('should generate different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Due to salt, hashes should be different
    });

    test('should compare password correctly', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hashedPassword = await hashPassword(password);

      const isCorrect = await comparePassword(password, hashedPassword);
      const isWrong = await comparePassword(wrongPassword, hashedPassword);

      expect(isCorrect).toBe(true);
      expect(isWrong).toBe(false);
    });
  });

  describe('Token Verification', () => {
    test('should verify valid token', () => {
      const userId = '507f1f77bcf86cd799439011';
      const token = generateToken(userId);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(userId);
    });

    test('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow();
    });

    test('should throw error for expired token', () => {
      const userId = '507f1f77bcf86cd799439011';
      const expiredToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        { expiresIn: '-1s' }
      );

      expect(() => {
        verifyToken(expiredToken);
      }).toThrow('jwt expired');
    });
  });

  describe('Token Extraction', () => {
    test('should extract token from valid authorization header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const authHeader = `Bearer ${token}`;
      const extractedToken = extractToken(authHeader);

      expect(extractedToken).toBe(token);
    });

    test('should return null for invalid authorization header', () => {
      expect(extractToken('Invalid header')).toBeNull();
      expect(extractToken('Basic token')).toBeNull();
      expect(extractToken('')).toBeNull();
      expect(extractToken(null)).toBeNull();
      expect(extractToken(undefined)).toBeNull();
    });

    test('should return null for header without Bearer prefix', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const extractedToken = extractToken(token);

      expect(extractedToken).toBeNull();
    });
  });

  describe('Secure Token Generation', () => {
    test('should generate secure random token', () => {
      const token = generateSecureToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex chars
    });

    test('should generate tokens of specified length', () => {
      const token16 = generateSecureToken(16);
      const token64 = generateSecureToken(64);

      expect(token16.length).toBe(32); // 16 bytes = 32 hex chars
      expect(token64.length).toBe(128); // 64 bytes = 128 hex chars
    });

    test('should generate different tokens each time', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe('Token Expiration', () => {
    test('should detect expired token', () => {
      const expiredToken = {
        userId: '507f1f77bcf86cd799439011',
        exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      };

      expect(isTokenExpired(expiredToken)).toBe(true);
    });

    test('should detect valid token', () => {
      const validToken = {
        userId: '507f1f77bcf86cd799439011',
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      };

      expect(isTokenExpired(validToken)).toBe(false);
    });

    test('should get token expiration date', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const token = {
        userId: '507f1f77bcf86cd799439011',
        exp: futureTime
      };

      const expirationDate = getTokenExpiration(token);
      expect(expirationDate).toBeInstanceOf(Date);
      expect(expirationDate.getTime()).toBe(futureTime * 1000);
    });
  });

  describe('Password Strength Validation', () => {
    test('should validate strong password', () => {
      const result = validatePasswordStrength('StrongPass123!');

      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(4);
    });

    test('should reject weak password', () => {
      const result = validatePasswordStrength('123');

      expect(result.isValid).toBe(false);
      expect(result.feedback).toContain('Password must be at least 6 characters long');
    });

    test('should reject empty password', () => {
      const result = validatePasswordStrength('');

      expect(result.isValid).toBe(false);
      expect(result.feedback).toContain('Password is required');
    });

    test('should provide feedback for missing elements', () => {
      const result = validatePasswordStrength('password');

      expect(result.isValid).toBe(false);
      expect(result.feedback).toContain('Password should contain uppercase letters');
      expect(result.feedback).toContain('Password should contain numbers');
      expect(result.feedback).toContain('Password should contain special characters');
    });

    test('should accept minimum valid password', () => {
      const result = validatePasswordStrength('Pass1!');

      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(4);
    });
  });
});