import { InputField } from '../components/common/InputField';
import { Button } from '../components/common/Button';
import { AlertBanner } from '../components/common/AlertBanner';
import { useAuthForm } from '../hooks/useAuthForm';
import type { ValidationSchema } from '../hooks/useAuthForm';
import { apiClient } from '../services/apiClient';
import type { AuthResponse } from '../types/auth.types';
import { useAuth } from '../hooks/useAuth';

interface SigninPageProps {
  onNavigateToSignup: () => void;
  onSigninSuccess: () => void;
}

interface SigninFormValues {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signinValidationSchema: ValidationSchema<SigninFormValues> = {
  email: (value: string) => {
    if (!value || !value.trim()) return 'Email is required';
    if (!EMAIL_REGEX.test(value.trim())) return 'Please enter a valid email address';
    return null;
  },
  password: (value: string) => {
    if (!value) return 'Password is required';
    return null;
  },
};

export const SigninPage = ({
  onNavigateToSignup,
  onSigninSuccess,
}: SigninPageProps) => {
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
  } = useAuthForm<SigninFormValues>(
    { email: '', password: '' },
    signinValidationSchema,
    async (formValues) => {
      const response = await apiClient.post<AuthResponse>('/auth/signin', {
        email: formValues.email.trim().toLowerCase(),
        password: formValues.password,
      });

      login(response.access_token, response.user);
      onSigninSuccess();
    }
  );

  return (
    <div className="w-full max-w-md mx-auto p-7 sm:p-9 glass-panel rounded-3xl relative overflow-hidden transition-all duration-300">
      <div className="mb-7 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#e0829d]/10 border border-[#e0829d]/25 mb-3.5 text-[#e0829d] shadow-[0_0_15px_rgba(224,130,157,0.2)]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
        <p className="text-sm text-[#dac4d0]/80 mt-1.5">Sign in to your secure workspace</p>
      </div>

      {serverError && (
        <div className="mb-5">
          <AlertBanner message={serverError} onClose={() => setServerError(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InputField
          label="Email Address"
          id="signin-email"
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

        <InputField
          label="Password"
          id="signin-password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={values.password}
          error={errors.password}
          touched={touched.password}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          className="w-full mt-3 py-3 text-base shadow-lg cursor-pointer"
        >
          Sign In
        </Button>
      </form>

      <div className="mt-7 pt-5 border-t border-[#dac4d0]/10 text-center text-sm text-[#dac4d0]/70">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onNavigateToSignup}
          className="font-semibold text-[#e0829d] hover:text-[#e895ac] transition-colors cursor-pointer hover:underline"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};
