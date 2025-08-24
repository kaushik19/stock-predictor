const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Create a simple app for testing without Redis dependencies
const express = require('express');
const authRoutes = require('../routes/auth');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

beforeEach(async () => {
  // Clean up test data before each test
  await User.deleteMany({});
});

describe('Authentication System - Core Functionality', () => {
  
  describe('POST /api/auth/register', () => {
    test('should register a new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        profile: {
          name: 'Test User',
          investmentExperience: 'beginner',
          riskTolerance: 'medium'
        }
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
      expect(response.body.token).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();

      // Verify user was created in database
      const user = await User.findByEmail(userData.email);
      expect(user).toBeTruthy();
      expect(user.profile.name).toBe(userData.profile.name);
    });

    test('should not register user with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        profile: {
          name: 'Test User'
        }
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
      expect(response.body.errors).toContain('Please provide a valid email address');
    });

    test('should not register user with short password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        profile: {
          name: 'Test User'
        }
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Password must be at least 6 characters long');
    });

    test('should not register user with duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        profile: {
          name: 'Test User'
        }
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User with this email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      // Create a test user
      testUser = new User({
        email: 'test@example.com',
        password: 'password123',
        profile: {
          name: 'Test User'
        }
      });
      await testUser.save();
    });

    test('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.token).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();

      // Verify token is valid
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
      expect(decoded.userId).toBe(testUser._id.toString());
    });

    test('should not login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    test('should not login with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    test('should not login inactive user', async () => {
      // Deactivate user
      testUser.isActive = false;
      await testUser.save();

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account is deactivated. Please contact support.');
    });
  });

  describe('GET /api/auth/me', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      // Create and login test user
      testUser = new User({
        email: 'test@example.com',
        password: 'password123',
        profile: {
          name: 'Test User',
          investmentExperience: 'intermediate'
        }
      });
      await testUser.save();

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      authToken = loginResponse.body.token;
    });

    test('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.profile.name).toBe('Test User');
      expect(response.body.user.password).toBeUndefined();
    });

    test('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No token provided');
    });

    test('should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired token');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let testUser;
    let refreshToken;

    beforeEach(async () => {
      // Create and login test user
      testUser = new User({
        email: 'test@example.com',
        password: 'password123',
        profile: {
          name: 'Test User'
        }
      });
      await testUser.save();

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      refreshToken = loginResponse.body.refreshToken;
    });

    test('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token refreshed successfully');
      expect(response.body.token).toBeDefined();

      // New token should be valid
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
      expect(decoded.userId).toBe(testUser._id.toString());
    });

    test('should not refresh with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired refresh token');
    });

    test('should not refresh without refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Refresh token is required');
    });
  });
});

describe('JWT Token Validation', () => {
  test('should generate valid JWT tokens', () => {
    const userId = '507f1f77bcf86cd799439011';
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { expiresIn: '7d' }
    );

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
    expect(decoded.userId).toBe(userId);
    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();
  });

  test('should detect expired tokens', () => {
    const userId = '507f1f77bcf86cd799439011';
    const expiredToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { expiresIn: '-1s' } // Already expired
    );

    expect(() => {
      jwt.verify(expiredToken, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
    }).toThrow('jwt expired');
  });

  test('should detect invalid tokens', () => {
    expect(() => {
      jwt.verify('invalid-token', process.env.JWT_SECRET || 'your-super-secret-jwt-key');
    }).toThrow('jwt malformed');
  });
});