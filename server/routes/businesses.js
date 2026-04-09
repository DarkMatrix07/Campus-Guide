const fs = require('node:fs');
const fsPromises = require('node:fs/promises');
const path = require('node:path');
const express = require('express');
const multer = require('multer');
const Business = require('../models/Business');
const Category = require('../models/Category');
const { isAuth, isAdmin, isOwner, isStudent } = require('../middleware/auth');

const router = express.Router();

const uploadRoot = process.env.UPLOAD_ROOT || path.join(__dirname, '..', 'uploads');
const businessImageDir = path.join(uploadRoot, 'businesses');
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

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
    const extension = (path.extname(file.originalname) || '.png').toLowerCase();
    if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
      return callback(new Error('Invalid file extension'), false);
    }
    callback(null, `${Date.now()}-${sanitizeFileBase(file.originalname)}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new Error('Only image uploads are allowed'), false);
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

    res.status(400).json({ success: false, message: err.message });
  });
};

const resolveUploadPath = (relativePath) => {
  if (!relativePath) return null;
  if (path.isAbsolute(relativePath)) return relativePath;
  return path.join(uploadRoot, '..', relativePath);
};

const removeFileIfPresent = async (filePath) => {
  if (!filePath) {
    return;
  }

  try {
    await fsPromises.rm(resolveUploadPath(filePath), { force: true });
  } catch (_error) {
    // Best-effort cleanup
  }
};

const asArray = (value) => (Array.isArray(value) ? value : []);

const normalizeText = (value) => String(value ?? '').trim();
const normalizeSearchValue = (value) => normalizeText(value).toLowerCase();

const getEntityId = (value) => {
  if (value && typeof value === 'object') {
    if (value._id != null) {
      return value._id;
    }

    if (value.id != null) {
      return value.id;
    }
  }

  return value ?? null;
};

const idsEqual = (left, right) => {
  if (left == null || right == null) {
    return false;
  }

  return String(getEntityId(left)) === String(getEntityId(right));
};

const directoryCategoryMatchers = [
  {
    label: 'Food',
    keywords: ['food', 'cafe', 'coffee', 'tea', 'snack', 'restaurant', 'mess', 'bakery'],
  },
  {
    label: 'Stationery',
    keywords: ['stationery', 'print', 'xerox', 'copy', 'book', 'essential', 'supply'],
  },
  {
    label: 'PG',
    keywords: ['pg', 'hostel', 'residency', 'accommodation', 'room', 'housing'],
  },
];

const inferDirectoryCategory = (category) => {
  const normalizedCategory = normalizeSearchValue(category);

  if (!normalizedCategory) {
    return 'Other';
  }

  const matchedCategory = directoryCategoryMatchers.find(({ keywords }) => (
    keywords.some((keyword) => normalizedCategory.includes(keyword))
  ));

  return matchedCategory ? matchedCategory.label : normalizeText(category);
};

const parseDateValue = (value) => {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const buildReviewSummary = (business) => {
  const reviews = asArray(business.reviews);
  const validRatings = reviews
    .map((review) => Number(review?.rating))
    .filter((rating) => Number.isFinite(rating) && rating > 0);

  if (validRatings.length === 0) {
    return {
      reviewCount: reviews.length,
      averageRating: 0,
    };
  }

  const totalRating = validRatings.reduce((sum, rating) => sum + rating, 0);

  return {
    reviewCount: reviews.length,
    averageRating: Number((totalRating / validRatings.length).toFixed(1)),
  };
};

const getBusinessImages = (business) => {
  if (!business?.imageUrl) {
    return [];
  }

  return [business.imageUrl];
};

const buildReviewReaction = (review, viewerId) => {
  const likedBy = asArray(review?.likedBy);
  const dislikedBy = asArray(review?.dislikedBy);
  const viewerIdValue = viewerId == null ? null : String(viewerId);

  let viewerReaction = null;

  if (viewerIdValue && likedBy.some((userId) => idsEqual(userId, viewerIdValue))) {
    viewerReaction = 'like';
  } else if (viewerIdValue && dislikedBy.some((userId) => idsEqual(userId, viewerIdValue))) {
    viewerReaction = 'dislike';
  }

  return {
    likeCount: likedBy.length,
    dislikeCount: dislikedBy.length,
    viewerReaction,
  };
};

const serializeReview = (review, viewerId) => ({
  id: getEntityId(review),
  rating: Number(review?.rating) || 0,
  comment: review?.comment || '',
  ...buildReviewReaction(review, viewerId),
  createdAt: review?.createdAt || null,
  updatedAt: review?.updatedAt || null,
});

const buildSerializedBusinessBase = (business) => {
  const { reviewCount, averageRating } = buildReviewSummary(business);

  return {
    id: getEntityId(business),
    name: business?.name || '',
    category: business?.category || '',
    directoryCategory: business?.directoryCategory || inferDirectoryCategory(business?.category),
    location: business?.location || '',
    description: business?.description || '',
    contact: business?.contact || '',
    imageUrl: business?.imageUrl || '',
    images: getBusinessImages(business),
    status: business?.status || 'pending',
    hidden: Boolean(business?.hidden),
    averageRating,
    reviewCount,
    createdAt: business?.createdAt || null,
    updatedAt: business?.updatedAt || null,
  };
};

const serializeReviewForAdmin = (review) => ({
  ...serializeReview(review, null),
  hidden: Boolean(review?.hidden),
});

const serializeBusinessForOwner = (business) => ({
  ...buildSerializedBusinessBase(business),
  reviews: asArray(business?.reviews).map((review) => serializeReview(review, null)),
});

const serializeBusinessForAdmin = (business) => ({
  ...buildSerializedBusinessBase(business),
  reviews: asArray(business?.reviews).map(serializeReviewForAdmin),
  owner: business?.owner ? {
    id: getEntityId(business.owner),
    name: business.owner.name,
    email: business.owner.email,
  } : null,
});

const serializeBusinessForPublic = (business, viewerId) => {
  const allReviews = asArray(business?.reviews);
  const visibleReviews = allReviews.filter((review) => !review?.hidden);

  // Check all reviews (including hidden) so a student with a hidden review
  // sees "already reviewed" rather than a form that will get blocked by the API.
  const viewerReview = viewerId == null
    ? null
    : allReviews.find((review) => idsEqual(review?.reviewer, viewerId));

  const validRatings = visibleReviews
    .map((review) => Number(review?.rating))
    .filter((rating) => Number.isFinite(rating) && rating > 0);
  const averageRating = validRatings.length === 0
    ? 0
    : Number((validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(1));

  return {
    ...buildSerializedBusinessBase(business),
    reviewCount: visibleReviews.length,
    averageRating,
    viewerHasReviewed: Boolean(viewerReview),
    viewerReviewId: viewerReview ? getEntityId(viewerReview) : null,
    reviews: visibleReviews.map((review) => serializeReview(review, viewerId)),
  };
};

const compareByName = (left, right) => left.name.localeCompare(right.name, 'en', { sensitivity: 'base' });

const compareDirectoryBusinesses = (left, right) => {
  if (right.averageRating !== left.averageRating) {
    return right.averageRating - left.averageRating;
  }

  if (right.reviewCount !== left.reviewCount) {
    return right.reviewCount - left.reviewCount;
  }

  return parseDateValue(right.createdAt) - parseDateValue(left.createdAt) || compareByName(left, right);
};

const filterDirectoryBusinesses = (businesses, query) => {
  const categoryFilter = normalizeSearchValue(query.category);
  const searchFilter = normalizeSearchValue(query.search);
  const minimumRating = Number(query.minRating);
  const hasMinimumRating = Number.isFinite(minimumRating) && minimumRating > 0;

  return businesses.filter((business) => {
    const matchesCategory = !categoryFilter
      || categoryFilter === 'all'
      || categoryFilter === 'all categories'
      || normalizeSearchValue(business.directoryCategory) === categoryFilter;

    const matchesSearch = !searchFilter || [
      business.name,
      business.location,
      business.category,
      business.directoryCategory,
    ]
      .map(normalizeSearchValue)
      .some((fieldValue) => fieldValue.includes(searchFilter));

    const matchesRating = !hasMinimumRating || business.averageRating >= minimumRating;

    return matchesCategory && matchesSearch && matchesRating;
  });
};

const getReviewCollection = (business) => {
  return Array.isArray(business.reviews) ? business.reviews : [];
};

const findReviewById = (business, reviewId) => {
  const reviews = getReviewCollection(business);

  if (typeof reviews.id === 'function') {
    return reviews.id(reviewId) || null;
  }

  return reviews.find((review) => idsEqual(review, reviewId)) || null;
};

const toggleReactionMembership = (ids, targetId, shouldInclude) => {
  const existingIds = asArray(ids).filter((value) => !idsEqual(value, targetId));

  if (shouldInclude) {
    existingIds.push(targetId);
  }

  return existingIds;
};

router.get('/public', async (req, res) => {
  try {
    const viewerId = req.session?.userId || null;
    const businesses = await Business.find({ status: 'approved', hidden: { $ne: true } });
    const serializedBusinesses = businesses.map((business) => serializeBusinessForPublic(business, viewerId));
    const filteredBusinesses = filterDirectoryBusinesses(serializedBusinesses, req.query)
      .sort(compareDirectoryBusinesses);

    res.json({
      success: true,
      businesses: filteredBusinesses,
    });
  } catch (_error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/public/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business || business.status !== 'approved' || business.hidden) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const viewerId = req.session?.userId || null;

    return res.json({
      success: true,
      business: serializeBusinessForPublic(business, viewerId),
    });
  } catch (_error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/top-rated', async (req, res) => {
  try {
    const viewerId = req.session?.userId || null;
    const [approvedBusinesses, dbCategories] = await Promise.all([
      Business.find({ status: 'approved', hidden: { $ne: true } }),
      Category.find().sort({ name: 1 }),
    ]);
    const ratedBusinesses = approvedBusinesses
      .map((business) => serializeBusinessForPublic(business, viewerId))
      .filter((business) => business.reviewCount > 0);
    const knownCategoryNames = dbCategories.map((c) => c.name);
    const sectionCategories = Array.from(new Set([
      ...knownCategoryNames,
      ...ratedBusinesses.map((business) => business.directoryCategory),
    ]));
    const sections = sectionCategories
      .map((category) => ({
        category,
        businesses: ratedBusinesses
          .filter((business) => business.directoryCategory === category)
          .sort(compareDirectoryBusinesses)
          .slice(0, 3),
      }))
      .filter((section) => section.businesses.length > 0);

    res.json({
      success: true,
      sections,
    });
  } catch (_error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/mine', isAuth, isOwner, async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.session.userId });

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    return res.json({
      success: true,
      business: serializeBusinessForOwner(business),
    });
  } catch (_error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/pending', isAuth, isAdmin, async (_req, res) => {
  try {
    const businesses = await Business.find({ status: 'pending' }).populate('owner', 'name email');

    res.json({
      success: true,
      businesses: businesses.map(serializeBusinessForAdmin),
    });
  } catch (_error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', isAuth, isOwner, uploadBusinessImage, async (req, res) => {
  const {
    name,
    category,
    directoryCategory,
    location,
    description,
    contact,
  } = req.body;

  try {
    const existingBusiness = await Business.findOne({ owner: req.session.userId });

    if (existingBusiness) {
      await removeFileIfPresent(req.file?.path);
      return res.status(409).json({ success: false, message: 'Business already registered' });
    }

    if (!name || !category || !directoryCategory || !location || !description || !contact) {
      await removeFileIfPresent(req.file?.path);
      return res.status(400).json({ success: false, message: 'All business fields are required' });
    }

    const fieldLimits = { name: 100, category: 50, location: 200, description: 1000, contact: 100 };
    for (const [field, max] of Object.entries(fieldLimits)) {
      if (req.body[field] && req.body[field].length > max) {
        await removeFileIfPresent(req.file?.path);
        return res.status(400).json({ success: false, message: `${field} must be under ${max} characters` });
      }
    }

    const validCategory = await Category.findOne({ name: directoryCategory });
    if (!validCategory) {
      await removeFileIfPresent(req.file?.path);
      return res.status(400).json({ success: false, message: 'Invalid directory category' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Business image is required' });
    }

    const business = await Business.create({
      owner: req.session.userId,
      name,
      category,
      directoryCategory,
      location,
      description,
      contact,
      imageUrl: `/uploads/businesses/${req.file.filename}`,
      imagePath: `uploads/businesses/${req.file.filename}`,
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      business: serializeBusinessForOwner(business),
    });
  } catch (_error) {
    await removeFileIfPresent(req.file?.path);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/mine', isAuth, isOwner, uploadBusinessImage, async (req, res) => {
  const { name, category, directoryCategory, location, description, contact } = req.body;

  try {
    const business = await Business.findOne({ owner: req.session.userId });

    if (!business) {
      await removeFileIfPresent(req.file?.path);
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    if (!name || !category || !directoryCategory || !location || !description || !contact) {
      await removeFileIfPresent(req.file?.path);
      return res.status(400).json({ success: false, message: 'All business fields are required' });
    }

    const fieldLimits = { name: 100, category: 50, location: 200, description: 1000, contact: 100 };
    for (const [field, max] of Object.entries(fieldLimits)) {
      if (req.body[field] && req.body[field].length > max) {
        await removeFileIfPresent(req.file?.path);
        return res.status(400).json({ success: false, message: `${field} must be under ${max} characters` });
      }
    }

    const validCategory = await Category.findOne({ name: directoryCategory });
    if (!validCategory) {
      await removeFileIfPresent(req.file?.path);
      return res.status(400).json({ success: false, message: 'Invalid directory category' });
    }

    if (req.file) {
      await removeFileIfPresent(business.imagePath);
      business.imageUrl = `/uploads/businesses/${req.file.filename}`;
      business.imagePath = `uploads/businesses/${req.file.filename}`;
    }

    business.name = name;
    business.category = category;
    business.directoryCategory = directoryCategory;
    business.location = location;
    business.description = description;
    business.contact = contact;
    await business.save();

    return res.json({ success: true, business: serializeBusinessForOwner(business) });
  } catch (_error) {
    await removeFileIfPresent(req.file?.path);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/mine', isAuth, isOwner, async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.session.userId });

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    await removeFileIfPresent(business.imagePath);
    await Business.findByIdAndDelete(business._id);

    return res.json({ success: true });
  } catch (_error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/:id/status', isAuth, isAdmin, express.json(), async (req, res) => {
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status update' });
  }

  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    if (business.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Business has already been processed' });
    }

    business.status = status;
    await business.save();

    return res.json({
      success: true,
      business: serializeBusinessForOwner(business),
    });
  } catch (_error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/:id/reviews', isAuth, isStudent, express.json(), async (req, res) => {
  const { rating, comment } = req.body;
  const normalizedComment = normalizeText(comment);
  const ratingValue = Number(rating);

  if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5 || !normalizedComment) {
    return res.status(400).json({ success: false, message: 'Rating and comment are required' });
  }

  try {
    const business = await Business.findById(req.params.id);

    if (!business || business.status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const reviews = getReviewCollection(business);
    const alreadyReviewed = reviews.some((review) => idsEqual(review?.reviewer, req.session.userId));

    if (alreadyReviewed) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this business' });
    }

    reviews.push({
      reviewer: req.session.userId,
      rating: ratingValue,
      comment: normalizedComment,
      likedBy: [],
      dislikedBy: [],
    });

    await business.save();

    return res.status(201).json({
      success: true,
      business: serializeBusinessForPublic(business, req.session.userId),
    });
  } catch (_error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/admin/all', isAuth, isAdmin, async (_req, res) => {
  try {
    const businesses = await Business.find().populate('owner', 'name email').sort({ createdAt: -1 });
    res.json({
      success: true,
      businesses: businesses.map(serializeBusinessForAdmin),
    });
  } catch (_error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/admin/reviews', isAuth, isAdmin, async (_req, res) => {
  try {
    const businesses = await Business.find().populate('owner', 'name email').sort({ createdAt: -1 });
    const reviews = [];

    for (const business of businesses) {
      for (const review of asArray(business.reviews)) {
        reviews.push({
          reviewId: getEntityId(review),
          businessId: getEntityId(business),
          businessName: business.name || '',
          authorId: getEntityId(review.reviewer),
          rating: Number(review.rating) || 0,
          comment: review.comment || '',
          hidden: Boolean(review.hidden),
          createdAt: review.createdAt || null,
        });
      }
    }

    reviews.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    res.json({ success: true, reviews });
  } catch (_error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/:id/hide', isAuth, isAdmin, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    business.hidden = !business.hidden;
    await business.save();

    return res.json({ success: true, hidden: business.hidden });
  } catch (_error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:id', isAuth, isAdmin, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    await removeFileIfPresent(business.imagePath);
    await Business.findByIdAndDelete(req.params.id);

    return res.json({ success: true });
  } catch (_error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/:id/reviews/:reviewId/hide', isAuth, isAdmin, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const review = findReviewById(business, req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.hidden = !review.hidden;
    business.markModified('reviews');
    await business.save();

    return res.json({ success: true, hidden: review.hidden });
  } catch (_error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:id/reviews/:reviewId', isAuth, isAdmin, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const reviewIndex = asArray(business.reviews).findIndex((r) => idsEqual(r, req.params.reviewId));

    if (reviewIndex === -1) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    business.reviews.splice(reviewIndex, 1);
    await business.save();

    return res.json({ success: true });
  } catch (_error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/:id/reviews/:reviewId/reaction', isAuth, isStudent, express.json(), async (req, res) => {
  const { reaction } = req.body;

  if (!['like', 'dislike'].includes(reaction)) {
    return res.status(400).json({ success: false, message: 'Invalid reaction' });
  }

  try {
    const business = await Business.findById(req.params.id);

    if (!business || business.status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const review = findReviewById(business, req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const userId = req.session.userId;
    const likedBy = asArray(review.likedBy);
    const dislikedBy = asArray(review.dislikedBy);
    const alreadyLiked = likedBy.some((existingId) => idsEqual(existingId, userId));
    const alreadyDisliked = dislikedBy.some((existingId) => idsEqual(existingId, userId));

    if (reaction === 'like') {
      review.likedBy = toggleReactionMembership(likedBy, userId, !alreadyLiked);
      review.dislikedBy = toggleReactionMembership(dislikedBy, userId, false);
    } else {
      review.dislikedBy = toggleReactionMembership(dislikedBy, userId, !alreadyDisliked);
      review.likedBy = toggleReactionMembership(likedBy, userId, false);
    }

    await business.save();

    return res.json({
      success: true,
      business: serializeBusinessForPublic(business, req.session.userId),
    });
  } catch (_error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
