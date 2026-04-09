import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BusinessDetail from '@/pages/BusinessDetail';

const mockNavigate = vi.fn();
const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
}));
const mockAuth = vi.hoisted(() => ({
  value: {
    user: { name: 'Aarav Sharma', role: 'student' },
    loading: false,
    logout: vi.fn(),
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuth.value,
}));

vi.mock('@/api/axios', () => ({
  default: mockApi,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderBusinessDetail = () => render(
  <MemoryRouter initialEntries={['/businesses/business-1']}>
    <Routes>
      <Route path="/businesses/:businessId" element={<BusinessDetail />} />
    </Routes>
  </MemoryRouter>
);

const expectNoInlineStyles = (container) => {
  expect(container.querySelector('[style]')).not.toBeInTheDocument();
};

describe('business detail and reviews', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockApi.get.mockReset();
    mockApi.patch.mockReset();
    mockApi.post.mockReset();
    mockAuth.value = {
      user: { name: 'Aarav Sharma', role: 'student' },
      loading: false,
      logout: vi.fn(),
    };
  });

  it('renders the business detail view and submits a student review', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: {
        success: true,
        business: {
          id: 'business-1',
          name: 'North Gate Cafe',
          category: 'Cafe',
          directoryCategory: 'Food',
          location: 'North Gate',
          description: 'Coffee and snacks.',
          contact: '+91 99999 11111',
          imageUrl: 'http://localhost:5000/uploads/businesses/north-gate-cafe.png',
          images: ['http://localhost:5000/uploads/businesses/north-gate-cafe.png'],
          status: 'approved',
          averageRating: 4.5,
          reviewCount: 1,
          viewerHasReviewed: false,
          viewerReviewId: null,
          reviews: [
            {
              id: 'review-1',
              rating: 4,
              comment: 'Loved the service.',
              likeCount: 2,
              dislikeCount: 0,
              viewerReaction: null,
              createdAt: '2026-04-08T10:10:00.000Z',
            },
          ],
          createdAt: '2026-04-08T10:00:00.000Z',
          updatedAt: '2026-04-08T10:10:00.000Z',
        },
      },
    });

    mockApi.post.mockResolvedValueOnce({
      data: {
        success: true,
        business: {
          id: 'business-1',
          name: 'North Gate Cafe',
          category: 'Cafe',
          directoryCategory: 'Food',
          location: 'North Gate',
          description: 'Coffee and snacks.',
          contact: '+91 99999 11111',
          imageUrl: 'http://localhost:5000/uploads/businesses/north-gate-cafe.png',
          images: ['http://localhost:5000/uploads/businesses/north-gate-cafe.png'],
          status: 'approved',
          averageRating: 4.5,
          reviewCount: 2,
          viewerHasReviewed: true,
          viewerReviewId: 'review-2',
          reviews: [
            {
              id: 'review-2',
              rating: 5,
              comment: 'Excellent late-night snacks.',
              likeCount: 0,
              dislikeCount: 0,
              viewerReaction: null,
              createdAt: '2026-04-08T10:20:00.000Z',
            },
            {
              id: 'review-1',
              rating: 4,
              comment: 'Loved the service.',
              likeCount: 2,
              dislikeCount: 0,
              viewerReaction: null,
              createdAt: '2026-04-08T10:10:00.000Z',
            },
          ],
          createdAt: '2026-04-08T10:00:00.000Z',
          updatedAt: '2026-04-08T10:20:00.000Z',
        },
      },
    });

    const { container } = renderBusinessDetail();

    expect(await screen.findByRole('heading', { name: /north gate cafe/i })).toBeInTheDocument();
    expect(screen.getByText(/4\.5 average rating/i)).toBeInTheDocument();
    expect(screen.getByText('Loved the service.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /rate 5 stars/i }));
    fireEvent.change(screen.getByLabelText(/write a review/i), {
      target: { value: 'Excellent late-night snacks.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

    await waitFor(() => expect(mockApi.post).toHaveBeenCalledWith('/businesses/business-1/reviews', {
      rating: 5,
      comment: 'Excellent late-night snacks.',
    }));

    expect(await screen.findByText('Excellent late-night snacks.')).toBeInTheDocument();
    expect(screen.getByText(/you already shared a review for this business\./i)).toBeInTheDocument();
    expectNoInlineStyles(container);
  });

  it('updates review reaction counts when a student likes a review', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: {
        success: true,
        business: {
          id: 'business-1',
          name: 'North Gate Cafe',
          category: 'Cafe',
          directoryCategory: 'Food',
          location: 'North Gate',
          description: 'Coffee and snacks.',
          contact: '+91 99999 11111',
          imageUrl: 'http://localhost:5000/uploads/businesses/north-gate-cafe.png',
          images: ['http://localhost:5000/uploads/businesses/north-gate-cafe.png'],
          status: 'approved',
          averageRating: 4.5,
          reviewCount: 1,
          viewerHasReviewed: true,
          viewerReviewId: 'review-own',
          reviews: [
            {
              id: 'review-1',
              rating: 4,
              comment: 'Loved the service.',
              likeCount: 0,
              dislikeCount: 0,
              viewerReaction: null,
              createdAt: '2026-04-08T10:10:00.000Z',
            },
          ],
          createdAt: '2026-04-08T10:00:00.000Z',
          updatedAt: '2026-04-08T10:10:00.000Z',
        },
      },
    });

    mockApi.patch.mockResolvedValueOnce({
      data: {
        success: true,
        business: {
          id: 'business-1',
          name: 'North Gate Cafe',
          category: 'Cafe',
          directoryCategory: 'Food',
          location: 'North Gate',
          description: 'Coffee and snacks.',
          contact: '+91 99999 11111',
          imageUrl: 'http://localhost:5000/uploads/businesses/north-gate-cafe.png',
          images: ['http://localhost:5000/uploads/businesses/north-gate-cafe.png'],
          status: 'approved',
          averageRating: 4.5,
          reviewCount: 1,
          viewerHasReviewed: true,
          viewerReviewId: 'review-own',
          reviews: [
            {
              id: 'review-1',
              rating: 4,
              comment: 'Loved the service.',
              likeCount: 1,
              dislikeCount: 0,
              viewerReaction: 'like',
              createdAt: '2026-04-08T10:10:00.000Z',
            },
          ],
          createdAt: '2026-04-08T10:00:00.000Z',
          updatedAt: '2026-04-08T10:15:00.000Z',
        },
      },
    });

    const { container } = renderBusinessDetail();

    expect(await screen.findByRole('heading', { name: /north gate cafe/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /like review loved the service\./i }));

    await waitFor(() => expect(mockApi.patch).toHaveBeenCalledWith(
      '/businesses/business-1/reviews/review-1/reaction',
      { reaction: 'like' }
    ));

    expect(await screen.findByText(/1 like/i)).toBeInTheDocument();
    expectNoInlineStyles(container);
  });
});
