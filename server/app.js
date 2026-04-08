const path = require('node:path');
const express = require('express');
const session = require('express-session');
const cors = require('cors');

const uploadRoot = process.env.UPLOAD_ROOT || path.join(__dirname, 'uploads');

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  },
}));

app.use('/uploads', express.static(uploadRoot));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/businesses', require('./routes/businesses'));

app.get('/', (req, res) => res.send('Campus Guide API running'));

module.exports = app;
