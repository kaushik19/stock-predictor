const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication Fix...\n');

    // Test 1: Register a new user
    console.log('1. Testing Registration...');
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      profile: {
        name: 'Test User'
      }
    };

    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData);
      console.log('✅ Registration successful');
      console.log('Token received:', !!registerResponse.data.token);
      console.log('User data:', registerResponse.data.user?.profile?.name);
      
      const token = registerResponse.data.token;

      // Test 2: Get profile using the token
      console.log('\n2. Testing Get Profile...');
      const profileResponse = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Profile fetch successful');
      console.log('Profile name:', profileResponse.data.user?.profile?.name);

      // Test 3: Update profile
      console.log('\n3. Testing Profile Update...');
      const updateData = {
        profile: {
          name: 'Updated Test User',
          investmentExperience: 'intermediate'
        }
      };
      const updateResponse = await axios.put(`${API_BASE}/auth/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Profile update successful');
      console.log('Updated name:', updateResponse.data.user?.profile?.name);

      // Test 4: Login with the same credentials
      console.log('\n4. Testing Login...');
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, loginData);
      console.log('✅ Login successful');
      console.log('Login token received:', !!loginResponse.data.token);

      console.log('\n🎉 All authentication tests passed!');

    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️  User already exists, testing login instead...');
        
        // Test login with existing user
        const loginData = {
          email: 'test@example.com',
          password: 'password123'
        };
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, loginData);
        console.log('✅ Login successful');
        
        const token = loginResponse.data.token;
        
        // Test profile fetch
        const profileResponse = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Profile fetch successful');
        console.log('Profile name:', profileResponse.data.user?.profile?.name);
        
        console.log('\n🎉 Authentication is working!');
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('❌ Authentication test failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Errors:', error.response?.data?.errors);
  }
}

// Run the test
testAuth();