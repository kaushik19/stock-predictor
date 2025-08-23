const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authenticate, optionalAuth, authorize, authorizeByExperience } = require('../middleware/auth');

// Mock Redis functions to avoid dependency
jest.mock('../config/database', () => ({
  getFromCache: jest.fn(),
  setCache: jest.fn(),
  deleteFromCache: jest.fn()
}));

const { getFromCache } = require('../config/database');

describe('Authentication Middleware - Unit Tests', () => {
  let mockReq, mockRes, mockNext;
  let testUser;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request, response, and next
    mockReq = {
      headers: {},
      user: null,
      userId: null
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    mockNext = jest.fn();

    // Mock test user
    testUser = {
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      isActive: true,
      profile: {
        investmentExperience: 'intermediate',
        riskTolerance: 'medium'
      }
    };

    // Mock User.findById to return test user
    jest.spyOn(User, 'findById').mockResolvedValue(testUser);
    
    // Mock cache to return user session
    getFromCache.mockImplementation((key) => {
      if (key.startsWith('user_session_')) {
        return Promise.resolve({
          userId: testUser._id,
          email: testUser.email,
          lastLogin: new Date()
        });
      }
      if (key.startsWith('blacklisted_token_')) {
        return Promise.resolve(null); // Token not blacklisted
      }
      return Promise.resolve(null);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('authenticate middleware', () => {
    test('should authenticate valid token', async () => {
      const token = jwt.sign(
        { userId: testUser._id },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        { expiresIn: '1h' }
      );

      mockReq.headers.authorization = `Bearer ${token}`;

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toEqual(testUser);
      expect(mockReq.userId).toBe(testUser._id);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should reject request without authorization header', async () => {
      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. No token provided.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject request with invalid authorization format', async () => {
      mockReq.headers.authorization = 'InvalidFormat token';

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. No token provided.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject blacklisted token', async () => {
      const token = jwt.sign(
        { userId: testUser._id },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        { expiresIn: '1h' }
      );

      mockReq.headers.authorization = `Bearer ${token}`;
      
      // Mock token as blacklisted
      getFromCache.mockImplementation((key) => {
        if (key.startsWith('blacklisted_token_')) {
          return Promise.resolve(true);
        }
        return Promise.resolve(null);
      });

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token has been invalidated'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: testUser._id },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        { expiresIn: '-1s' }
      );

      mockReq.headers.authorization = `Bearer ${expiredToken}`;

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token expired'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject invalid token', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject when user not found', async () => {
      const token = jwt.sign(
        { userId: testUser._id },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        { expiresIn: '1h' }
      );

      mockReq.headers.authorization = `Bearer ${token}`;
      User.findById.mockResolvedValue(null);

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject inactive user', async () => {
      const token = jwt.sign(
        { userId: testUser._id },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        { expiresIn: '1h' }
      );

      mockReq.headers.authorization = `Bearer ${token}`;
      testUser.isActive = false;

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Account is deactivated'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject when session not found', async () => {
      const token = jwt.sign(
        { userId: testUser._id },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        { expiresIn: '1h' }
      );

      mockReq.headers.authorization = `Bearer ${token}`;
      
      // Mock no session found
      getFromCache.mockImplementation((key) => {
        if (key.startsWith('user_session_')) {
          return Promise.resolve(null);
        }
        return Promise.resolve(null);
      });

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Session expired. Please login again.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth middleware', () => {
    test('should provide user context with valid token', async () => {
      const token = jwt.sign(
        { userId: testUser._id },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        { expiresIn: '1h' }
      );

      mockReq.headers.authorization = `Bearer ${token}`;

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toEqual(testUser);
      expect(mockReq.userId).toBe(testUser._id);
    });

    test('should continue without user context when no token provided', async () => {
      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeNull();
      expect(mockReq.userId).toBeNull();
    });

    test('should continue without user context when invalid token provided', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeNull();
      expect(mockReq.userId).toBeNull();
    });

    test('should continue without user context when user not found', async () => {
      const token = jwt.sign(
        { userId: testUser._id },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        { expiresIn: '1h' }
      );

      mockReq.headers.authorization = `Bearer ${token}`;
      User.findById.mockResolvedValue(null);

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeNull();
      expect(mockReq.userId).toBeNull();
    });
  });

  describe('authorize middleware', () => {
    test('should allow access when no roles specified', () => {
      mockReq.user = testUser;
      const middleware = authorize();

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should deny access when user not authenticated', () => {
      const middleware = authorize(['admin']);

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should deny access when user lacks required role', () => {
      mockReq.user = testUser;
      const middleware = authorize(['admin']);

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should allow access when user has required role', () => {
      mockReq.user = { ...testUser, role: 'admin' };
      const middleware = authorize(['admin']);

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('authorizeByExperience middleware', () => {
    test('should allow access when no experience levels specified', () => {
      mockReq.user = testUser;
      const middleware = authorizeByExperience();

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should deny access when user not authenticated', () => {
      const middleware = authorizeByExperience(['expert']);

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should deny access when user lacks required experience', () => {
      mockReq.user = testUser;
      const middleware = authorizeByExperience(['expert']);

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'This feature requires expert investment experience'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should allow access when user has required experience', () => {
      mockReq.user = {
        ...testUser,
        profile: {
          ...testUser.profile,
          investmentExperience: 'expert'
        }
      };
      const middleware = authorizeByExperience(['expert']);

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should allow access when user has one of multiple required experiences', () => {
      mockReq.user = {
        ...testUser,
        profile: {
          ...testUser.profile,
          investmentExperience: 'intermediate'
        }
      };
      const middleware = authorizeByExperience(['intermediate', 'expert']);

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should handle missing profile gracefully', () => {
      mockReq.user = { ...testUser, profile: null };
      const middleware = authorizeByExperience(['expert']);

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'This feature requires expert investment experience'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});