# Quick Start - Testing Guide

## 1. Setup Database
```bash
# Create database and tables only
mysql -u root -p < schema.sql
```

## 2. Configure Environment
Update `.env` file with your database credentials

## 3. Install & Start
```bash
npm install
npm start
```

## 4. Test with Postman - Complete Flow

### Step 1: Register Tenant (FIRST - REQUIRED)
```
POST http://localhost:5000/api/tenant/register

Headers:
  Content-Type: application/json

Body:
{
  "name": "Tenant One",
  "slug": "tenant1"
}

Response:
{
  "message": "Tenant registered successfully",
  "tenant": {
    "id": "uuid",
    "name": "Tenant One",
    "slug": "tenant1"
  }
}
```

### Step 2: Register User
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
```

### Step 3: Login
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

Response: Copy the "accessToken"
```

### Step 4: Access Protected Route
```
GET http://localhost:5000/api/protected

Headers:
  Authorization: Bearer <PASTE_ACCESS_TOKEN_HERE>
  x-tenant-slug: tenant1
```

## 5. Test Multi-Tenancy

Register another tenant:
```
POST http://localhost:5000/api/tenant/register

Body:
{
  "name": "Tenant Two",
  "slug": "tenant2"
}
```

Then register same email in tenant2:
```
x-tenant-slug: tenant2
email: john@example.com
```

Both will work! Users are isolated per tenant.

## Available Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | /api/tenant/register | No | Register new tenant |
| POST | /api/register | No | Register new user |
| POST | /api/login | No | Login user |
| GET | /api/protected | Yes | Test protected route |

## Notes
- **IMPORTANT**: Register tenant FIRST before registering users
- User endpoints require `x-tenant-slug` header
- Protected routes require `Authorization: Bearer <token>` header
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
