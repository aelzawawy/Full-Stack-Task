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
      <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-slate-300">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        aria-invalid={showError}
        className={`neu-inset w-full px-4 py-3 rounded-xl text-sm text-slate-100 transition-all duration-200 outline-none
          placeholder:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed
          ${
            showError
              ? 'border-rose-500/80 bg-rose-950/30 text-rose-100 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.7),0_0_12px_rgba(244,63,94,0.35)]'
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
