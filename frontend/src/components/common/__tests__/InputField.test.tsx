import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputField } from '../InputField';

describe('InputField component', () => {
  it('renders label and associated input correctly', () => {
    render(<InputField label="Email Address" id="email" name="email" />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it('handles user input change events', () => {
    const handleChange = vi.fn();
    render(
      <InputField
        label="Username"
        id="username"
        name="username"
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText(/username/i);
    fireEvent.change(input, { target: { value: 'johndoe' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('does not display error message if touched is false', () => {
    render(
      <InputField
        label="Password"
        id="password"
        name="password"
        error="Password is too short"
        touched={false}
      />
    );

    expect(screen.queryByText(/password is too short/i)).not.toBeInTheDocument();
    const input = screen.getByLabelText(/password/i);
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('displays error message and sets aria-invalid when touched is true and error exists', () => {
    render(
      <InputField
        label="Password"
        id="password"
        name="password"
        error="Password is too short"
        touched={true}
      />
    );

    expect(screen.getByText(/password is too short/i)).toBeInTheDocument();
    const input = screen.getByLabelText(/password/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('handles disabled state properly', () => {
    render(
      <InputField
        label="Full Name"
        id="name"
        name="name"
        disabled
      />
    );

    expect(screen.getByLabelText(/full name/i)).toBeDisabled();
  });
});
