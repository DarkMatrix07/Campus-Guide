const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuth } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const allowedRoles = ['student', 'owner'];
    const userRole = allowedRoles.includes(role) ? role : 'student';

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role: userRole });

    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ success: false, message: 'Server error' });
      req.session.userId = user._id;
      req.session.role = user.role;
      res.status(201).json({
        success: true,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ success: false, message: 'Server error' });
      req.session.userId = user._id;
      req.session.role = user.role;
      res.json({
        success: true,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ success: false, message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out' });
  });
});

// GET /api/auth/me
router.get('/me', isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/auth/profile
router.patch('/profile', isAuth, express.json(), async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (email.trim() !== user.email) {
      const existing = await User.findOne({ email: email.trim() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
      }

      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to set a new password' });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }

      user.password = newPassword;
    }

    user.name = name.trim();
    user.email = email.trim();
    await user.save();

    return res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
