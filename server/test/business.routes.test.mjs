import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import express from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

process.env.SESSION_SECRET = 'test-session-secret';
process.env.CLIENT_URL = 'http://localhost:5173';

const uploadRoot = path.join(os.tmpdir(), 'campus-guide-business-tests');
process.env.UPLOAD_ROOT = uploadRoot;

const require = createRequire(import.meta.url);
const businessRouter = require('../routes/businesses');
const Business = require('../models/Business');

const createApp = (session = { userId: 'owner-1', role: 'owner' }) => {
  const app = express();

  app.use((req, _res, next) => {
    req.session = session;
    next();
  });

  app.use('/api/businesses', businessRouter);

  return app;
};

describe('business routes', () => {
  beforeEach(async () => {
    await fs.mkdir(uploadRoot, { recursive: true });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(uploadRoot, { recursive: true, force: true });
  });

  it('returns 404 when the owner has not registered a business yet', async () => {
    vi.spyOn(Business, 'findOne').mockResolvedValue(null);

    const response = await request(createApp()).get('/api/businesses/mine');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      message: 'Business not found',
    });
  });

  it('creates a pending business once per owner and returns the saved summary', async () => {
    vi.spyOn(Business, 'findOne').mockResolvedValue(null);
    vi.spyOn(Business, 'create').mockImplementation(async (payload) => ({
      _id: 'business-1',
      ...payload,
      reviews: [],
      createdAt: new Date('2026-04-07T18:30:00.000Z'),
      updatedAt: new Date('2026-04-07T18:30:00.000Z'),
    }));

    const createResponse = await request(createApp())
      .post('/api/businesses')
      .field('name', 'North Gate Cafe')
      .field('category', 'Cafe')
      .field('location', 'North Gate, Block A')
      .field('description', 'Quick coffee and snacks near the main gate.')
      .field('contact', '+91 99999 00000')
      .attach('image', Buffer.from('fake-image'), 'north-gate-cafe.png');

    expect(createResponse.status).toBe(201);
    expect(Business.create).toHaveBeenCalledWith(expect.objectContaining({
      owner: 'owner-1',
      name: 'North Gate Cafe',
      category: 'Cafe',
      location: 'North Gate, Block A',
      status: 'pending',
    }));
    expect(createResponse.body.business).toMatchObject({
      name: 'North Gate Cafe',
      category: 'Cafe',
      location: 'North Gate, Block A',
      status: 'pending',
      reviewCount: 0,
      averageRating: 0,
    });
    expect(createResponse.body.business.imageUrl).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/uploads\/businesses\//);
    expect(createResponse.body.business.reviews).toEqual([]);
  });

  it('rejects duplicate owner registration and hides reviewer identity in the owner response', async () => {
    const existingBusiness = {
      _id: 'business-2',
      owner: 'owner-1',
      name: 'Sunrise Store',
      category: 'Essentials',
      location: 'Market Road',
      description: 'Daily essentials for students.',
      contact: '+91 88888 00000',
      imageUrl: 'http://localhost:5000/uploads/businesses/sunrise-store.png',
      imagePath: path.join(uploadRoot, 'businesses', 'sunrise-store.png'),
      status: 'pending',
      reviews: [
        {
          _id: 'review-1',
          reviewer: 'student-1',
          rating: 4,
          comment: 'Reliable stop for late evening supplies.',
          createdAt: new Date('2026-04-07T18:45:00.000Z'),
        },
      ],
      createdAt: new Date('2026-04-07T18:40:00.000Z'),
      updatedAt: new Date('2026-04-07T18:45:00.000Z'),
    };

    vi.spyOn(Business, 'findOne').mockResolvedValue(existingBusiness);

    const duplicateResponse = await request(createApp())
      .post('/api/businesses')
      .field('name', 'Second Listing')
      .field('category', 'Cafe')
      .field('location', 'Another location')
      .field('description', 'Should be rejected.')
      .field('contact', '+91 99999 11111')
      .attach('image', Buffer.from('fake-image'), 'duplicate.png');

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body).toMatchObject({
      success: false,
      message: 'Business already registered',
    });

    const fetchResponse = await request(createApp()).get('/api/businesses/mine');

    expect(fetchResponse.status).toBe(200);
    expect(fetchResponse.body.business).toMatchObject({
      name: 'Sunrise Store',
      status: 'pending',
      reviewCount: 1,
      averageRating: 4,
    });
    expect(fetchResponse.body.business.reviews).toEqual([
      expect.objectContaining({
        rating: 4,
        comment: 'Reliable stop for late evening supplies.',
      }),
    ]);
    expect(fetchResponse.body.business.reviews[0].reviewer).toBeUndefined();
  });

  it('lets admins review pending businesses with owner details', async () => {
    const pendingBusinesses = [
      {
        _id: 'business-10',
        name: 'North Gate Cafe',
        category: 'Cafe',
        location: 'North Gate',
        description: 'Coffee and snacks.',
        contact: '+91 99999 11111',
        imageUrl: 'http://localhost:5000/uploads/businesses/north-gate-cafe.png',
        status: 'pending',
        owner: {
          _id: 'owner-1',
          name: 'Nisha Traders',
          email: 'nisha@example.com',
        },
        reviews: [],
        createdAt: new Date('2026-04-08T08:10:00.000Z'),
        updatedAt: new Date('2026-04-08T08:10:00.000Z'),
      },
    ];

    const populate = vi.fn().mockResolvedValue(pendingBusinesses);
    vi.spyOn(Business, 'find').mockReturnValue({ populate });

    const response = await request(createApp({ userId: 'admin-1', role: 'admin' })).get('/api/businesses/pending');

    expect(response.status).toBe(200);
    expect(Business.find).toHaveBeenCalledWith({ status: 'pending' });
    expect(populate).toHaveBeenCalledWith('owner', 'name email');
    expect(response.body.businesses).toEqual([
      expect.objectContaining({
        id: 'business-10',
        name: 'North Gate Cafe',
        status: 'pending',
        owner: {
          id: 'owner-1',
          name: 'Nisha Traders',
          email: 'nisha@example.com',
        },
      }),
    ]);
  });

  it('lets admins approve or reject a business and rejects invalid statuses', async () => {
    const approvedBusiness = {
      _id: 'business-11',
      name: 'Sunrise Store',
      category: 'Essentials',
      location: 'Market Road',
      description: 'Daily essentials.',
      contact: '+91 88888 00000',
      imageUrl: 'http://localhost:5000/uploads/businesses/sunrise-store.png',
      status: 'pending',
      owner: {
        _id: 'owner-2',
        name: 'Sunrise Owner',
        email: 'owner@example.com',
      },
      reviews: [],
      createdAt: new Date('2026-04-08T08:20:00.000Z'),
      updatedAt: new Date('2026-04-08T08:20:00.000Z'),
      save: vi.fn(async function save() {
        this.updatedAt = new Date('2026-04-08T08:30:00.000Z');
        return this;
      }),
    };

    const rejectedBusiness = {
      ...approvedBusiness,
      _id: 'business-12',
      status: 'pending',
      save: vi.fn(async function save() {
        this.updatedAt = new Date('2026-04-08T08:40:00.000Z');
        return this;
      }),
    };

    const findById = vi.spyOn(Business, 'findById');
    findById
      .mockResolvedValueOnce(approvedBusiness)
      .mockResolvedValueOnce(rejectedBusiness);

    const approveResponse = await request(createApp({ userId: 'admin-1', role: 'admin' }))
      .patch('/api/businesses/business-11/status')
      .send({ status: 'approved' });

    expect(approveResponse.status).toBe(200);
    expect(approvedBusiness.save).toHaveBeenCalledTimes(1);
    expect(approveResponse.body.business).toMatchObject({
      id: 'business-11',
      status: 'approved',
    });

    const rejectResponse = await request(createApp({ userId: 'admin-1', role: 'admin' }))
      .patch('/api/businesses/business-12/status')
      .send({ status: 'rejected' });

    expect(rejectResponse.status).toBe(200);
    expect(rejectedBusiness.save).toHaveBeenCalledTimes(1);
    expect(rejectResponse.body.business).toMatchObject({
      id: 'business-12',
      status: 'rejected',
    });

    const invalidResponse = await request(createApp({ userId: 'admin-1', role: 'admin' }))
      .patch('/api/businesses/business-12/status')
      .send({ status: 'pending' });

    expect(invalidResponse.status).toBe(400);
    expect(invalidResponse.body).toMatchObject({
      success: false,
      message: 'Invalid status update',
    });
  });

  it('returns only approved businesses from the public listing endpoint', async () => {
    const approvedBusinesses = [
      {
        _id: 'business-20',
        name: 'Approved Cafe',
        category: 'Cafe',
        location: 'Main Road',
        description: 'Approved listing.',
        contact: '+91 77777 11111',
        imageUrl: 'http://localhost:5000/uploads/businesses/approved-cafe.png',
        status: 'approved',
        reviews: [
          {
            _id: 'review-20',
            reviewer: 'student-20',
            rating: 5,
            comment: 'Very good.',
            createdAt: new Date('2026-04-08T08:50:00.000Z'),
          },
        ],
        createdAt: new Date('2026-04-08T08:45:00.000Z'),
        updatedAt: new Date('2026-04-08T08:50:00.000Z'),
      },
    ];

    vi.spyOn(Business, 'find').mockResolvedValue(approvedBusinesses);

    const response = await request(createApp({})).get('/api/businesses/public');

    expect(response.status).toBe(200);
    expect(Business.find).toHaveBeenCalledWith({ status: 'approved' });
    expect(response.body.businesses).toEqual([
      expect.objectContaining({
        id: 'business-20',
        name: 'Approved Cafe',
        status: 'approved',
        reviewCount: 1,
        averageRating: 5,
      }),
    ]);
    expect(response.body.businesses[0].reviews[0].reviewer).toBeUndefined();
  });

  it('filters approved public businesses by category, search, and rating', async () => {
    const approvedBusinesses = [
      {
        _id: 'business-30',
        name: 'North Gate Cafe',
        category: 'Cafe',
        location: 'North Gate',
        description: 'Coffee and snacks.',
        contact: '+91 99999 11111',
        imageUrl: 'http://localhost:5000/uploads/businesses/north-gate-cafe.png',
        status: 'approved',
        reviews: [
          {
            _id: 'review-30a',
            reviewer: 'student-30a',
            rating: 5,
            comment: 'Excellent.',
            createdAt: new Date('2026-04-08T09:05:00.000Z'),
          },
          {
            _id: 'review-30b',
            reviewer: 'student-30b',
            rating: 4,
            comment: 'Very good.',
            createdAt: new Date('2026-04-08T09:10:00.000Z'),
          },
        ],
        createdAt: new Date('2026-04-08T09:00:00.000Z'),
        updatedAt: new Date('2026-04-08T09:10:00.000Z'),
      },
      {
        _id: 'business-31',
        name: 'Campus Prints',
        category: 'Stationery',
        location: 'Library Road',
        description: 'Printouts and notes.',
        contact: '+91 77777 22222',
        imageUrl: 'http://localhost:5000/uploads/businesses/campus-prints.png',
        status: 'approved',
        reviews: [
          {
            _id: 'review-31',
            reviewer: 'student-31',
            rating: 3,
            comment: 'Solid service.',
            createdAt: new Date('2026-04-08T09:20:00.000Z'),
          },
        ],
        createdAt: new Date('2026-04-08T09:15:00.000Z'),
        updatedAt: new Date('2026-04-08T09:20:00.000Z'),
      },
      {
        _id: 'business-32',
        name: 'Green Residency',
        category: 'PG',
        location: 'West Block',
        description: 'Student accommodation.',
        contact: '+91 66666 33333',
        imageUrl: 'http://localhost:5000/uploads/businesses/green-residency.png',
        status: 'approved',
        reviews: [
          {
            _id: 'review-32',
            reviewer: 'student-32',
            rating: 4,
            comment: 'Clean rooms.',
            createdAt: new Date('2026-04-08T09:30:00.000Z'),
          },
        ],
        createdAt: new Date('2026-04-08T09:25:00.000Z'),
        updatedAt: new Date('2026-04-08T09:30:00.000Z'),
      },
    ];

    vi.spyOn(Business, 'find').mockResolvedValue(approvedBusinesses);

    const response = await request(createApp({}))
      .get('/api/businesses/public')
      .query({
        category: 'Food',
        search: 'north',
        minRating: '4',
      });

    expect(response.status).toBe(200);
    expect(Business.find).toHaveBeenCalledWith({ status: 'approved' });
    expect(response.body.businesses).toEqual([
      expect.objectContaining({
        id: 'business-30',
        name: 'North Gate Cafe',
        directoryCategory: 'Food',
        averageRating: 4.5,
      }),
    ]);
  });

  it('returns top-rated approved businesses grouped by category', async () => {
    const approvedBusinesses = [
      {
        _id: 'business-35',
        name: 'Sunrise Bistro',
        category: 'Cafe',
        location: 'East Gate',
        description: 'Breakfast and coffee.',
        contact: '+91 99999 11112',
        imageUrl: 'http://localhost:5000/uploads/businesses/sunrise-bistro.png',
        status: 'approved',
        reviews: [
          {
            _id: 'review-35',
            reviewer: 'student-35',
            rating: 5,
            comment: 'Excellent.',
            createdAt: new Date('2026-04-08T09:45:00.000Z'),
          },
        ],
        createdAt: new Date('2026-04-08T09:40:00.000Z'),
        updatedAt: new Date('2026-04-08T09:45:00.000Z'),
      },
      {
        _id: 'business-36',
        name: 'North Gate Cafe',
        category: 'Cafe',
        location: 'North Gate',
        description: 'Coffee and snacks.',
        contact: '+91 99999 11111',
        imageUrl: 'http://localhost:5000/uploads/businesses/north-gate-cafe.png',
        status: 'approved',
        reviews: [
          {
            _id: 'review-36a',
            reviewer: 'student-36a',
            rating: 5,
            comment: 'Excellent.',
            createdAt: new Date('2026-04-08T09:55:00.000Z'),
          },
          {
            _id: 'review-36b',
            reviewer: 'student-36b',
            rating: 4,
            comment: 'Very good.',
            createdAt: new Date('2026-04-08T10:00:00.000Z'),
          },
        ],
        createdAt: new Date('2026-04-08T09:50:00.000Z'),
        updatedAt: new Date('2026-04-08T10:00:00.000Z'),
      },
      {
        _id: 'business-37',
        name: 'Campus Prints',
        category: 'Stationery',
        location: 'Library Road',
        description: 'Printouts and notes.',
        contact: '+91 99999 22222',
        imageUrl: 'http://localhost:5000/uploads/businesses/campus-prints.png',
        status: 'approved',
        reviews: [
          {
            _id: 'review-37',
            reviewer: 'student-37',
            rating: 4,
            comment: 'Helpful.',
            createdAt: new Date('2026-04-08T10:10:00.000Z'),
          },
        ],
        createdAt: new Date('2026-04-08T10:05:00.000Z'),
        updatedAt: new Date('2026-04-08T10:10:00.000Z'),
      },
      {
        _id: 'business-38',
        name: 'Green Residency',
        category: 'PG',
        location: 'West Block',
        description: 'Student accommodation.',
        contact: '+91 99999 33333',
        imageUrl: 'http://localhost:5000/uploads/businesses/green-residency.png',
        status: 'approved',
        reviews: [],
        createdAt: new Date('2026-04-08T10:15:00.000Z'),
        updatedAt: new Date('2026-04-08T10:15:00.000Z'),
      },
    ];

    vi.spyOn(Business, 'find').mockResolvedValue(approvedBusinesses);

    const response = await request(createApp({ userId: 'student-1', role: 'student' }))
      .get('/api/businesses/top-rated');

    expect(response.status).toBe(200);
    expect(Business.find).toHaveBeenCalledWith({ status: 'approved' });
    expect(response.body.sections).toEqual(expect.arrayContaining([
      expect.objectContaining({
        category: 'Food',
        businesses: [
          expect.objectContaining({
            id: 'business-35',
            name: 'Sunrise Bistro',
            averageRating: 5,
          }),
          expect.objectContaining({
            id: 'business-36',
            name: 'North Gate Cafe',
            averageRating: 4.5,
          }),
        ],
      }),
      expect.objectContaining({
        category: 'Stationery',
        businesses: [
          expect.objectContaining({
            id: 'business-37',
            name: 'Campus Prints',
            averageRating: 4,
          }),
        ],
      }),
      expect.objectContaining({
        category: 'PG',
        businesses: [],
      }),
    ]));
  });

  it('returns a single approved business with images and review reaction state for the detail page', async () => {
    const approvedBusiness = {
      _id: 'business-40',
      name: 'Approved Cafe',
      category: 'Cafe',
      location: 'Main Road',
      description: 'Approved listing.',
      contact: '+91 77777 11111',
      imageUrl: 'http://localhost:5000/uploads/businesses/approved-cafe.png',
      status: 'approved',
      reviews: [
        {
          _id: 'review-40',
          reviewer: 'student-40',
          rating: 5,
          comment: 'Loved the service.',
          likedBy: ['student-1', 'student-7'],
          dislikedBy: ['student-8'],
          createdAt: new Date('2026-04-08T10:05:00.000Z'),
        },
      ],
      createdAt: new Date('2026-04-08T10:00:00.000Z'),
      updatedAt: new Date('2026-04-08T10:05:00.000Z'),
    };

    vi.spyOn(Business, 'findById').mockResolvedValue(approvedBusiness);

    const response = await request(createApp({ userId: 'student-1', role: 'student' }))
      .get('/api/businesses/public/business-40');

    expect(response.status).toBe(200);
    expect(response.body.business).toMatchObject({
      id: 'business-40',
      name: 'Approved Cafe',
      reviewCount: 1,
      averageRating: 5,
      viewerHasReviewed: false,
      images: ['http://localhost:5000/uploads/businesses/approved-cafe.png'],
    });
    expect(response.body.business.reviews).toEqual([
      expect.objectContaining({
        id: 'review-40',
        rating: 5,
        comment: 'Loved the service.',
        likeCount: 2,
        dislikeCount: 1,
        viewerReaction: 'like',
      }),
    ]);
    expect(response.body.business.reviews[0].reviewer).toBeUndefined();
  });

  it('lets students add one review to an approved business and blocks duplicates', async () => {
    const approvedBusiness = {
      _id: 'business-50',
      owner: 'owner-50',
      name: 'Student Favorite Cafe',
      category: 'Cafe',
      location: 'North Circle',
      description: 'Fresh meals.',
      contact: '+91 99999 44444',
      imageUrl: 'http://localhost:5000/uploads/businesses/student-favorite-cafe.png',
      status: 'approved',
      reviews: [],
      createdAt: new Date('2026-04-08T10:10:00.000Z'),
      updatedAt: new Date('2026-04-08T10:10:00.000Z'),
      save: vi.fn(async function save() {
        return this;
      }),
    };

    const duplicateBusiness = {
      ...approvedBusiness,
      reviews: [
        {
          _id: 'review-50',
          reviewer: 'student-1',
          rating: 4,
          comment: 'Already reviewed.',
          likedBy: [],
          dislikedBy: [],
          createdAt: new Date('2026-04-08T10:20:00.000Z'),
        },
      ],
      save: vi.fn(async function save() {
        return this;
      }),
    };

    const findById = vi.spyOn(Business, 'findById');
    findById
      .mockResolvedValueOnce(approvedBusiness)
      .mockResolvedValueOnce(duplicateBusiness);

    const createResponse = await request(createApp({ userId: 'student-1', role: 'student' }))
      .post('/api/businesses/business-50/reviews')
      .send({
        rating: 5,
        comment: 'Very helpful service.',
      });

    expect(createResponse.status).toBe(201);
    expect(approvedBusiness.save).toHaveBeenCalledTimes(1);
    expect(approvedBusiness.reviews).toEqual([
      expect.objectContaining({
        reviewer: 'student-1',
        rating: 5,
        comment: 'Very helpful service.',
      }),
    ]);
    expect(createResponse.body.business).toMatchObject({
      id: 'business-50',
      reviewCount: 1,
      averageRating: 5,
      viewerHasReviewed: true,
    });

    const duplicateResponse = await request(createApp({ userId: 'student-1', role: 'student' }))
      .post('/api/businesses/business-50/reviews')
      .send({
        rating: 4,
        comment: 'Trying twice.',
      });

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body).toMatchObject({
      success: false,
      message: 'You have already reviewed this business',
    });
  });

  it('lets students like and dislike reviews on approved businesses', async () => {
    const approvedBusiness = {
      _id: 'business-60',
      name: 'Review Reaction Store',
      category: 'Stationery',
      location: 'Library Road',
      description: 'Study materials.',
      contact: '+91 88888 55555',
      imageUrl: 'http://localhost:5000/uploads/businesses/review-reaction-store.png',
      status: 'approved',
      reviews: [
        {
          _id: 'review-60',
          reviewer: 'student-9',
          rating: 4,
          comment: 'Helpful stop before class.',
          likedBy: [],
          dislikedBy: ['student-4'],
          createdAt: new Date('2026-04-08T10:30:00.000Z'),
        },
      ],
      createdAt: new Date('2026-04-08T10:25:00.000Z'),
      updatedAt: new Date('2026-04-08T10:30:00.000Z'),
      save: vi.fn(async function save() {
        return this;
      }),
    };

    const findById = vi.spyOn(Business, 'findById');
    findById
      .mockResolvedValueOnce(approvedBusiness)
      .mockResolvedValueOnce(approvedBusiness);

    const likeResponse = await request(createApp({ userId: 'student-1', role: 'student' }))
      .patch('/api/businesses/business-60/reviews/review-60/reaction')
      .send({
        reaction: 'like',
      });

    expect(likeResponse.status).toBe(200);
    expect(approvedBusiness.save).toHaveBeenCalledTimes(1);
    expect(likeResponse.body.business.reviews).toEqual([
      expect.objectContaining({
        id: 'review-60',
        likeCount: 1,
        dislikeCount: 1,
        viewerReaction: 'like',
      }),
    ]);

    const dislikeResponse = await request(createApp({ userId: 'student-1', role: 'student' }))
      .patch('/api/businesses/business-60/reviews/review-60/reaction')
      .send({
        reaction: 'dislike',
      });

    expect(dislikeResponse.status).toBe(200);
    expect(approvedBusiness.save).toHaveBeenCalledTimes(2);
    expect(dislikeResponse.body.business.reviews).toEqual([
      expect.objectContaining({
        id: 'review-60',
        likeCount: 0,
        dislikeCount: 2,
        viewerReaction: 'dislike',
      }),
    ]);
  });
});
