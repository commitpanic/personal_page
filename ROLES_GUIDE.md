# Role-Based Access Control

## Overview

The API now supports role-based access control with two roles:
- **user** (default) - Can read articles, add comments, react to posts
- **admin** - Full access including create, update, and delete blog articles

---

## User Roles

### User Role (Default)
- View published articles
- Add comments to articles
- React to articles (like, love, etc.)
- Use contact form
- Standard authenticated actions

### Admin Role
- All user permissions PLUS:
- ✅ Create new blog articles
- ✅ Update existing articles
- ✅ Delete articles
- ✅ Moderate comments (coming soon)

---

## Creating Users with Roles

### Register Normal User (Default)
```json
POST /api/auth/register
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Register Admin User
```json
POST /api/auth/register
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "securepassword",
  "role": "admin"
}
```

### Response Includes Role
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 1,
    "role": "admin"
  }
}
```

---

## Login with Role Information

When you login, the response includes your role:

```json
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

---

## Protected Endpoints

### Admin-Only Endpoints

These endpoints require admin role:

#### Create Article
```http
POST /api/blog/articles
Authorization: Bearer <admin_token>
```

#### Update Article
```http
PUT /api/blog/articles/:id
Authorization: Bearer <admin_token>
```

#### Delete Article
```http
DELETE /api/blog/articles/:id
Authorization: Bearer <admin_token>
```

### Error Responses

**401 Unauthorized** - No token or invalid token:
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**403 Forbidden** - Valid token but not admin:
```json
{
  "success": false,
  "message": "Admin access required"
}
```

---

## Making Existing Users Admin

### Method 1: Using Helper Script

```bash
# Promote user to admin by username
node make-admin.js johndoe

# Or by email
node make-admin.js john@example.com
```

### Method 2: Direct Database Update

Using SQLite CLI:
```bash
sqlite3 database/personal_terminal.db
```

```sql
-- View all users and their roles
SELECT id, username, email, role FROM users;

-- Promote user to admin
UPDATE users SET role = 'admin' WHERE email = 'john@example.com';

-- Verify update
SELECT id, username, email, role FROM users WHERE email = 'john@example.com';
```

---

## Migration for Existing Databases

If you have an existing database, run the migration script:

```bash
node migrate-add-roles.js
```

This will:
- Add `role` column to users table
- Set all existing users to `'user'` role
- Add CHECK constraint for valid roles

---

## Testing with Swagger UI

1. Start server: `npm run dev`
2. Open: http://localhost:5000/api-docs
3. Register an admin user with role "admin"
4. Copy the JWT token
5. Click "Authorize" button (top right)
6. Enter: `Bearer <your_token>`
7. Try admin endpoints (create/update/delete articles)

---

## Frontend Integration

### Store Role in State

```typescript
// After login
const response = await api.auth.login(email, password);
const { token, user } = response.data;

// Store both token and role
localStorage.setItem('token', token);
localStorage.setItem('userRole', user.role);
setAuthToken(token);
```

### Conditional UI Rendering

```tsx
const userRole = localStorage.getItem('userRole');

function BlogAdmin() {
  if (userRole !== 'admin') {
    return <div>Access Denied - Admin Only</div>;
  }

  return (
    <div>
      <button onClick={createArticle}>Create Article</button>
      <button onClick={editArticle}>Edit Article</button>
      <button onClick={deleteArticle}>Delete Article</button>
    </div>
  );
}
```

### Role-Based Navigation

```tsx
{userRole === 'admin' && (
  <nav>
    <Link to="/admin/articles/new">New Article</Link>
    <Link to="/admin/articles">Manage Articles</Link>
  </nav>
)}
```

---

## Security Notes

⚠️ **Important Security Practices:**

1. **Server-Side Validation** - Role is checked on the backend. Frontend checks are only for UX.
2. **JWT Contains Role** - Token includes role in payload, verified on each request
3. **No Client-Side Trust** - Never rely solely on frontend role checking
4. **Admin Tokens** - Protect admin tokens carefully in production

---

## Database Schema

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Troubleshooting

### "Admin access required" Error

**Problem:** Getting 403 error when trying to access admin endpoints

**Solutions:**
1. Verify your token is valid: Check JWT contains `"role": "admin"`
2. Decode your token at https://jwt.io to inspect payload
3. Re-login if you were promoted to admin after initial login
4. Ensure you're using the latest token

### Existing Users Can't Access Admin Features

**Problem:** User registered before role system was added

**Solution:**
```bash
# Run migration
node migrate-add-roles.js

# Promote user to admin
node make-admin.js <username>

# User must login again to get new token with role
```

---

## Quick Reference

| Action | Required Role | Endpoint |
|--------|--------------|----------|
| View articles | None (public) | `GET /api/blog/articles` |
| View single article | None (public) | `GET /api/blog/articles/:slug` |
| Create article | Admin | `POST /api/blog/articles` |
| Update article | Admin | `PUT /api/blog/articles/:id` |
| Delete article | Admin | `DELETE /api/blog/articles/:id` |
| Add comment | User/Admin | `POST /api/comments/:articleId` |
| React to article | User/Admin | `POST /api/reactions/:articleId/:type` |

