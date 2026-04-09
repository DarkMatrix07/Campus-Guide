# Campus Guide

A web platform that connects students with local businesses near campus. Students browse and review businesses, owners manage their listings, and admins keep the directory clean and up to date.

---

## Features

- **Business directory** — searchable and filterable by category and star rating
- **Reviews & reactions** — students leave ratings and written reviews; others can like or dislike them
- **Top rated page** — best businesses ranked by student reviews, grouped by category
- **Role-based dashboards** — separate views and controls for students, owners, and admins
- **Business management** — owners register, edit, and delete their own listings
- **Admin panel** — approve listings, manage categories, moderate reviews, manage users
- **Profile editing** — all users can update their name, email, and password

---

## Tech Stack

| | |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, shadcn/ui, React Router v7 |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB Atlas (Mongoose) |
| **Auth** | express-session (cookie-based) |
| **Uploads** | Multer |
| **Security** | Helmet, express-rate-limit, bcryptjs |

---

## Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB Atlas cluster (or local MongoDB)

### 1. Clone

```bash
git clone https://github.com/DarkMatrix07/Campus-Guide.git
cd Campus-Guide
```

### 2. Server setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=a_long_random_secret_string
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 3. Client setup

```bash
cd ../client
npm install
```

No `.env` needed — the Vite dev server proxies `/api` and `/uploads` to port 5000 automatically.

### 4. Run

Open two terminals:

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Open **http://localhost:5173**

---

## Roles

| Role | What they do |
|------|-------------|
| **Student** | Browse directory, filter businesses, write and react to reviews |
| **Owner** | Register and manage a single business listing |
| **Admin** | Approve listings, manage categories, moderate reviews and users |

---

## Documentation

Full documentation is in the [`documentation/`](./documentation/) folder:

| File | Contents |
|------|----------|
| [01-overview.md](./documentation/01-overview.md) | What it is, who uses it, tech stack, project structure |
| [02-getting-started.md](./documentation/02-getting-started.md) | Installation, environment setup, running the project |
| [03-architecture.md](./documentation/03-architecture.md) | Auth flow, data models, image uploads, frontend routing |
| [04-api-reference.md](./documentation/04-api-reference.md) | All API endpoints with request/response details |
| [05-user-guide.md](./documentation/05-user-guide.md) | Step-by-step guide for students, owners, and admins |
| [06-security.md](./documentation/06-security.md) | Auth, rate limiting, file validation, CORS, input validation |

---

## Project Structure

```
campus-guide/
├── client/                  # React frontend
│   └── src/
│       ├── api/             # Axios instance
│       ├── components/      # Shared UI components
│       ├── context/         # AuthContext
│       ├── lib/             # Utilities
│       └── pages/
│           └── dashboards/  # Student, Owner, Admin dashboards
├── server/                  # Express backend
│   ├── middleware/          # Auth guards
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   └── uploads/             # Uploaded images (gitignored)
└── documentation/           # Project documentation
```

---

## License

MIT
