# Local Setup (Fresh Clone)

## Prerequisites

**Mac:**
```bash
brew install node
```

**Windows:**
Download and install from https://nodejs.org (v18 or higher)

---

## Steps

**1. Clone the repo**
```bash
git clone https://github.com/DarkMatrix07/Campus-Guide.git
cd Campus-Guide
```

**2. Add the `.env` file**

Get the `.env` file and place it at:
```
Campus-Guide/server/.env
```

**3. Install dependencies and run**
```bash
# Terminal 1
cd server && npm install && npm run dev

# Terminal 2
cd client && npm install && npm run dev
```

**4. Seed default categories**
```bash
cd server && node seed.js
```

Open **http://localhost:5173**
