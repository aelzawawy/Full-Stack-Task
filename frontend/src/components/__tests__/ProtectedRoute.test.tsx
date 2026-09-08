import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '../ProtectedRoute';
import * as useAuthModule from '../../hooks/useAuth';
import * as useRouterModule from '../../hooks/useRouter';

describe('ProtectedRoute component', () => {
  it('displays loading spinner while session is initializing', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
    });
    vi.spyOn(useRouterModule, 'useRouter').mockReturnValue({
      pathname: '/dashboard',
      navigate: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Secret Dashboard Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText(/checking authentication\.\.\./i)).toBeInTheDocument();
    expect(screen.queryByText('Secret Dashboard Content')).not.toBeInTheDocument();
  });

  it('redirects to /signin when user is unauthenticated', () => {
    const navigate = vi.fn();
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
    });
    vi.spyOn(useRouterModule, 'useRouter').mockReturnValue({
      pathname: '/dashboard',
      navigate,
    });

    render(
      <ProtectedRoute>
        <div>Secret Dashboard Content</div>
      </ProtectedRoute>
    );

    expect(navigate).toHaveBeenCalledWith('/signin', true);
    expect(screen.queryByText('Secret Dashboard Content')).not.toBeInTheDocument();
  });

  it('renders protected children when user is authenticated', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', name: 'Jane', email: 'jane@example.com' },
      token: 'valid-token',
      login: vi.fn(),
      logout: vi.fn(),
    });
    vi.spyOn(useRouterModule, 'useRouter').mockReturnValue({
      pathname: '/dashboard',
      navigate: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Secret Dashboard Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Secret Dashboard Content')).toBeInTheDocument();
  });
});
