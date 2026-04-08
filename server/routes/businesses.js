const fs = require('node:fs');
const fsPromises = require('node:fs/promises');
const path = require('node:path');
const express = require('express');
const multer = require('multer');
const Business = require('../models/Business');
const { isAdmin, isOwner } = require('../middleware/auth');

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
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
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
    if (!err) {
      next();
      return;
    }

    res.status(400).json({
      success: false,
      message: err.message,
    });
  });
};

const removeFileIfPresent = async (filePath) => {
  if (!filePath) {
    return;
  }

  try {
    await fsPromises.rm(filePath, { force: true });
  } catch (_error) {
    // Best-effort cleanup for rejected uploads.
  }
};

const buildReviewSummary = (business) => {
  const reviews = business.reviews.map((review) => ({
    id: review._id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  }));

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length ? Number((totalRating / reviews.length).toFixed(1)) : 0;

  return {
    reviews,
    reviewCount: reviews.length,
    averageRating,
  };
};

const serializeBusinessForOwner = (business) => {
  const { reviews, reviewCount, averageRating } = buildReviewSummary(business);

  return {
    id: business._id,
    name: business.name,
    category: business.category,
    location: business.location,
    description: business.description,
    contact: business.contact,
    imageUrl: business.imageUrl,
    status: business.status,
    averageRating,
    reviewCount,
    reviews,
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

const serializeBusinessForPublic = (business) => ({
  ...serializeBusinessForOwner(business),
});

router.get('/public', async (_req, res) => {
  try {
    const businesses = await Business.find({ status: 'approved' });

    res.json({
      success: true,
      businesses: businesses.map(serializeBusinessForPublic),
    });
  } catch (_error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

router.get('/mine', isOwner, async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.session.userId });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    res.json({
      success: true,
      business: serializeBusinessForOwner(business),
    });
  } catch (_error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

router.get('/pending', isAdmin, async (_req, res) => {
  try {
    const businesses = await Business.find({ status: 'pending' }).populate('owner', 'name email');

    res.json({
      success: true,
      businesses: businesses.map(serializeBusinessForAdmin),
    });
  } catch (_error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

router.post('/', isOwner, uploadBusinessImage, async (req, res) => {
  const { name, category, location, description, contact } = req.body;

  try {
    const existingBusiness = await Business.findOne({ owner: req.session.userId });
    if (existingBusiness) {
      await removeFileIfPresent(req.file?.path);
      return res.status(409).json({
        success: false,
        message: 'Business already registered',
      });
    }

    if (!name || !category || !location || !description || !contact) {
      await removeFileIfPresent(req.file?.path);
      return res.status(400).json({
        success: false,
        message: 'All business fields are required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Business image is required',
      });
    }

    const business = await Business.create({
      owner: req.session.userId,
      name,
      category,
      location,
      description,
      contact,
      imageUrl: `${req.protocol}://${req.get('host')}/uploads/businesses/${req.file.filename}`,
      imagePath: req.file.path,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      business: serializeBusinessForOwner(business),
    });
  } catch (_error) {
    await removeFileIfPresent(req.file?.path);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

router.patch('/:id/status', isAdmin, express.json(), async (req, res) => {
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status update',
    });
  }

  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    business.status = status;
    await business.save();

    res.json({
      success: true,
      business: serializeBusinessForOwner(business),
    });
  } catch (_error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;
