# Integration Guide - Multi-Tenant Auth Service

## Overview
This guide shows how to integrate our authentication service into your application.

---

## Architecture

```
Your Application  <---->  Auth Service API  <---->  Database
   (Client)              (http://auth-api.com)
```

---

## Integration Flow

### 1. Register Your Organization (One-time)

**Endpoint:** `POST /api/tenant/register`

```javascript
// Your backend calls this once to register your organization
const response = await fetch('http://localhost:5000/api/tenant/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Your Company Name',
    email: 'admin@yourcompany.com',
    mobile: '+1234567890',
    password: 'secure_password'
  })
});

const data = await response.json();
// Save tenant.id and tenant.slug for future use
```

**Response:**
```json
{
  "message": "Tenant registered successfully",
  "tenant": {
    "id": "uuid-here",
    "name": "Your Company Name",
    "email": "admin@yourcompany.com",
    "slug": "your-company-name"
  }
}
```

---

### 2. Login (Tenant or User)

**Endpoint:** `POST /api/login`

```javascript
// In your login page
const response = await fetch('http://localhost:5000/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
// Store data.token in cookies/localStorage
// Store data.user information
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "tenant_id": "tenant-uuid",
    "tenant_name": "Your Company"
  }
}
```

---

### 3. Create Users (Tenant Only)

**Endpoint:** `POST /api/tenant/users`

```javascript
// Tenant creates users in their organization
const response = await fetch('http://localhost:5000/api/tenant/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${tenantToken}`,
    'x-tenant-slug': 'your-company-name'
  },
  body: JSON.stringify({
    name: 'New User',
    email: 'newuser@example.com',
    password: 'password123',
    role: 'user'
  })
});
```

---

### 4. Protect Your Routes

**In Your Backend:**

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify token with auth service
    const response = await fetch('http://localhost:5000/api/protected', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    const data = await response.json();
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
}

// Use in your routes
app.get('/api/my-protected-route', verifyToken, (req, res) => {
  res.json({ message: 'Protected data', user: req.user });
});
```

---

### 5. Frontend Integration

**React Example:**

```javascript
// services/auth.js
const AUTH_API = 'http://localhost:5000/api';

export const login = async (email, password) => {
  const response = await fetch(`${AUTH_API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Store token
    document.cookie = `token=${data.token}; path=/; max-age=604800`;
    return data;
  }
  
  throw new Error(data.message);
};

export const getAuthToken = () => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];
};

// Use in API calls
export const fetchProtectedData = async () => {
  const token = getAuthToken();
  
  const response = await fetch('http://your-api.com/data', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

---

## API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/tenant/register` | Register organization | No |
| POST | `/api/login` | Login (tenant/user) | No |
| POST | `/api/tenant/users` | Create user | Yes (Tenant) |
| GET | `/api/tenant/users` | List users | Yes (Tenant) |
| PUT | `/api/tenant/users/:id` | Update user | Yes (Tenant) |
| DELETE | `/api/tenant/users/:id` | Delete user | Yes (Tenant) |
| PUT | `/api/tenant/profile` | Update tenant profile | Yes (Tenant) |
| GET | `/api/protected` | Verify token | Yes |

---

## Integration Examples

### Example 1: E-commerce Platform

```javascript
// Your e-commerce app uses auth service for user management
// 1. Register your store as a tenant
// 2. Create customer accounts via API
// 3. Customers login through auth service
// 4. Verify tokens on checkout/orders
```

### Example 2: SaaS Application

```javascript
// Your SaaS uses auth service for multi-tenant access
// 1. Each client company registers as tenant
// 2. They manage their team members
// 3. All authentication handled by auth service
// 4. Your app focuses on business logic
```

### Example 3: Mobile App

```javascript
// Mobile app backend integration
// 1. App calls auth service for login
// 2. Stores JWT token locally
// 3. Sends token with every API request
// 4. Backend verifies token with auth service
```

---

## Security Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** (HttpOnly cookies recommended)
3. **Implement token refresh** for long sessions
4. **Validate tokens** on every protected request
5. **Use environment variables** for API URLs
6. **Implement rate limiting** on your side too
7. **Log authentication events** for security audit

---

## Environment Configuration

```env
# Your application .env
AUTH_SERVICE_URL=http://localhost:5000/api
AUTH_SERVICE_TENANT_SLUG=your-company-name
JWT_SECRET=your_jwt_secret_key_change_this
```

---

## Error Handling

```javascript
try {
  const response = await fetch(`${AUTH_API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    // Handle specific errors
    switch (response.status) {
      case 401:
        throw new Error('Invalid credentials');
      case 404:
        throw new Error('User not found');
      case 500:
        throw new Error('Server error');
      default:
        throw new Error(data.message || 'Authentication failed');
    }
  }
  
  return data;
} catch (error) {
  console.error('Auth error:', error);
  throw error;
}
```

---

## Testing Integration

```javascript
// Test script
const testAuth = async () => {
  // 1. Register tenant
  console.log('Registering tenant...');
  const tenant = await registerTenant({
    name: 'Test Company',
    email: 'test@test.com',
    mobile: '1234567890',
    password: 'test123'
  });
  
  // 2. Login as tenant
  console.log('Logging in...');
  const loginData = await login('test@test.com', 'test123');
  
  // 3. Create user
  console.log('Creating user...');
  await createUser(loginData.token, {
    name: 'Test User',
    email: 'user@test.com',
    password: 'user123'
  });
  
  // 4. Login as user
  console.log('User login...');
  const userData = await login('user@test.com', 'user123');
  
  console.log('Integration test passed!');
};
```

---

## Support & Documentation

- **API Base URL:** `http://localhost:5000/api`
- **Production URL:** `https://your-auth-service.com/api`
- **Support:** support@your-auth-service.com
- **Documentation:** https://docs.your-auth-service.com

---

## Pricing (If offering as service)

- **Free Tier:** Up to 100 users
- **Startup:** $29/month - Up to 1,000 users
- **Business:** $99/month - Up to 10,000 users
- **Enterprise:** Custom pricing

---

## Next Steps

1. Register your organization
2. Get your tenant slug
3. Integrate login in your app
4. Test authentication flow
5. Deploy to production
6. Monitor usage and errors
