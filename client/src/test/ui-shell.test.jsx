import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import StudentDashboard from '@/pages/dashboards/StudentDashboard';
import OwnerDashboard from '@/pages/dashboards/OwnerDashboard';
import AdminDashboard from '@/pages/dashboards/AdminDashboard';

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
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('framer-motion', () => {
  const createMotionComponent = (tag) => {
    const MotionComponent = ({
      children,
      animate: _animate,
      exit: _exit,
      initial: _initial,
      layout: _layout,
      transition: _transition,
      variants: _variants,
      whileHover: _whileHover,
      whileTap: _whileTap,
      ...props
    }) => {
      const Tag = tag;
      return <Tag {...props}>{children}</Tag>;
    };

    return MotionComponent;
  };

  return {
    motion: new Proxy(
      {},
      {
        get: (_, tag) => createMotionComponent(tag),
      }
    ),
  };
});

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

describe('client UI shell', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockApi.get.mockReset();
    mockApi.patch.mockReset();
    mockApi.post.mockReset();
    mockAuth.value = {
      user: { name: 'Aarav Sharma', role: 'student' },
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    };
  });

  it('renders the login page with semantic structure and no inline styles', () => {
    const { container } = renderWithRouter(<Login />);

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByText(/campus guide/i)).toBeInTheDocument();
    expectNoInlineStyles(container);
  });

  it('renders the signup page with role selection and no inline styles', () => {
    const { container } = renderWithRouter(<Signup />);

    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^student/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^shop owner/i })).toBeInTheDocument();
    expectNoInlineStyles(container);
  });

  it('renders the student dashboard empty directory state with no inline styles', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: {
        success: true,
        businesses: [],
      },
    });

    const { container } = renderWithRouter(<StudentDashboard />);

    expect(await screen.findByRole('heading', { name: /business directory/i })).toBeInTheDocument();
    expect(screen.getByText(/^student$/i)).toBeInTheDocument();
    expect(screen.getByText(/no approved businesses available yet\./i)).toBeInTheDocument();
    expectNoInlineStyles(container);
  });

  it('renders the owner dashboard registration state with no inline styles', async () => {
    mockAuth.value = {
      user: { name: 'Nisha Traders', role: 'owner' },
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    };
    mockApi.get.mockRejectedValueOnce({ response: { status: 404 } });

    const { container } = renderWithRouter(<OwnerDashboard />);

    expect(await screen.findByRole('heading', { name: /register your business/i })).toBeInTheDocument();
    expect(screen.getByText(/^owner$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/business name/i)).toBeInTheDocument();
    expectNoInlineStyles(container);
  });

  it('renders the admin dashboard empty queue state with no inline styles', async () => {
    mockAuth.value = {
      user: { name: 'Platform Admin', role: 'admin' },
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    };
    mockApi.get.mockResolvedValueOnce({
      data: {
        success: true,
        businesses: [],
      },
    });

    const { container } = renderWithRouter(<AdminDashboard />);

    expect(await screen.findByRole('heading', { name: /admin workspace/i })).toBeInTheDocument();
    expect(screen.getByText(/^admin$/i)).toBeInTheDocument();
    expect(screen.getByText(/no pending businesses right now\./i)).toBeInTheDocument();
    expectNoInlineStyles(container);
  });
});
