# API Reference

Base URL: `http://localhost:5000/api`

All requests that require authentication must include the session cookie (sent automatically by the browser).

---

## Auth

### `POST /auth/register`
Register a new user.

**Body:**
```json
{ "name": "string", "email": "string", "password": "string", "role": "student|owner|admin" }
```

**Response:** `201` `{ success, user: { id, name, email, role } }`

---

### `POST /auth/login`
Log in an existing user.

**Body:**
```json
{ "email": "string", "password": "string" }
```

**Response:** `200` `{ success, user: { id, name, email, role } }`

---

### `POST /auth/logout`
Destroy the current session.

**Response:** `200` `{ success }`

---

### `GET /auth/me`
Get the currently authenticated user.

**Auth:** required

**Response:** `200` `{ success, user: { id, name, email, role } }`

---

### `PATCH /auth/profile`
Update name, email, or password.

**Auth:** required

**Body:**
```json
{
  "name": "string",
  "email": "string",
  "currentPassword": "string",   // required only if changing password
  "newPassword": "string"         // optional
}
```

**Response:** `200` `{ success, user: { id, name, email, role } }`

---

## Businesses

### `GET /businesses/public`
Get all approved, visible businesses.

**Response:** `200` `{ success, businesses: [...] }`

---

### `GET /businesses/public/:id`
Get a single approved business with public reviews.

**Response:** `200` `{ success, business: { ...fields, reviews, viewerHasReviewed, viewerReviewId } }`

---

### `GET /businesses/top-rated`
Get approved businesses grouped by category, sorted by average rating.

**Response:** `200` `{ success, sections: [{ category, businesses }] }`

---

### `GET /businesses/mine`
Get the authenticated owner's business.

**Auth:** owner

**Response:** `200` `{ success, business }` or `404` if not registered yet

---

### `POST /businesses`
Register a new business listing.

**Auth:** owner  
**Content-Type:** `multipart/form-data`

**Fields:** `name`, `category`, `directoryCategory`, `location`, `description`, `contact`, `image` (file)

**Response:** `201` `{ success, business }`

---

### `PUT /businesses/mine`
Update the authenticated owner's business.

**Auth:** owner  
**Content-Type:** `multipart/form-data`

**Fields:** `name`, `category`, `directoryCategory`, `location`, `description`, `contact`, `image` (optional file)

**Response:** `200` `{ success, business }`

---

### `DELETE /businesses/mine`
Delete the authenticated owner's business and its image file.

**Auth:** owner

**Response:** `200` `{ success }`

---

### `POST /businesses/:id/reviews`
Submit a review for a business.

**Auth:** student

**Body:**
```json
{ "rating": 1-5, "comment": "string" }
```

**Response:** `201` `{ success, business }`

---

### `PATCH /businesses/:id/reviews/:reviewId/reaction`
Like or dislike a review.

**Auth:** student

**Body:**
```json
{ "reaction": "like|dislike|none" }
```

**Response:** `200` `{ success, business }`

---

### `GET /businesses/pending`
Get all pending businesses awaiting approval.

**Auth:** admin

**Response:** `200` `{ success, businesses }`

---

### `GET /businesses/admin/all`
Get all businesses with full admin details.

**Auth:** admin

**Response:** `200` `{ success, businesses }`

---

### `GET /businesses/admin/reviews`
Get all reviews across all businesses.

**Auth:** admin

**Response:** `200` `{ success, reviews }`

---

### `PATCH /businesses/:id/status`
Approve or reject a pending business.

**Auth:** admin

**Body:**
```json
{ "status": "approved|rejected" }
```

**Response:** `200` `{ success, business }`

---

### `PATCH /businesses/:id/hide`
Toggle a business's hidden state.

**Auth:** admin

**Response:** `200` `{ success, hidden: boolean }`

---

### `DELETE /businesses/:id`
Permanently delete a business and its image.

**Auth:** admin

**Response:** `200` `{ success }`

---

### `PATCH /businesses/:id/reviews/:reviewId/hide`
Toggle a review's hidden state.

**Auth:** admin

**Response:** `200` `{ success, hidden: boolean }`

---

### `DELETE /businesses/:id/reviews/:reviewId`
Permanently delete a review.

**Auth:** admin

**Response:** `200` `{ success }`

---

## Categories

### `GET /categories`
Get all categories.

**Response:** `200` `{ success, categories: [{ id, name }] }`

---

### `POST /categories`
Create a new category.

**Auth:** admin

**Body:**
```json
{ "name": "string" }
```

**Response:** `201` `{ success, category }`

---

### `DELETE /categories/:id`
Delete a category.

**Auth:** admin

**Response:** `200` `{ success }`

---

## Admin — Users

### `GET /admin/users`
Get all users.

**Auth:** admin

**Response:** `200` `{ success, users: [{ id, name, email, role }] }`

---

### `PATCH /admin/users/:id/role`
Change a user's role.

**Auth:** admin

**Body:**
```json
{ "role": "student|owner|admin" }
```

**Response:** `200` `{ success, user }`

---

### `DELETE /admin/users/:id`
Delete a user account.

**Auth:** admin

**Response:** `200` `{ success }`
