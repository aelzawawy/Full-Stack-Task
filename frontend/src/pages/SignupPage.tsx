import { InputField } from '../components/common/InputField';
import { Button } from '../components/common/Button';
import { AlertBanner } from '../components/common/AlertBanner';
import { useAuthForm } from '../hooks/useAuthForm';
import type { ValidationSchema } from '../hooks/useAuthForm';
import { apiClient } from '../services/apiClient';
import type { AuthResponse } from '../types/auth.types';
import { useAuth } from '../hooks/useAuth';

interface SignupPageProps {
  onNavigateToSignin: () => void;
  onSignupSuccess: () => void;
}

interface SignupFormValues {
  name: string;
  email: string;
  password: string;
}

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signupValidationSchema: ValidationSchema<SignupFormValues> = {
  name: (value: string) => {
    if (!value || !value.trim()) return 'Name is required';
    if (value.trim().length < 3) return 'Name must be at least 3 characters';
    return null;
  },
  email: (value: string) => {
    if (!value || !value.trim()) return 'Email is required';
    if (!EMAIL_REGEX.test(value.trim())) return 'Please enter a valid email address';
    return null;
  },
  password: (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters long';
    if (!PASSWORD_REGEX.test(value)) {
      return 'Password must contain at least 1 letter, 1 number, and 1 special character (@$!%*#?&)';
    }
    return null;
  },
};

export const SignupPage = ({
  onNavigateToSignin,
  onSignupSuccess,
}: SignupPageProps) => {
  const { login } = useAuth();

  const {
    values,
    errors,
    touched,
    isSubmitting,
    serverError,
    setServerError,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useAuthForm<SignupFormValues>(
    { name: '', email: '', password: '' },
    signupValidationSchema,
    async (formValues) => {
      const response = await apiClient.post<AuthResponse>('/auth/signup', {
        name: formValues.name.trim(),
        email: formValues.email.trim().toLowerCase(),
        password: formValues.password,
      });

      login(response.access_token, response.user);
      onSignupSuccess();
    }
  );

  return (
    <div className="w-full max-w-md mx-auto p-7 sm:p-9 glass-panel rounded-3xl relative overflow-hidden transition-all duration-300">
      <div className="mb-7 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#e0829d]/10 border border-[#e0829d]/25 mb-3.5 text-[#e0829d] shadow-[0_0_15px_rgba(224,130,157,0.2)]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Create an Account</h2>
        <p className="text-sm text-[#dac4d0]/80 mt-1.5">Sign up to access your personal dashboard</p>
      </div>

      {serverError && (
        <div className="mb-5">
          <AlertBanner message={serverError} onClose={() => setServerError(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InputField
          label="Full Name"
          id="signup-name"
          name="name"
          type="text"
          placeholder="e.g. Jane Doe"
          value={values.name}
          error={errors.name}
          touched={touched.name}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting}
          autoComplete="name"
        />

        <InputField
          label="Email Address"
          id="signup-email"
          name="email"
          type="email"
          placeholder="e.g. jane@example.com"
          value={values.email}
          error={errors.email}
          touched={touched.email}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting}
          autoComplete="email"
        />

        <div>
          <InputField
            label="Password"
            id="signup-password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={values.password}
            error={errors.password}
            touched={touched.password}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            autoComplete="new-password"
          />
          <p className="text-xs text-[#dac4d0]/70 mt-2 leading-relaxed">
            Must be at least 8 characters with letters, numbers, and special characters.
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          className="w-full mt-3 py-3 text-base shadow-lg cursor-pointer"
        >
          Create Account
        </Button>
      </form>

      <div className="mt-7 pt-5 border-t border-[#dac4d0]/10 text-center text-sm text-[#dac4d0]/70">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onNavigateToSignin}
          className="font-semibold text-[#e0829d] hover:text-[#e895ac] transition-colors cursor-pointer hover:underline"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};
