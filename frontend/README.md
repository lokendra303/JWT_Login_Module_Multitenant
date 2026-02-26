# Multi-Tenant Auth Frontend

React frontend for the JWT Multi-Tenant Authentication System.

## Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

The app will run on http://localhost:3000

## Features

- **Tenant Registration & Login**: Companies can register and manage their users
- **User Login**: Users login with tenant ID, email, and password
- **Dashboard**: 
  - Tenants can view and create users
  - Users can view their profile
- **Protected Routes**: Authentication required for dashboard access

## Flow

1. **Tenant Flow**:
   - Register at `/tenant/register`
   - Login at `/tenant/login`
   - Access dashboard to manage users

2. **User Flow**:
   - Tenant creates user account
   - User logs in at `/login` with tenant ID
   - Access dashboard

## API Endpoints Used

- POST `/api/tenant/register` - Register tenant
- POST `/api/tenant/login` - Tenant login
- POST `/api/tenant/users` - Create user (tenant only)
- GET `/api/tenant/users` - Get all users (tenant only)
- POST `/api/login` - User login

## Backend Configuration

Ensure backend is running on http://localhost:5000
