import type { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  touched?: boolean;
}

export const InputField = ({
  label,
  error,
  touched,
  id,
  name,
  className = '',
  ...props
}: InputFieldProps) => {
  const inputId = id || name;
  const showError = touched && !!error;

  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-[#dac4d0]">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        aria-invalid={showError}
        className={`neu-inset w-full px-4 py-2.5 rounded-xl text-sm text-[#f5edf2] transition-all duration-150 outline-none
          placeholder:text-[#dac4d0]/40 disabled:opacity-50 disabled:cursor-not-allowed
          ${
            showError
              ? 'border-rose-500/80 bg-rose-950/20 text-rose-100 focus:border-rose-500 focus:ring-rose-500/20'
              : ''
          } ${className}`}
        {...props}
      />
      {showError && (
        <p className="text-xs text-rose-400 font-medium mt-1 flex items-center gap-1.5 animate-fadeIn">
          <svg className="w-3.5 h-3.5 shrink-0 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
