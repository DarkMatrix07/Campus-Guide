# Local Setup (Fresh Clone)

## Steps

**1. Clone the repo**
```bash
git clone https://github.com/DarkMatrix07/Campus-Guide.git
cd Campus-Guide
```

**2. Create `server/.env`**
```env
MONGO_URI=your_mongodb_atlas_connection_string
SESSION_SECRET=any_long_random_string
PORT=5000
CLIENT_URL=http://localhost:5173
```

**3. Install dependencies and run**
```bash
# Terminal 1
cd server && npm install && npm run dev

# Terminal 2
cd client && npm install && npm run dev
```

**4. Whitelist your IP in MongoDB Atlas**
Atlas → Network Access → Add IP Address → Add your current IP

**5. Seed default categories**
```bash
cd server && node seed.js
```

Open **http://localhost:5173**
