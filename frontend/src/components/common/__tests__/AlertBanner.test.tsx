import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlertBanner } from '../AlertBanner';

describe('AlertBanner component', () => {
  it('renders alert message correctly', () => {
    render(<AlertBanner message="Invalid email or password" type="error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
  });

  it('renders nothing when message is empty', () => {
    const { container } = render(<AlertBanner message="" />);
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose callback when dismiss button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <AlertBanner
        message="Session expired"
        type="error"
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /dismiss alert/i });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders success and info types without error', () => {
    const { rerender } = render(<AlertBanner message="Success!" type="success" />);
    expect(screen.getByText('Success!')).toBeInTheDocument();

    rerender(<AlertBanner message="Heads up!" type="info" />);
    expect(screen.getByText('Heads up!')).toBeInTheDocument();
  });
});
