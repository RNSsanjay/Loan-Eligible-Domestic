import React, { useState, useRef, useId } from 'react';

interface BaseInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  multiline?: boolean;
  rows?: number;
  loading?: boolean;
  success?: boolean;
}

interface InputProps extends BaseInputProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  multiline?: false;
}

interface TextareaProps extends BaseInputProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  multiline: true;
}

export const Input: React.FC<InputProps | TextareaProps> = ({
  label,
  error,
  helperText,
  fullWidth = true,
  leftIcon,
  rightIcon,
  variant = 'outlined',
  inputSize = 'md',
  multiline = false,
  rows = 3,
  loading = false,
  success = false,
  className = '',
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const id = useId();

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.(e as any);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(e as any);
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const variantClasses = {
    default: 'border border-gray-300 bg-white',
    filled: 'border-0 bg-gray-100 hover:bg-gray-50',
    outlined: 'border-2 border-gray-200 bg-white hover:border-gray-300'
  };

  const getInputClasses = () => {
    let classes = [
      'block w-full rounded-xl transition-all duration-200 ease-in-out',
      'placeholder-gray-400 font-medium',
      sizeClasses[inputSize],
      variantClasses[variant]
    ];

    if (error) {
      classes.push('border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500/20');
    } else if (success) {
      classes.push('border-green-300 text-green-900 focus:border-green-500 focus:ring-green-500/20');
    } else if (isFocused) {
      classes.push('border-green-500 ring-4 ring-green-500/20 focus:border-green-600');
    } else {
      classes.push('focus:border-green-500 focus:ring-4 focus:ring-green-500/20');
    }

    if (leftIcon) classes.push('pl-11');
    if (rightIcon || loading) classes.push('pr-11');
    if (fullWidth) classes.push('w-full');

    return classes.join(' ');
  };

  const getLabelClasses = () => {
    let classes = [
      'block text-sm font-semibold mb-2 transition-colors duration-200',
    ];

    if (error) {
      classes.push('text-red-600');
    } else if (success) {
      classes.push('text-green-600');
    } else if (isFocused) {
      classes.push('text-green-600');
    } else {
      classes.push('text-gray-700');
    }

    return classes.join(' ');
  };

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={id} className={getLabelClasses()}>
          {label}
          {'required' in props && props.required && <span className="text-green-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className={`w-5 h-5 ${error ? 'text-red-400' : success ? 'text-green-400' : isFocused ? 'text-green-500' : 'text-gray-400'} transition-colors duration-200`}>
              {leftIcon}
            </div>
          </div>
        )}

        {/* Input/Textarea */}
        {multiline ? (
          <textarea
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            id={id}
            ref={textareaRef}
            className={`${getInputClasses()} ${className}`}
            onFocus={handleFocus}
            onBlur={handleBlur}
            rows={rows}
          />
        ) : (
          <input
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            id={id}
            ref={inputRef}
            className={`${getInputClasses()} ${className}`}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        )}

        {/* Right Icon or Loading */}
        {(rightIcon || loading) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {loading ? (
              <div className="w-5 h-5 border-2 border-green-300 border-t-green-600 rounded-full animate-spin"></div>
            ) : (
              <div className={`w-5 h-5 ${error ? 'text-red-400' : success ? 'text-green-400' : isFocused ? 'text-green-500' : 'text-gray-400'} transition-colors duration-200`}>
                {rightIcon}
              </div>
            )}
          </div>
        )}

        {/* Success Icon */}
        {success && !rightIcon && !loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Error Icon */}
        {error && !rightIcon && !loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Focus Ring Animation */}
        {isFocused && (
          <div className="absolute inset-0 rounded-xl ring-4 ring-green-500/20 pointer-events-none transition-all duration-200"></div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-green-600 flex items-center animate-slideInDown">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {helperText}
        </p>
      )}

      {/* Success Message */}
      {success && !error && (
        <p className="mt-2 text-sm text-green-600 flex items-center animate-slideInDown">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Input validated successfully!
        </p>
      )}
    </div>
  );
};