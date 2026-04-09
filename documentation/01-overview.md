# Campus Guide — Project Overview

## What Is Campus Guide?

Campus Guide is a web application that helps students discover and review local businesses near their campus. Business owners can register their shops to get listed in the directory, and students can browse, search, filter, and leave reviews. Admins manage the platform — approving listings, moderating reviews, and keeping user accounts in order.

---

## Who Uses It?

| Role | What They Can Do |
|------|-----------------|
| **Student** | Browse the business directory, filter by category and rating, read and write reviews, react to other reviews (like/dislike), view top-rated businesses |
| **Owner** | Register a business listing, edit listing details and images, view their own reviews and rating, delete their listing |
| **Admin** | Approve or reject pending business submissions, manage categories, hide/delete businesses and reviews, manage user roles and accounts |

---

## Key Features

- **Business directory** — searchable, filterable listing of approved businesses near campus
- **Review system** — star ratings + written reviews, one per student per business
- **Like/dislike reactions** — students can signal which reviews were most helpful
- **Top rated page** — highest-rated businesses ranked by student reviews, grouped by category
- **Role-based access** — three distinct roles with separate dashboards and permissions
- **Profile editing** — all users can update their name, email, and password
- **Business editing** — owners can update their listing details and storefront image
- **Admin moderation** — hide or permanently delete businesses and reviews; searchable tables for all content

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, shadcn/ui, React Router v7 |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas (via Mongoose) |
| Auth | express-session (cookie-based sessions, no JWT) |
| File uploads | Multer (images stored on disk in `/uploads/businesses/`) |
| Security | Helmet, express-rate-limit, bcryptjs |

---

## Project Structure

```
campus-guide/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── api/         # Axios instance with interceptors
│       ├── components/  # Shared UI components
│       ├── context/     # AuthContext (user state)
│       ├── lib/         # Utilities (date formatting, cn helper)
│       └── pages/       # Route-level page components
│           └── dashboards/  # Role-specific dashboards
├── server/          # Express backend
│   ├── config/      # MongoDB connection
│   ├── middleware/  # Auth guards (isAuth, isAdmin, isOwner, isStudent)
│   ├── models/      # Mongoose models (User, Business, Category)
│   ├── routes/      # API route handlers
│   └── uploads/     # Uploaded business images (gitignored)
└── documentation/   # This folder
```
