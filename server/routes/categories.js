const express = require('express');
const Category = require('../models/Category');
const { isAuth, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({
      success: true,
      categories: categories.map((c) => ({ id: c._id, name: c.name })),
    });
  } catch (_error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', isAuth, isAdmin, express.json(), async (req, res) => {
  const name = String(req.body.name || '').trim();

  if (!name) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  if (name.length > 50) {
    return res.status(400).json({ success: false, message: 'Category name must be under 50 characters' });
  }

  try {
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({ name });
    return res.status(201).json({ success: true, category: { id: category._id, name: category.name } });
  } catch (_error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:id', isAuth, isAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    return res.json({ success: true });
  } catch (_error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
