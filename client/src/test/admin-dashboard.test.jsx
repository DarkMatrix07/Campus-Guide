import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminDashboard from '@/pages/dashboards/AdminDashboard';

const mockNavigate = vi.fn();
const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
}));
const mockAuth = vi.hoisted(() => ({
  value: {
    user: { name: 'Platform Admin', role: 'admin' },
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

describe('admin dashboard approval workflow', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockApi.get.mockReset();
    mockApi.patch.mockReset();
    mockApi.post.mockReset();
    mockAuth.value = {
      user: { name: 'Platform Admin', role: 'admin' },
      loading: false,
      logout: vi.fn(),
    };
  });

  it('renders pending businesses and processes approve and reject actions', async () => {
    mockApi.get
      .mockResolvedValueOnce({
        data: {
          success: true,
          businesses: [
            {
              id: 'business-1',
              name: 'North Gate Cafe',
              category: 'Cafe',
              location: 'North Gate',
              description: 'Coffee and snacks.',
              contact: '+91 99999 11111',
              imageUrl: 'http://localhost:5000/uploads/businesses/north-gate-cafe.png',
              status: 'pending',
              reviewCount: 0,
              averageRating: 0,
              reviews: [],
              owner: {
                id: 'owner-1',
                name: 'Nisha Traders',
                email: 'nisha@example.com',
              },
              createdAt: '2026-04-08T08:10:00.000Z',
              updatedAt: '2026-04-08T08:10:00.000Z',
            },
            {
              id: 'business-2',
              name: 'Sunrise Store',
              category: 'Essentials',
              location: 'Market Road',
              description: 'Daily essentials.',
              contact: '+91 88888 00000',
              imageUrl: 'http://localhost:5000/uploads/businesses/sunrise-store.png',
              status: 'pending',
              reviewCount: 0,
              averageRating: 0,
              reviews: [],
              owner: {
                id: 'owner-2',
                name: 'Sunrise Owner',
                email: 'owner@example.com',
              },
              createdAt: '2026-04-08T08:20:00.000Z',
              updatedAt: '2026-04-08T08:20:00.000Z',
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          businesses: [
            {
              id: 'business-2',
              name: 'Sunrise Store',
              category: 'Essentials',
              location: 'Market Road',
              description: 'Daily essentials.',
              contact: '+91 88888 00000',
              imageUrl: 'http://localhost:5000/uploads/businesses/sunrise-store.png',
              status: 'pending',
              reviewCount: 0,
              averageRating: 0,
              reviews: [],
              owner: {
                id: 'owner-2',
                name: 'Sunrise Owner',
                email: 'owner@example.com',
              },
              createdAt: '2026-04-08T08:20:00.000Z',
              updatedAt: '2026-04-08T08:20:00.000Z',
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          businesses: [],
        },
      });

    mockApi.patch
      .mockResolvedValueOnce({
        data: {
          success: true,
          business: { id: 'business-1', status: 'approved' },
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          business: { id: 'business-2', status: 'rejected' },
        },
    });

    const { container } = renderWithRouter(<AdminDashboard />);

    expect(await screen.findByRole('heading', { name: /pending business approvals/i })).toBeInTheDocument();
    expect(screen.getByText('North Gate Cafe')).toBeInTheDocument();
    expect(screen.getByText('Sunrise Store')).toBeInTheDocument();
    expect(screen.getByText('Nisha Traders')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /approve north gate cafe/i }));

    await waitFor(() => expect(mockApi.patch).toHaveBeenCalledWith('/businesses/business-1/status', { status: 'approved' }));
    expect(await screen.findByText('Sunrise Store')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /reject sunrise store/i }));

    await waitFor(() => expect(mockApi.patch).toHaveBeenCalledWith('/businesses/business-2/status', { status: 'rejected' }));
    expect(await screen.findByText(/no pending businesses right now\./i)).toBeInTheDocument();
    expectNoInlineStyles(container);
  });
});
