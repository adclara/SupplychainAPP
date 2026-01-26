/**
 * Button Component
 * @description Primary button component with variants, sizes, and loading states
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Button style variant */
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
    /** Button size */
    size?: 'sm' | 'md' | 'lg';
    /** Loading state */
    isLoading?: boolean;
    /** Icon to show on the left */
    leftIcon?: React.ReactNode;
    /** Icon to show on the right */
    rightIcon?: React.ReactNode;
    /** Full width button */
    fullWidth?: boolean;
}

/**
 * Primary button component with accessibility and touch-friendly sizing
 * @param props - Button properties
 * @returns Button element
 */
export function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className,
    disabled,
    ...props
}: ButtonProps): React.JSX.Element {
    const baseStyles = cn(
        // Base
        'inline-flex items-center justify-center gap-2',
        'font-medium rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Min touch target 44x44px
        'min-h-[44px] min-w-[44px]'
    );

    const variantStyles = {
        primary: cn(
            'bg-blue-500 text-white',
            'hover:bg-blue-600 active:bg-blue-700',
            'focus:ring-blue-500',
            'shadow-md hover:shadow-lg'
        ),
        secondary: cn(
            'bg-slate-200 text-slate-800',
            'hover:bg-slate-300 active:bg-slate-400',
            'focus:ring-slate-400',
            'border border-slate-300'
        ),
        danger: cn(
            'bg-red-500 text-white',
            'hover:bg-red-600 active:bg-red-700',
            'focus:ring-red-500',
            'shadow-md hover:shadow-lg'
        ),
        success: cn(
            'bg-emerald-500 text-white',
            'hover:bg-emerald-600 active:bg-emerald-700',
            'focus:ring-emerald-500',
            'shadow-md hover:shadow-lg'
        ),
        ghost: cn(
            'bg-transparent text-slate-700',
            'hover:bg-slate-100 active:bg-slate-200',
            'focus:ring-slate-400'
        ),
        outline: cn(
            'bg-transparent text-blue-600 border-2 border-blue-500',
            'hover:bg-blue-50 active:bg-blue-100',
            'focus:ring-blue-500'
        ),
    };

    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            className={cn(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                fullWidth && 'w-full',
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <LoadingSpinner size={size} />
                    <span>Loading...</span>
                </>
            ) : (
                <>
                    {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
                </>
            )}
        </button>
    );
}

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
}

function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps): React.JSX.Element {
    const sizeStyles = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
    };

    return (
        <svg
            className={cn('animate-spin', sizeStyles[size])}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
}

export default Button;
