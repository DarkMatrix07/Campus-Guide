# Getting Started

## Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or higher
- **npm** v9 or higher
- A **MongoDB Atlas** account (or a local MongoDB instance)

---

## 1. Clone the Repository

```bash
git clone https://github.com/DarkMatrix07/Campus-Guide.git
cd Campus-Guide
```

---

## 2. Set Up the Server

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` folder:

```env
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=a_long_random_secret_string
PORT=5000
CLIENT_URL=http://localhost:5173
```

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `SESSION_SECRET` | Secret used to sign session cookies — use a long random string |
| `PORT` | Port the Express server listens on (default: 5000) |
| `CLIENT_URL` | Frontend URL — used for CORS (default: http://localhost:5173) |

---

## 3. Set Up the Client

```bash
cd ../client
npm install
```

No `.env` file is needed for the client. The Vite dev server proxies all `/api` and `/uploads` requests to `http://localhost:5000` automatically.

---

## 4. Run in Development

Open **two terminals**:

**Terminal 1 — Server:**
```bash
cd server
npm run dev
```

**Terminal 2 — Client:**
```bash
cd client
npm run dev
```

The app will be available at **http://localhost:5173**.

---

## 5. Seed Initial Data (Optional)

If the project includes a seed script, run it to populate default categories and a test admin account:

```bash
cd server
node seed.js
```

---

## 6. Build for Production

```bash
cd client
npm run build
```

This outputs static files to `client/dist/`. Serve them via a static host (Vercel, Netlify) or point your Express server at the `dist/` folder.

---

## Common Issues

| Problem | Fix |
|---------|-----|
| `Missing required environment variable` | Check that all 4 variables are present in `server/.env` |
| Images not loading | Ensure the Vite dev server is running so `/uploads` proxy works |
| Session not persisting | Make sure `SESSION_SECRET` is set and cookies are not being blocked |
| MongoDB connection timeout | Check your Atlas IP whitelist includes your current IP |
