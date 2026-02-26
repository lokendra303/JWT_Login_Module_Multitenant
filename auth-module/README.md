# JWT Multi-Tenant Authentication Module

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
- Update `.env` with your database credentials and JWT secret

3. **Create database:**
```bash
mysql -u root -p < schema.sql
```

4. **Start server:**
```bash
npm start
# or for development
npm run dev
```

## API Endpoints

### Login
```
POST /api/login
Headers: x-tenant-slug: tenant1
Body: { "email": "user@example.com", "password": "password123" }
Response: { "accessToken": "...", "refreshToken": "..." }
```

## Architecture

- **Multi-tenant**: Each tenant isolated by tenant_id
- **JWT Authentication**: Access tokens (15m) + Refresh tokens (7d)
- **Role-based Authorization**: Middleware for permission control
- **Repository Pattern**: Clean separation of data access

## Middleware

- `resolveTenant`: Identifies tenant from header/subdomain
- `authenticate`: Verifies JWT token
- `authorize`: Checks user roles/permissions
