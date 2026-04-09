# Architecture

## How the App Is Structured

Campus Guide follows a standard **client-server architecture** with a clear separation between the React frontend and the Express backend.

```
Browser (React SPA)
        │
        │  HTTP requests via Axios
        │  /api/*  →  proxied to Express (port 5000)
        │  /uploads/* → proxied to Express static files
        ▼
Express Server (port 5000)
        │
        ├── Session middleware (express-session)
        ├── Auth guards (isAuth, isAdmin, isOwner, isStudent)
        ├── Route handlers
        │       ├── /api/auth
        │       ├── /api/businesses
        │       ├── /api/categories
        │       └── /api/admin
        │
        ▼
MongoDB Atlas (Mongoose ODM)
```

---

## Authentication Flow

Authentication uses **cookie-based sessions** (not JWT tokens).

1. User submits login form
2. Server verifies credentials with bcryptjs
3. On success, `req.session.userId` and `req.session.role` are set
4. The session cookie is sent to the browser (httpOnly, sameSite: lax)
5. Every subsequent API request includes the cookie automatically
6. Server middleware checks `req.session.userId` on protected routes
7. On logout, the session is destroyed server-side

**Session expiry:** If a session expires, the next API call returns a `401`. The Axios interceptor in the client catches this and redirects to `/login`.

---

## Role System

Three roles are defined at registration time and stored in the session:

| Role | Guard Middleware | Access |
|------|-----------------|--------|
| `student` | `isStudent` | Browse directory, write reviews |
| `owner` | `isOwner` | Manage their own business listing |
| `admin` | `isAdmin` | Full platform management |

The `Dashboard.jsx` page reads the user's role from AuthContext and redirects to the correct dashboard automatically.

---

## Data Models

### User
```
name          String (required)
email         String (required, unique)
password      String (hashed with bcryptjs)
role          Enum: student | owner | admin
```

### Business
```
owner         ObjectId → User (unique — one business per owner)
name          String
category      String (specific type, e.g. "South Indian Restaurant")
directoryCategory  String (broad label, e.g. "Food")
location      String
description   String (max 1200 chars)
contact       String
imageUrl      String (relative path, e.g. /uploads/businesses/file.png)
imagePath     String (relative path for server-side deletion)
status        Enum: pending | approved | rejected
hidden        Boolean
reviews       Array of Review subdocuments
```

### Review (subdocument inside Business)
```
reviewer      ObjectId → User
rating        Number (1–5)
comment       String (max 600 chars)
likedBy       Array of ObjectId → User
dislikedBy    Array of ObjectId → User
hidden        Boolean
timestamps    createdAt, updatedAt
```

### Category
```
name          String (unique)
```

---

## Image Upload Flow

1. Owner submits registration/edit form with an image file
2. Multer middleware receives the `multipart/form-data` request
3. Image is validated (type must be image/*, size max 5MB, extension must be jpg/jpeg/png/webp/gif)
4. File is saved to `server/uploads/businesses/` with a timestamped filename
5. `imageUrl` (`/uploads/businesses/filename`) is stored in the database
6. Express serves `/uploads` as a static directory
7. Vite proxies `/uploads` to port 5000 in development

When an owner updates their image, the old file is deleted from disk before the new one is saved.

---

## Frontend Routing

| Path | Component | Access |
|------|-----------|--------|
| `/login` | Login.jsx | Guest only |
| `/register` | Signup.jsx | Guest only |
| `/dashboard` | Dashboard.jsx | Authenticated |
| `/student-dashboard` | StudentDashboard.jsx | Student only |
| `/owner-dashboard` | OwnerDashboard.jsx | Owner only |
| `/admin-dashboard` | AdminDashboard.jsx | Admin only |
| `/businesses/:id` | BusinessDetail.jsx | Authenticated |
| `/top-rated` | TopRatedBusinesses.jsx | Authenticated |

`ProtectedRoute` wraps authenticated routes and redirects to `/login` if no session exists. `GuestRoute` wraps login/register and redirects to `/dashboard` if already logged in.
