import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OwnerDashboard from '@/pages/dashboards/OwnerDashboard';

const mockNavigate = vi.fn();
const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
}));
const mockAuth = vi.hoisted(() => ({
  value: {
    user: { name: 'Nisha Traders', role: 'owner' },
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

describe('owner dashboard business setup', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockApi.get.mockReset();
    mockApi.patch.mockReset();
    mockApi.post.mockReset();
    mockAuth.value = {
      user: { name: 'Nisha Traders', role: 'owner' },
      loading: false,
      logout: vi.fn(),
    };
  });

  it('submits the business setup form and switches to the submitted business summary', async () => {
    mockApi.get.mockRejectedValueOnce({ response: { status: 404 } });
    mockApi.post.mockResolvedValueOnce({
      data: {
        success: true,
        business: {
          id: 'business-1',
          name: 'North Gate Cafe',
          category: 'Cafe',
          location: 'North Gate, Block A',
          description: 'Quick coffee and snacks near the main gate.',
          contact: '+91 99999 00000',
          imageUrl: 'http://localhost:5000/uploads/businesses/north-gate-cafe.png',
          status: 'pending',
          averageRating: 0,
          reviewCount: 0,
          reviews: [],
          createdAt: '2026-04-07T18:30:00.000Z',
          updatedAt: '2026-04-07T18:30:00.000Z',
        },
      },
    });

    const { container } = renderWithRouter(<OwnerDashboard />);

    expect(await screen.findByRole('heading', { name: /register your business/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/business name/i), { target: { value: 'North Gate Cafe' } });
    fireEvent.change(screen.getByLabelText(/^category$/i), { target: { value: 'Cafe' } });
    fireEvent.change(screen.getByLabelText(/^location$/i), { target: { value: 'North Gate, Block A' } });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Quick coffee and snacks near the main gate.' },
    });
    fireEvent.change(screen.getByLabelText(/contact/i), { target: { value: '+91 99999 00000' } });

    const imageFile = new File(['fake-image'], 'north-gate-cafe.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText(/storefront image/i), {
      target: { files: [imageFile] },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit business/i }));

    await waitFor(() => expect(mockApi.post).toHaveBeenCalledTimes(1));

    const [url, formData] = mockApi.post.mock.calls[0];
    expect(url).toBe('/businesses');
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get('name')).toBe('North Gate Cafe');
    expect(formData.get('category')).toBe('Cafe');
    expect(formData.get('location')).toBe('North Gate, Block A');
    expect(formData.get('description')).toBe('Quick coffee and snacks near the main gate.');
    expect(formData.get('contact')).toBe('+91 99999 00000');
    expect(formData.get('image')).toBe(imageFile);

    expect(await screen.findByRole('heading', { name: /your business/i })).toBeInTheDocument();
    expect(screen.getByText(/pending review/i)).toBeInTheDocument();
    expectNoInlineStyles(container);
  });

  it('renders the submitted business rating and public reviews without reviewer names', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: {
        success: true,
        business: {
          id: 'business-2',
          name: 'Sunrise Store',
          category: 'Essentials',
          location: 'Market Road',
          description: 'Daily essentials for students.',
          contact: '+91 88888 00000',
          imageUrl: 'http://localhost:5000/uploads/businesses/sunrise-store.png',
          status: 'pending',
          averageRating: 4.5,
          reviewCount: 2,
          reviews: [
            {
              id: 'review-1',
              rating: 5,
              comment: 'Loved the fast service.',
              createdAt: '2026-04-07T18:45:00.000Z',
            },
            {
              id: 'review-2',
              rating: 4,
              comment: 'Good pricing for students.',
              createdAt: '2026-04-07T18:50:00.000Z',
            },
          ],
          createdAt: '2026-04-07T18:40:00.000Z',
          updatedAt: '2026-04-07T18:50:00.000Z',
        },
      },
    });

    const { container } = renderWithRouter(<OwnerDashboard />);

    expect(await screen.findByRole('heading', { name: /your business/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /public reviews/i })).toBeInTheDocument();
    expect(screen.getByText('Loved the fast service.')).toBeInTheDocument();
    expect(screen.getByText('Good pricing for students.')).toBeInTheDocument();
    expect(screen.getByText(/4.5 average rating/i)).toBeInTheDocument();
    expect(screen.queryByText(/student reviewer/i)).not.toBeInTheDocument();
    expectNoInlineStyles(container);
  });

  it('shows approved status copy after admin approval updates the business', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: {
        success: true,
        business: {
          id: 'business-3',
          name: 'Approved Cafe',
          category: 'Cafe',
          location: 'Main Road',
          description: 'Approved listing.',
          contact: '+91 77777 11111',
          imageUrl: 'http://localhost:5000/uploads/businesses/approved-cafe.png',
          status: 'approved',
          averageRating: 4.8,
          reviewCount: 3,
          reviews: [],
          createdAt: '2026-04-08T08:45:00.000Z',
          updatedAt: '2026-04-08T09:00:00.000Z',
        },
      },
    });

    renderWithRouter(<OwnerDashboard />);

    expect(await screen.findByRole('heading', { name: /your business/i })).toBeInTheDocument();
    expect(screen.getByText(/^approved$/i)).toBeInTheDocument();
    expect(screen.getByText(/approved and public/i)).toBeInTheDocument();
    expect(
      screen.getByText(/your business is now visible in the public business listings\./i)
    ).toBeInTheDocument();
  });
});
