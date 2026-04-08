const fs = require('node:fs');
const fsPromises = require('node:fs/promises');
const path = require('node:path');
const express = require('express');
const multer = require('multer');
const Business = require('../models/Business');
const { isAdmin, isOwner, isAuth } = require('../middleware/auth');

const router = express.Router();

const uploadRoot = process.env.UPLOAD_ROOT || path.join(__dirname, '..', 'uploads');
const businessImageDir = path.join(uploadRoot, 'businesses');

const ensureUploadDir = () => {
  fs.mkdirSync(businessImageDir, { recursive: true });
};

const sanitizeFileBase = (fileName) => {
  const baseName = path.parse(fileName).name.toLowerCase();
  const normalized = baseName.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return normalized || 'business-image';
};

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    ensureUploadDir();
    callback(null, businessImageDir);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname) || '.png';
    callback(null, `${Date.now()}-${sanitizeFileBase(file.originalname)}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new Error('Only image uploads are allowed'));
      return;
    }
    callback(null, true);
  },
});

const uploadBusinessImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (!err) { next(); return; }
    res.status(400).json({ success: false, message: err.message });
  });
};

const removeFileIfPresent = async (filePath) => {
  if (!filePath) return;
  try {
    await fsPromises.rm(filePath, { force: true });
  } catch (_error) {
    // Best-effort cleanup
  }
};

const buildReviewSummary = (business) => {
  const totalRating = business.reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = business.reviews.length
    ? Number((totalRating / business.reviews.length).toFixed(1))
    : 0;
  return { reviewCount: business.reviews.length, averageRating };
};

const serializeReview = (review, viewerId) => {
  const viewerIdStr = viewerId ? viewerId.toString() : null;
  const likeCount = review.likedBy.length;
  const dislikeCount = review.dislikedBy.length;
  let viewerReaction = null;
  if (viewerIdStr) {
    if (review.likedBy.some((id) => id.toString() === viewerIdStr)) viewerReaction = 'like';
    else if (review.dislikedBy.some((id) => id.toString() === viewerIdStr)) viewerReaction = 'dislike';
  }
  return {
    id: review._id,
    rating: review.rating,
    comment: review.comment,
    likeCount,
    dislikeCount,
    viewerReaction,
    createdAt: review.createdAt,
  };
};

const serializeBusinessForOwner = (business) => {
  const { reviewCount, averageRating } = buildReviewSummary(business);
  return {
    id: business._id,
    name: business.name,
    category: business.category,
    directoryCategory: business.category,
    location: business.location,
    description: business.description,
    contact: business.contact,
    imageUrl: business.imageUrl,
    status: business.status,
    averageRating,
    reviewCount,
    reviews: business.reviews.map((r) => serializeReview(r, null)),
    createdAt: business.createdAt,
    updatedAt: business.updatedAt,
  };
};

const serializeBusinessForAdmin = (business) => ({
  ...serializeBusinessForOwner(business),
  owner: business.owner ? {
    id: business.owner._id,
    name: business.owner.name,
    email: business.owner.email,
  } : null,
});

const serializeBusinessForPublic = (business, viewerId) => {
  const { reviewCount, averageRating } = buildReviewSummary(business);
  const viewerIdStr = viewerId ? viewerId.toString() : null;
  const viewerHasReviewed = viewerIdStr
    ? business.reviews.some((r) => r.reviewer && r.reviewer.toString() === viewerIdStr)
    : false;
  return {
    id: business._id,
    name: business.name,
    category: business.category,
    directoryCategory: business.category,
    location: business.location,
    description: business.description,
    contact: business.contact,
    imageUrl: business.imageUrl,
    averageRating,
    reviewCount,
    viewerHasReviewed,
    reviews: business.reviews.map((r) => serializeReview(r, viewerId)),
    createdAt: business.createdAt,
  };
};

// GET /api/businesses/public — all approved businesses
router.get('/public', async (req, res) => {
  try {
    const businesses = await Business.find({ status: 'approved' }).sort({ createdAt: -1 });
    const viewerId = req.session?.userId || null;
    res.json({
      success: true,
      businesses: businesses.map((b) => serializeBusinessForPublic(b, viewerId)),
    });
  } catch (_error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/businesses/public/:id — single approved business
router.get('/public/:id', async (req, res) => {
  try {
    const business = await Business.findOne({ _id: req.params.id, status: 'approved' });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    const viewerId = req.session?.userId || null;
    res.json({ success: true, business: serializeBusinessForPublic(business, viewerId) });
  } catch (_error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/businesses/mine — owner's own business
router.get('/mine', isOwner, async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.session.userId });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    res.json({ success: true, business: serializeBusinessForOwner(business) });
  } catch (_error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/businesses/pending — admin pending queue
router.get('/pending', isAdmin, async (_req, res) => {
  try {
    const businesses = await Business.find({ status: 'pending' }).populate('owner', 'name email');
    res.json({ success: true, businesses: businesses.map(serializeBusinessForAdmin) });
  } catch (_error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/businesses — owner registers business
router.post('/', isOwner, uploadBusinessImage, async (req, res) => {
  const { name, category, location, description, contact } = req.body;
  try {
    const existingBusiness = await Business.findOne({ owner: req.session.userId });
    if (existingBusiness) {
      await removeFileIfPresent(req.file?.path);
      return res.status(409).json({ success: false, message: 'Business already registered' });
    }
    if (!name || !category || !location || !description || !contact) {
      await removeFileIfPresent(req.file?.path);
      return res.status(400).json({ success: false, message: 'All business fields are required' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Business image is required' });
    }
    const business = await Business.create({
      owner: req.session.userId,
      name, category, location, description, contact,
      imageUrl: `${req.protocol}://${req.get('host')}/uploads/businesses/${req.file.filename}`,
      imagePath: req.file.path,
      status: 'pending',
    });
    res.status(201).json({ success: true, business: serializeBusinessForOwner(business) });
  } catch (_error) {
    await removeFileIfPresent(req.file?.path);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/businesses/:id/status — admin approve/reject
router.patch('/:id/status', isAdmin, express.json(), async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status update' });
  }
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    business.status = status;
    await business.save();
    res.json({ success: true, business: serializeBusinessForOwner(business) });
  } catch (_error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/businesses/:id/reviews — student submits review
router.post('/:id/reviews', isAuth, express.json(), async (req, res) => {
  if (req.session.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Only students can submit reviews' });
  }
  const { rating, comment } = req.body;
  if (!rating || !comment?.trim()) {
    return res.status(400).json({ success: false, message: 'Rating and comment are required' });
  }
  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
  }
  try {
    const business = await Business.findOne({ _id: req.params.id, status: 'approved' });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    const alreadyReviewed = business.reviews.some(
      (r) => r.reviewer && r.reviewer.toString() === req.session.userId.toString()
    );
    if (alreadyReviewed) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this business' });
    }
    business.reviews.push({ reviewer: req.session.userId, rating: ratingNum, comment: comment.trim() });
    await business.save();
    res.status(201).json({ success: true, business: serializeBusinessForPublic(business, req.session.userId) });
  } catch (_error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/businesses/:id/reviews/:reviewId/reaction — like/dislike toggle
router.patch('/:id/reviews/:reviewId/reaction', isAuth, express.json(), async (req, res) => {
  const { reaction } = req.body;
  if (!['like', 'dislike'].includes(reaction)) {
    return res.status(400).json({ success: false, message: 'Invalid reaction' });
  }
  try {
    const business = await Business.findOne({ _id: req.params.id, status: 'approved' });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    const review = business.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    const userId = req.session.userId.toString();
    const inLiked = review.likedBy.some((id) => id.toString() === userId);
    const inDisliked = review.dislikedBy.some((id) => id.toString() === userId);

    if (reaction === 'like') {
      if (inLiked) {
        review.likedBy = review.likedBy.filter((id) => id.toString() !== userId);
      } else {
        review.likedBy.push(req.session.userId);
        review.dislikedBy = review.dislikedBy.filter((id) => id.toString() !== userId);
      }
    } else {
      if (inDisliked) {
        review.dislikedBy = review.dislikedBy.filter((id) => id.toString() !== userId);
      } else {
        review.dislikedBy.push(req.session.userId);
        review.likedBy = review.likedBy.filter((id) => id.toString() !== userId);
      }
    }

    await business.save();
    res.json({ success: true, business: serializeBusinessForPublic(business, req.session.userId) });
  } catch (_error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
