# API Testing Guide

## Setup for Testing

1. **Run the database schema:**
```bash
mysql -u root -p < schema.sql
```

2. **Insert seed data:**
```bash
mysql -u root -p < seed.sql
```

3. **Start the server:**
```bash
npm start
```

## Postman Testing

### Import Collection
- Import `postman_collection.json` into Postman

### Test Flow

#### 1. Register a New User
```
POST http://localhost:5000/api/register
Headers:
  Content-Type: application/json
  x-tenant-slug: tenant1

Body:
{
  "email": "john@example.com",
  "password": "password123",
  "name": "John Doe"
}

Expected Response (201):
{
  "message": "User registered successfully",
  "userId": "uuid-here"
}
```

#### 2. Login
```
POST http://localhost:5000/api/login
Headers:
  Content-Type: application/json
  x-tenant-slug: tenant1

Body:
{
  "email": "john@example.com",
  "password": "password123"
}

Expected Response (200):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "uuid-refresh-token"
}
```

#### 3. Access Protected Route (Copy accessToken from login response)
```
GET http://localhost:5000/api/protected
Headers:
  Authorization: Bearer YOUR_ACCESS_TOKEN
  x-tenant-slug: tenant1

Expected Response (200):
{
  "message": "Protected data",
  "user": { ... }
}
```

## Manual Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -H "x-tenant-slug: tenant1" \
  -d "{\"email\":\"test@example.com\",\"password\":\"pass123\",\"name\":\"Test User\"}"
```

### Login
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -H "x-tenant-slug: tenant1" \
  -d "{\"email\":\"test@example.com\",\"password\":\"pass123\"}"
```

## Test Different Tenants

Change the `x-tenant-slug` header to test multi-tenancy:
- `tenant1` - First tenant
- `tenant2` - Second tenant

Users registered in tenant1 cannot login to tenant2 and vice versa.

## Common Errors

- **400**: Tenant required - Missing `x-tenant-slug` header
- **404**: Tenant not found - Invalid tenant slug
- **401**: Invalid credentials - Wrong email/password
- **409**: Email already exists - User already registered
