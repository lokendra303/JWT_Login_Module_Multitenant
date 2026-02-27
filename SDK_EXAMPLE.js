// Auth Service SDK - Easy integration for any project
// Usage: npm install axios

class AuthServiceSDK {
  constructor(baseURL, tenantSlug = null) {
    this.baseURL = baseURL || 'http://localhost:5000/api';
    this.tenantSlug = tenantSlug;
    this.token = null;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
  }

  // Get stored token
  getToken() {
    return this.token;
  }

  // Register new tenant/organization
  async registerTenant(data) {
    const response = await fetch(`${this.baseURL}/tenant/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this._handleResponse(response);
  }

  // Login (tenant or user)
  async login(email, password) {
    const response = await fetch(`${this.baseURL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await this._handleResponse(response);
    
    // Auto-store token
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  // Create user (tenant only)
  async createUser(userData) {
    const response = await fetch(`${this.baseURL}/tenant/users`, {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify(userData)
    });
    return this._handleResponse(response);
  }

  // Get all users (tenant only)
  async getUsers() {
    const response = await fetch(`${this.baseURL}/tenant/users`, {
      method: 'GET',
      headers: this._getHeaders()
    });
    return this._handleResponse(response);
  }

  // Update user (tenant only)
  async updateUser(userId, userData) {
    const response = await fetch(`${this.baseURL}/tenant/users/${userId}`, {
      method: 'PUT',
      headers: this._getHeaders(),
      body: JSON.stringify(userData)
    });
    return this._handleResponse(response);
  }

  // Delete user (tenant only)
  async deleteUser(userId) {
    const response = await fetch(`${this.baseURL}/tenant/users/${userId}`, {
      method: 'DELETE',
      headers: this._getHeaders()
    });
    return this._handleResponse(response);
  }

  // Update tenant profile
  async updateProfile(profileData) {
    const response = await fetch(`${this.baseURL}/tenant/profile`, {
      method: 'PUT',
      headers: this._getHeaders(),
      body: JSON.stringify(profileData)
    });
    return this._handleResponse(response);
  }

  // Verify token
  async verifyToken() {
    const response = await fetch(`${this.baseURL}/protected`, {
      method: 'GET',
      headers: this._getHeaders()
    });
    return this._handleResponse(response);
  }

  // Private: Get headers with auth
  _getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    if (this.tenantSlug) {
      headers['x-tenant-slug'] = this.tenantSlug;
    }
    
    return headers;
  }

  // Private: Handle API response
  async _handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthServiceSDK;
}

// ============================================
// USAGE EXAMPLES
// ============================================

// Example 1: Node.js Backend Integration
async function exampleNodeJS() {
  const AuthSDK = require('./auth-sdk');
  const auth = new AuthSDK('http://localhost:5000/api');

  try {
    // Register your organization
    const tenant = await auth.registerTenant({
      name: 'My Company',
      email: 'admin@mycompany.com',
      mobile: '1234567890',
      password: 'secure_password'
    });
    console.log('Tenant registered:', tenant);

    // Login as tenant
    const loginData = await auth.login('admin@mycompany.com', 'secure_password');
    console.log('Logged in:', loginData);

    // Create a user
    const user = await auth.createUser({
      name: 'John Doe',
      email: 'john@mycompany.com',
      password: 'user_password',
      role: 'user'
    });
    console.log('User created:', user);

    // Get all users
    const users = await auth.getUsers();
    console.log('All users:', users);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 2: React Frontend Integration
function exampleReact() {
  // In your React app
  const auth = new AuthServiceSDK('http://localhost:5000/api');

  // Login component
  const handleLogin = async (email, password) => {
    try {
      const data = await auth.login(email, password);
      
      // Store token in cookie
      document.cookie = `token=${data.token}; path=/; max-age=604800`;
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      alert(error.message);
    }
  };

  return { handleLogin };
}

// Example 3: Express.js Middleware
function exampleExpressMiddleware() {
  const AuthSDK = require('./auth-sdk');
  const auth = new AuthSDK('http://localhost:5000/api');

  // Middleware to verify token
  const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      auth.setToken(token);
      const userData = await auth.verifyToken();
      req.user = userData.user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };

  // Use in routes
  const express = require('express');
  const app = express();

  app.get('/api/protected-route', authMiddleware, (req, res) => {
    res.json({ message: 'Protected data', user: req.user });
  });

  return app;
}

// Example 4: Vue.js Integration
function exampleVue() {
  // In your Vue app
  import AuthServiceSDK from './auth-sdk';

  export default {
    data() {
      return {
        auth: new AuthServiceSDK('http://localhost:5000/api'),
        email: '',
        password: ''
      };
    },
    methods: {
      async login() {
        try {
          const data = await this.auth.login(this.email, this.password);
          this.$cookies.set('token', data.token);
          this.$router.push('/dashboard');
        } catch (error) {
          alert(error.message);
        }
      }
    }
  };
}

// Example 5: Angular Integration
function exampleAngular() {
  // auth.service.ts
  import { Injectable } from '@angular/core';
  import AuthServiceSDK from './auth-sdk';

  @Injectable({ providedIn: 'root' })
  export class AuthService {
    private auth = new AuthServiceSDK('http://localhost:5000/api');

    async login(email: string, password: string) {
      const data = await this.auth.login(email, password);
      localStorage.setItem('token', data.token);
      return data;
    }

    async createUser(userData: any) {
      return await this.auth.createUser(userData);
    }
  }
}
