# API Integration Guide

This document explains how the Personal Page Terminal integrates with the backend API at `http://localhost:5000`.

## Overview

The terminal application now supports the following API features:
- **Authentication**: User registration, login, and logout
- **Blog**: List, read, and search articles
- **Contact**: Send messages via contact form
- **Logging**: Track visitor activity (future feature)

## Available Commands

### Authentication Commands

#### `register <username> <email> <password>`
Register a new user account.

**Example:**
```bash
register john john@email.com mypassword123
```

#### `login <username> <password>`
Sign in to an existing account.

**Example:**
```bash
login john mypassword123
```

#### `logout`
Sign out from the current account.

**Example:**
```bash
logout
```

#### `whoami`
Display currently logged-in user information.

**Example:**
```bash
whoami
```

---

### Blog Commands

#### `blog list` or `blog`
List all published blog articles.

**Example:**
```bash
blog list
```

#### `blog read <slug>`
Read a specific article by its slug.

**Example:**
```bash
blog read my-first-post
```

#### `blog search <query>`
Search for articles matching a query.

**Example:**
```bash
blog search javascript
```

#### `blog tags`
Display all available article tags.

**Example:**
```bash
blog tags
```

---

### Contact Command

#### `send <name> <email> <message>`
Submit a message through the contact form.

**Example:**
```bash
send "John Doe" john@email.com "Hello, I would like to connect!"
```

**Note:** Wrap multi-word values in quotes if they contain spaces.

---

## Architecture

### File Structure

```
personal_page/
├── services/
│   └── api.ts              # API service with all endpoints
├── types/
│   └── api.ts              # TypeScript types for API responses
├── helpers/
│   └── commandParser.ts    # Command parsing and execution
└── components/
    └── Terminal.tsx        # Terminal UI component
```

### API Service (`services/api.ts`)

The API service module exports the following:

- **`authAPI`**: Authentication endpoints (register, login, logout, token management)
- **`blogAPI`**: Blog endpoints (articles, tags, search)
- **`contactAPI`**: Contact form submission
- **`commentsAPI`**: Article comments (future feature)
- **`reactionsAPI`**: Article reactions (future feature)
- **`logsAPI`**: Visitor and command logging (future feature)

### Command Flow

1. User enters a command in the terminal
2. `executeCommand()` parses and validates the command
3. For async commands (API calls), it returns `__ASYNC__<action>:<params>`
4. Terminal component detects async commands and calls `executeAsyncCommand()`
5. `executeAsyncCommand()` makes the API call and returns the result
6. Result is displayed in the terminal

### Authentication

Authentication tokens are stored in `localStorage`:
- Token: `auth_token`
- User info: `user`

The token is automatically included in requests that require authentication using the `Authorization: Bearer <token>` header.

---

## API Configuration

The base API URL is configured in `services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

To change the API endpoint, update this constant.

---

## Error Handling

All API calls include error handling:
- Network errors are caught and displayed to the user
- API errors return structured error messages
- Authentication failures clear stored credentials

---

## Future Enhancements

Potential additions:
- **Comments**: Add, view, and moderate comments on blog articles
- **Reactions**: Like and bookmark articles
- **Visitor Logging**: Automatically track visits and commands
- **User Profiles**: View and edit user profiles
- **Admin Commands**: Manage content (requires authentication)

---

## Development Notes

### Testing Commands

1. Start the backend API server:
   ```bash
   # Navigate to backend directory
   python app.py
   ```

2. Start the frontend development server:
   ```bash
   npm run dev
   ```

3. Test commands in the terminal:
   - Register: `register testuser test@email.com password123`
   - Login: `login testuser password123`
   - Blog: `blog list`
   - Contact: `send "Test User" test@email.com "Test message"`

### API Documentation

Full API documentation is available at: `http://localhost:5000/api-docs`

---

## Troubleshooting

### CORS Errors
If you encounter CORS errors, ensure the backend has CORS enabled for `http://localhost:3000` (or your frontend URL).

### Authentication Issues
- Check that tokens are being stored in localStorage
- Verify the token format in API requests
- Ensure the backend validates tokens correctly

### Connection Refused
- Verify the backend server is running on `http://localhost:5000`
- Check that the API_BASE_URL is correct
- Confirm no firewall is blocking the connection
