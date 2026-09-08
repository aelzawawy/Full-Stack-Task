import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthForm } from '../useAuthForm';
import type { ValidationSchema } from '../useAuthForm';

interface TestFormValues {
  email: string;
  name: string;
}

const testSchema: ValidationSchema<TestFormValues> = {
  email: (val: string) => (!val ? 'Email required' : null),
  name: (val: string) => (val.length < 3 ? 'Name too short' : null),
};

describe('useAuthForm hook', () => {
  it('initializes with default values and empty errors', () => {
    const { result } = renderHook(() =>
      useAuthForm<TestFormValues>(
        { email: '', name: '' },
        testSchema,
        vi.fn()
      )
    );

    expect(result.current.values).toEqual({ email: '', name: '' });
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.serverError).toBeNull();
  });

  it('updates form values on handleChange', () => {
    const { result } = renderHook(() =>
      useAuthForm<TestFormValues>(
        { email: '', name: '' },
        testSchema,
        vi.fn()
      )
    );

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'alex@example.com' },
      } as any);
    });

    expect(result.current.values.email).toBe('alex@example.com');
  });

  it('validates and marks field as touched on handleBlur', () => {
    const { result } = renderHook(() =>
      useAuthForm<TestFormValues>(
        { email: '', name: 'Jo' },
        testSchema,
        vi.fn()
      )
    );

    act(() => {
      result.current.handleBlur({
        target: { name: 'name', value: 'Jo' },
      } as any);
    });

    expect(result.current.touched.name).toBe(true);
    expect(result.current.errors.name).toBe('Name too short');
  });

  it('prevents submission when validation rules fail', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useAuthForm<TestFormValues>(
        { email: '', name: '' },
        testSchema,
        onSubmit
      )
    );

    const preventDefault = vi.fn();
    await act(async () => {
      await result.current.handleSubmit({ preventDefault } as any);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors.email).toBe('Email required');
    expect(result.current.errors.name).toBe('Name too short');
  });

  it('executes onSubmit when validation passes', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAuthForm<TestFormValues>(
        { email: 'test@example.com', name: 'John Doe' },
        testSchema,
        onSubmit
      )
    );

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: 'John Doe',
    });
    expect(result.current.serverError).toBeNull();
  });

  it('captures and normalizes fetch network error on submission failure', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Failed to fetch'));
    const { result } = renderHook(() =>
      useAuthForm<TestFormValues>(
        { email: 'test@example.com', name: 'John Doe' },
        testSchema,
        onSubmit
      )
    );

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.serverError).toContain('Unable to connect to the server');
  });
});
