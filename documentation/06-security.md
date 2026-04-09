# Security

## Authentication & Sessions

- Passwords are hashed using **bcryptjs** before storage — plaintext passwords are never saved
- Sessions use **express-session** with an httpOnly, sameSite: lax cookie
- The session cookie is set to `secure: true` in production (HTTPS only)
- Sessions expire after **24 hours**
- On logout, the session is destroyed server-side

## Route Guards

Every protected API route is gated by middleware:

| Middleware | Checks |
|------------|--------|
| `isAuth` | Session exists (any logged-in user) |
| `isStudent` | Session exists and role is `student` |
| `isOwner` | Session exists and role is `owner` |
| `isAdmin` | Session exists and role is `admin` |

Unauthenticated requests return `401`. Wrong-role requests return `403`.

## Rate Limiting

Login and registration endpoints are rate-limited to **20 requests per 15 minutes** per IP using `express-rate-limit`. This limits brute-force attempts.

## HTTP Security Headers

**Helmet** is applied globally, setting:
- `Content-Security-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Strict-Transport-Security` (in production)
- And other standard security headers

## File Upload Security

- Only `image/*` MIME types are accepted
- Allowed extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`
- Maximum file size: **5MB**
- Filenames are sanitised — only lowercase alphanumeric characters and hyphens are kept
- Files are stored outside the web root at `server/uploads/` (not inside `public/`)

## CORS

CORS is restricted to the `CLIENT_URL` environment variable. Only the configured frontend origin can make credentialed requests to the API.

## Input Validation

- All required fields are validated on the server before saving
- Field length limits are enforced (description max 1200 chars, review comment max 600 chars)
- Email format is validated on profile updates
- Duplicate email checking on registration and profile edits
- `directoryCategory` is validated against the Category collection on business save

## Environment Variables

Sensitive values (`MONGO_URI`, `SESSION_SECRET`) are loaded from a `.env` file which is gitignored and never committed to source control. The server will refuse to start if any required variable is missing.
