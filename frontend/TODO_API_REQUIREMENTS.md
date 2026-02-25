# Backend API Roadmap for Frontend Integration

This document outlines the API requirements and data structures needed for the "Real" implementation of the Affiliate Autoposter authentication system.

## 1. Authentication Endpoints

### 1.1 Register User
- **URL**: `POST /api/auth/register`
- **Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "strongpassword123"
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "user": { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com" },
    "token": "jwt_token_here"
  }
  ```

### 1.2 Login User
- **URL**: `POST /api/auth/login`
- **Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "strongpassword123"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "user": { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com" },
    "token": "jwt_token_here"
  }
  ```

### 1.3 Get Current User (Session Check)
- **URL**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200)**:
  ```json
  {
    "user": { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com" }
  }
  ```

### 1.4 Logout
- **URL**: `POST /api/auth/logout`
- **Headers**: `Authorization: Bearer <token>`
- **Note**: Server should invalidate the token server-side if using a session-store, or frontend just discards the JWT.

### 1.5 Forgot Password
- **URL**: `POST /api/auth/forgot-password`
- **Body**:
  ```json
  {
    "email": "jane@example.com"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "message": "Password reset link sent to your email."
  }
  ```

### 1.6 Reset Password
- **URL**: `POST /api/auth/reset-password`
- **Body**:
  ```json
  {
    "token": "reset_token_from_email",
    "password": "newstrongpassword123"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "message": "Password reset successful. You can now login."
  }
  ```

### 1.7 Social Authentication (OAuth)
- **Providers**: Google, GitHub
- **Flow**:
  1. Frontend redirects to `/api/auth/login/:provider`
  2. Backend redirects to Provider
  3. Provider redirects back to `/api/auth/callback/:provider`
  4. Backend issues JWT and redirects back to Frontend with token (e.g., in a cookie or query param).

---

## 2. API Integration cURLs

### Login Example
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"password123"}'
```

### Profile Check Example
```bash
curl -H "Authorization: Bearer eyJhbGci..." \
  http://localhost:8000/api/auth/me
```

---

## 3. Frontend Implementation Plan (TODO)

- [ ] **Install Axios**: `npm install axios`
- [ ] **API Client Setup**: Create `src/api/client.ts` with base URL and interceptors for JWT.
- [ ] **Auth Service**: Create `src/api/auth.ts` containing the above endpoints as functions.
- [ ] **Refactor AuthProvider**:
    - Replace `localStorage` dummy logic with actual API calls.
    - Handle loading and error states for login/register.
    - Implement "Remember Me" using persistent token logic.
- [ ] **Secure Routes**: Enhance `ProtectedRoute` to check `GET /api/auth/me` if a token exists but no user is in state (e.g., on refresh).
- [ ] **Form Validation**: Add Zod/React Hook Form for strict input validation before API hits.

---

## 4. Frontend Data Models (Shared)

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
```
