import { useState } from 'react';
import type { ChangeEvent, FocusEvent, FormEvent } from 'react';

export type Validator<T> = (value: any, allValues: T) => string | null;

export type ValidationSchema<T> = {
  [K in keyof T]?: Validator<T>;
};

export function useAuthForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema: ValidationSchema<T>,
  onSubmit: (values: T) => Promise<void> | void
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validateField = (field: keyof T, val: any, currentValues: T): string | null => {
    const validator = validationSchema[field];
    return validator ? validator(val, currentValues) : null;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldKey = name as keyof T;
    const updatedValues = { ...values, [fieldKey]: value };
    setValues(updatedValues);
    setServerError(null);

    // If user has already blurred this field, revalidate live on change
    if (touched[fieldKey]) {
      const error = validateField(fieldKey, value, updatedValues);
      setErrors((prev) => ({
        ...prev,
        [fieldKey]: error || undefined,
      }));
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldKey = name as keyof T;
    setTouched((prev) => ({ ...prev, [fieldKey]: true }));

    const error = validateField(fieldKey, value, values);
    setErrors((prev) => ({
      ...prev,
      [fieldKey]: error || undefined,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Run complete validation
    const newErrors: Partial<Record<keyof T, string>> = {};
    let hasError = false;

    for (const key in validationSchema) {
      const error = validateField(key, values[key], values);
      if (error) {
        newErrors[key] = error;
        hasError = true;
      }
    }

    setErrors(newErrors);
    // Mark all as touched
    const allTouched: Partial<Record<keyof T, boolean>> = {};
    for (const key in values) {
      allTouched[key] = true;
    }
    setTouched(allTouched);

    if (hasError) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err: unknown) {
      let message = err instanceof Error ? err.message : 'An error occurred during submission.';
      if (
        message.toLowerCase().includes('failed to fetch') ||
        message.toLowerCase().includes('networkerror') ||
        message.toLowerCase().includes('load failed')
      ) {
        message = 'Unable to connect to the server. Please check your connection or verify the backend is running.';
      }
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setServerError(null);
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    serverError,
    setServerError,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  };
}
