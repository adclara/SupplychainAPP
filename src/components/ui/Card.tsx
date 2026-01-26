/**
 * Card Component
 * @description Card container with glassmorphism effect and hover animations
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Card variant */
    variant?: 'default' | 'elevated' | 'glass' | 'interactive';
    /** Add padding */
    padded?: boolean;
    /** Add hover effect */
    hoverable?: boolean;
}

/**
 * Card container component with dark theme styling
 */
export function Card({
    children,
    variant = 'default',
    padded = true,
    hoverable = false,
    className,
    ...props
}: CardProps): React.JSX.Element {
    const baseStyles = 'rounded-xl border transition-all duration-200';

    const variantStyles = {
        default: cn(
            'bg-slate-800/50 border-slate-700/50',
            hoverable && 'hover:bg-slate-800/70 hover:border-slate-600/50'
        ),
        elevated: cn(
            'bg-slate-800/80 border-slate-700/50',
            'shadow-xl shadow-black/20',
            hoverable && 'hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-0.5'
        ),
        glass: cn(
            'bg-slate-800/30 backdrop-blur-xl border-slate-700/30',
            hoverable && 'hover:bg-slate-800/40 hover:border-slate-600/40'
        ),
        interactive: cn(
            'bg-slate-800/50 border-slate-700/50 cursor-pointer',
            'hover:bg-slate-800/70 hover:border-blue-500/50',
            'active:scale-[0.99]'
        ),
    };

    return (
        <div
            className={cn(
                baseStyles,
                variantStyles[variant],
                padded && 'p-6',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

/**
 * Card Header component
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Title text */
    title?: string;
    /** Subtitle text */
    subtitle?: string;
    /** Action element (button, icon, etc.) */
    action?: React.ReactNode;
}

export function CardHeader({
    title,
    subtitle,
    action,
    children,
    className,
    ...props
}: CardHeaderProps): React.JSX.Element {
    return (
        <div
            className={cn('flex items-start justify-between gap-4', className)}
            {...props}
        >
            <div className="flex-1 min-w-0">
                {title && (
                    <h3 className="text-lg font-semibold text-slate-100 truncate">
                        {title}
                    </h3>
                )}
                {subtitle && (
                    <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
                )}
                {children}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
        </div>
    );
}

/**
 * Card Content component
 */
export function CardContent({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
    return (
        <div className={cn('mt-4', className)} {...props}>
            {children}
        </div>
    );
}

/**
 * Card Footer component
 */
export function CardFooter({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
    return (
        <div
            className={cn(
                'mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-3',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export default Card;
