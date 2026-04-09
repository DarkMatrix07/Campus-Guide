import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TopRatedBusinesses from '@/pages/TopRatedBusinesses';

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

describe('top-rated businesses page', () => {
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

  it('renders ranked businesses grouped by category and opens the detail page', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: {
        success: true,
        sections: [
          {
            category: 'Food',
            businesses: [
              {
                id: 'business-1',
                name: 'North Gate Cafe',
                category: 'Cafe',
                directoryCategory: 'Food',
                location: 'North Gate',
                description: 'Coffee and snacks.',
                imageUrl: 'http://localhost:5000/uploads/businesses/north-gate-cafe.png',
                averageRating: 4.8,
                reviewCount: 12,
              },
            ],
          },
          {
            category: 'Stationery',
            businesses: [
              {
                id: 'business-2',
                name: 'Campus Prints',
                category: 'Stationery',
                directoryCategory: 'Stationery',
                location: 'Library Road',
                description: 'Printouts and notes.',
                imageUrl: 'http://localhost:5000/uploads/businesses/campus-prints.png',
                averageRating: 4.2,
                reviewCount: 7,
              },
            ],
          },
          {
            category: 'PG',
            businesses: [],
          },
        ],
      },
    });

    const { container } = renderWithRouter(<TopRatedBusinesses />);

    expect(await screen.findByRole('heading', { name: /top rated/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /food top rated/i })).toBeInTheDocument();
    expect(screen.getAllByText('North Gate Cafe').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Campus Prints').length).toBeGreaterThan(0);
    expect(screen.getByText(/no rated businesses in this category yet/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /view details for north gate cafe/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/businesses/business-1');
    expectNoInlineStyles(container);
  });
});
