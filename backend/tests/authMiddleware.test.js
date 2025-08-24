const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { User } = require('../models');
const { authenticate, optionalAuth, authorize, authorizeByExperience } = require('../middleware/auth');
const { generateToken } = require('../utils/authUtils');

// Create a simple test app
const app = express();
app.use(express.json());

// Test routes
app.get('/protected', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Access granted',
    user: {
      id: req.user._id,
      email: req.user.email
    }
  });
});

app.get('/optional', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Access granted',
    authenticated: !!req.user,
    user: req.user ? {
      id: req.user._id,
      email: req.user.email
    } : null
  });
});

app.get('/admin-only', authenticate, authorize(['admin']), (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted'
  });
});

app.get('/expert-only', authenticate, authorizeByExperience(['expert']), (req, res) => {
  res.json({
    success: true,
    message: 'Expert access granted'
  });
});

beforeEach(async () => {
  // Clean up test data before each test
  await User.deleteMany({});
});

describe('Authentication Middleware', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    // Create test user
    testUser = new User({
      email: 'test@example.com',
      password: 'password123',
      profile: {
        name: 'Test User',
        investmentExperience: 'intermediate',
        riskTolerance: 'medium'
      }
    });
    await testUser.save();

    // Generate auth token
    authToken = generateToken(testUser._id);
  });

  describe('authenticate middleware', () => {
    test('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Access granted');
      expect(response.body.user.email).toBe('test@example.com');
    });

    test('should deny access without token', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    test('should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token');
    });

    test('should deny access with malformed authorization header', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    test('should deny access for inactive user', async () => {
      // Deactivate user
      testUser.isActive = false;
      await testUser.save();

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account is deactivated');
    });
  });

  describe('optionalAuth middleware', () => {
    test('should provide user context with valid token', async () => {
      const response = await request(app)
        .get('/optional')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.authenticated).toBe(true);
      expect(response.body.user.email).toBe('test@example.com');
    });

    test('should allow access without token', async () => {
      const response = await request(app)
        .get('/optional')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.authenticated).toBe(false);
      expect(response.body.user).toBeNull();
    });

    test('should allow access with invalid token', async () => {
      const response = await request(app)
        .get('/optional')
        .set('Authorization', 'Bearer invalid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.authenticated).toBe(false);
      expect(response.body.user).toBeNull();
    });
  });

  describe('authorize middleware', () => {
    test('should deny access for user without admin role', async () => {
      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });

    test('should require authentication first', async () => {
      const response = await request(app)
        .get('/admin-only')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });

  describe('authorizeByExperience middleware', () => {
    test('should deny access for user without expert experience', async () => {
      const response = await request(app)
        .get('/expert-only')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('This feature requires expert investment experience');
    });

    test('should allow access for expert user', async () => {
      // Update user to expert level
      testUser.profile.investmentExperience = 'expert';
      await testUser.save();

      const response = await request(app)
        .get('/expert-only')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Expert access granted');
    });

    test('should require authentication first', async () => {
      const response = await request(app)
        .get('/expert-only')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });
});