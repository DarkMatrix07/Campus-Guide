const express = require('express');
const User = require('../models/User');
const { isAuth, isAdmin } = require('../middleware/auth');

const router = express.Router();

const VALID_ROLES = ['student', 'owner', 'admin'];

router.get('/users', isAuth, isAdmin, async (_req, res) => {
  try {
    const users = await User.find().select('name email role createdAt').sort({ createdAt: -1 });
    res.json({
      success: true,
      users: users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      })),
    });
  } catch (_error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/users/:id/role', isAuth, isAdmin, express.json(), async (req, res) => {
  const { role } = req.body;

  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }

  if (String(req.params.id) === String(req.session.userId)) {
    return res.status(400).json({ success: false, message: 'Cannot change your own role' });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    return res.json({ success: true, user: { id: user._id, role: user.role } });
  } catch (_error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/users/:id', isAuth, isAdmin, async (req, res) => {
  if (String(req.params.id) === String(req.session.userId)) {
    return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
  }

  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true });
  } catch (_error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
