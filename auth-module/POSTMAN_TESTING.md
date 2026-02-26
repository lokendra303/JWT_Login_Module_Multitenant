# API Testing Guide - Postman

## Base URL
```
http://localhost:3000/api
```

---

## 1. Tenant Registration

**Endpoint:** `POST /tenant/register`

**Headers:** None

**Body (JSON):**
```json
{
  "name": "Acme Corporation",
  "email": "admin@acme.com",
  "mobile": "+1234567890",
  "password": "SecurePass123!",
  "slug": "acme"
}
```

**Expected Response (201):**
```json
{
  "message": "Tenant registered successfully",
  "tenant": {
    "id": "uuid-here",
    "name": "Acme Corporation",
    "email": "admin@acme.com",
    "mobile": "+1234567890",
    "slug": "acme"
  }
}
```

---

## 2. Tenant Login

**Endpoint:** `POST /tenant/login`

**Headers:** None

**Body (JSON):**
```json
{
  "email": "admin@acme.com",
  "password": "SecurePass123!"
}
```

**Expected Response (200):**
```json
{
  "message": "Tenant login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "uuid-refresh-token",
  "tenant": {
    "id": "uuid-here",
    "name": "Acme Corporation",
    "email": "admin@acme.com",
    "slug": "acme"
  }
}
```

**⚠️ Save the `accessToken` for next requests!**

---

## 3. Tenant Creates User

**Endpoint:** `POST /tenant/users`

**Headers:**
```
Authorization: Bearer <tenant_accessToken>
X-Tenant-ID: acme
```

**Body (JSON):**
```json
{
  "email": "john.doe@acme.com",
  "password": "UserPass123!",
  "name": "John Doe"
}
```

**Expected Response (201):**
```json
{
  "message": "User registered successfully",
  "userId": "user-uuid-here"
}
```

**Error if User tries (403):**
```json
{
  "message": "Insufficient permissions"
}
```

---

## 4. User Login

**Endpoint:** `POST /login`

**Headers:**
```
X-Tenant-ID: acme
```

**Body (JSON):**
```json
{
  "email": "john.doe@acme.com",
  "password": "UserPass123!"
}
```

**Expected Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "uuid-refresh-token"
}
```

**⚠️ Save the user `accessToken`!**

---

## 5. Tenant Gets All Users

**Endpoint:** `GET /tenant/users`

**Headers:**
```
Authorization: Bearer <tenant_accessToken>
X-Tenant-ID: acme
```

**Body:** None

**Expected Response (200):**
```json
{
  "users": [
    {
      "id": "user-uuid",
      "email": "john.doe@acme.com",
      "name": "John Doe",
      "tenant_id": "tenant-uuid",
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Error if User tries (403):**
```json
{
  "message": "Insufficient permissions"
}
```

---

## 6. Protected Route (Both Tenant & User)

**Endpoint:** `GET /protected`

**Headers:**
```
Authorization: Bearer <accessToken>
X-Tenant-ID: acme
```

**Body:** None

**Expected Response (200):**
```json
{
  "message": "Protected data accessed",
  "user": {
    "sub": "user-id",
    "tid": "tenant-id",
    "userType": "tenant" // or "user"
  },
  "tenant": "Acme Corporation"
}
```

---

## API Flow

### Step 1: Register Tenant
1. Use endpoint #1
2. Copy the `slug` value

### Step 2: Login as Tenant
1. Use endpoint #2
2. Copy the `accessToken`

### Step 3: Create User (as Tenant)
1. Use endpoint #3 - `POST /tenant/users`
2. Set `Authorization: Bearer <tenant_accessToken>`
3. Set `X-Tenant-ID: acme`

### Step 4: Login as User
1. Use endpoint #4
2. Set `X-Tenant-ID: acme`
3. Copy the user `accessToken`

### Step 5: Test Permissions

**✅ Tenant CAN:**
- Create users (`POST /tenant/users`)
- Get all users (`GET /tenant/users`)
- Access protected routes (endpoint #6)

**❌ User CANNOT:**
- Create users (403 Forbidden)
- Get all users (403 Forbidden)

**✅ User CAN:**
- Login (endpoint #4)
- Access protected routes (endpoint #6)

---

## Common Errors

### 401 Unauthorized
```json
{
  "message": "Invalid token"
}
```
**Fix:** Check if token is valid and not expired

### 403 Forbidden
```json
{
  "message": "Insufficient permissions"
}
```
**Fix:** User trying to access tenant-only endpoint

### 400 Bad Request
```json
{
  "message": "Email already exists"
}
```
**Fix:** Use different email or slug

---

## Postman Environment Variables

Create these variables in Postman:

| Variable | Value |
|----------|-------|
| `base_url` | `http://localhost:3000/api` |
| `tenant_token` | (set after tenant login) |
| `user_token` | (set after user login) |
| `tenant_slug` | `acme` |

**Usage in Postman:**
- URL: `{{base_url}}/tenant/login`
- Header: `Authorization: Bearer {{tenant_token}}`
- Header: `X-Tenant-ID: {{tenant_slug}}`
