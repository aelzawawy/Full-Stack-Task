import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotFoundPage } from '../NotFoundPage';
import * as useAuthModule from '../../hooks/useAuth';
import * as useRouterModule from '../../hooks/useRouter';

describe('NotFoundPage component', () => {
  it('displays 404 code and echoes the unknown pathname', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
    });
    vi.spyOn(useRouterModule, 'useRouter').mockReturnValue({
      pathname: '/some/unknown/route',
      navigate: vi.fn(),
    });

    render(<NotFoundPage />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('/some/unknown/route')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to sign in/i })).toBeInTheDocument();
  });

  it('navigates to /dashboard when return button is clicked by authenticated user', () => {
    const navigate = vi.fn();
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', name: 'Jane', email: 'jane@example.com' },
      token: 'valid-token',
      login: vi.fn(),
      logout: vi.fn(),
    });
    vi.spyOn(useRouterModule, 'useRouter').mockReturnValue({
      pathname: '/admin-portal',
      navigate,
    });

    render(<NotFoundPage />);

    const btn = screen.getByRole('button', { name: /back to dashboard/i });
    fireEvent.click(btn);

    expect(navigate).toHaveBeenCalledWith('/dashboard');
  });
});
