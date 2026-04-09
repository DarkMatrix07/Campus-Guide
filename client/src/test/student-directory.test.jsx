import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StudentDashboard from '@/pages/dashboards/StudentDashboard';

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

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

const expectNoInlineStyles = (container) => {
  expect(container.querySelector('[style]')).not.toBeInTheDocument();
};

describe('student business directory', () => {
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

  it('renders approved businesses and filters by category, rating, and search', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: {
        success: true,
        businesses: [
          {
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
            averageRating: 4.6,
            reviewCount: 12,
            reviews: [],
            viewerHasReviewed: false,
            viewerReviewId: null,
            createdAt: '2026-04-08T09:00:00.000Z',
            updatedAt: '2026-04-08T09:10:00.000Z',
          },
          {
            id: 'business-2',
            name: 'Campus Prints',
            category: 'Stationery',
            directoryCategory: 'Stationery',
            location: 'Library Road',
            description: 'Printouts and notes.',
            contact: '+91 88888 22222',
            imageUrl: 'http://localhost:5000/uploads/businesses/campus-prints.png',
            images: ['http://localhost:5000/uploads/businesses/campus-prints.png'],
            status: 'approved',
            averageRating: 3.1,
            reviewCount: 5,
            reviews: [],
            viewerHasReviewed: false,
            viewerReviewId: null,
            createdAt: '2026-04-08T09:15:00.000Z',
            updatedAt: '2026-04-08T09:20:00.000Z',
          },
          {
            id: 'business-3',
            name: 'Green Residency',
            category: 'PG',
            directoryCategory: 'PG',
            location: 'West Block',
            description: 'Student accommodation.',
            contact: '+91 77777 33333',
            imageUrl: 'http://localhost:5000/uploads/businesses/green-residency.png',
            images: ['http://localhost:5000/uploads/businesses/green-residency.png'],
            status: 'approved',
            averageRating: 4.2,
            reviewCount: 8,
            reviews: [],
            viewerHasReviewed: false,
            viewerReviewId: null,
            createdAt: '2026-04-08T09:25:00.000Z',
            updatedAt: '2026-04-08T09:30:00.000Z',
          },
        ],
      },
    });

    const { container } = renderWithRouter(<StudentDashboard />);

    expect(await screen.findByRole('heading', { name: /business directory/i })).toBeInTheDocument();
    expect(screen.getByText('North Gate Cafe')).toBeInTheDocument();
    expect(screen.getByText('Campus Prints')).toBeInTheDocument();
    expect(screen.getByText('Green Residency')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^food$/i }));
    expect(screen.getByText('North Gate Cafe')).toBeInTheDocument();
    expect(screen.queryByText('Campus Prints')).not.toBeInTheDocument();
    expect(screen.queryByText('Green Residency')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /all categories/i }));
    expect(screen.getByText('Campus Prints')).toBeInTheDocument();
    expect(screen.getByText('Green Residency')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^4\.0\+$/i }));
    expect(screen.getByText('North Gate Cafe')).toBeInTheDocument();
    expect(screen.queryByText('Campus Prints')).not.toBeInTheDocument();
    expect(screen.getByText('Green Residency')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/search businesses/i), {
      target: { value: 'west block' },
    });

    expect(screen.getByText('Green Residency')).toBeInTheDocument();
    expect(screen.queryByText('North Gate Cafe')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /view details for green residency/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/businesses/business-3');
    expectNoInlineStyles(container);
  });
});
