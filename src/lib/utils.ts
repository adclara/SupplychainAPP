/**
 * Utility Functions
 * @description Common utility functions used throughout the application
 */

import { type ClassValue, clsx } from 'clsx';

/**
 * Combines class names intelligently using clsx
 * @param inputs - Class name values to combine
 * @returns Combined class name string
 */
export function cn(...inputs: ClassValue[]): string {
    return clsx(inputs);
}

/**
 * Formats a date string to a human-readable format
 * @param dateString - ISO date string
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
    dateString: string | null | undefined,
    options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }
): string {
    if (!dateString) return '-';

    try {
        return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
    } catch {
        return '-';
    }
}

/**
 * Formats a date string to relative time (e.g., "2 hours ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
    if (!dateString) return '-';

    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return formatDate(dateString);
    } catch {
        return '-';
    }
}

/**
 * Formats a number with thousand separators
 * @param value - Number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Formats a percentage value
 * @param value - Number between 0 and 100
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number | null | undefined, decimals = 1): string {
    if (value === null || value === undefined) return '-';
    return `${value.toFixed(decimals)}%`;
}

/**
 * Generates a wave number in the format WAVE-YYYY-MM-DD-XXX
 * @param sequence - Sequence number for the day
 * @returns Wave number string
 */
export function generateWaveNumber(sequence: number): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const seq = String(sequence).padStart(3, '0');

    return `WAVE-${year}-${month}-${day}-${seq}`;
}

/**
 * Generates a location barcode from components
 * @param aisle - Aisle letter (A-F)
 * @param level - Level number (1-4)
 * @param section - Section number
 * @param position - Position number
 * @returns Location barcode string
 */
export function generateLocationBarcode(
    aisle: string,
    level: number,
    section: number,
    position: number
): string {
    return `${aisle}${level}${String(section).padStart(2, '0')}${String(position).padStart(2, '0')}`;
}

/**
 * Parses a location barcode into components
 * @param barcode - Location barcode (e.g., "A1101")
 * @returns Location components or null if invalid
 */
export function parseLocationBarcode(barcode: string): {
    aisle: string;
    level: number;
    section: number;
    position: number;
} | null {
    const match = barcode.match(/^([A-F])(\d)(\d{2})(\d{2})$/);

    if (!match) return null;

    return {
        aisle: match[1],
        level: parseInt(match[2], 10),
        section: parseInt(match[3], 10),
        position: parseInt(match[4], 10),
    };
}

/**
 * Validates a UPC barcode format
 * @param upc - UPC string to validate
 * @returns Whether the UPC is valid
 */
export function isValidUPC(upc: string): boolean {
    // UPC-A is 12 digits, EAN-13 is 13 digits
    return /^\d{12,13}$/.test(upc);
}

/**
 * Truncates text to a maximum length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncate(text: string | null | undefined, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Delays execution for a specified duration
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after delay
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generates a random UUID v4
 * @returns UUID string
 */
export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Gets status color class based on status value
 * @param status - Status string
 * @returns Tailwind color class
 */
export function getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
        // Wave/Shipment statuses
        pending: 'text-amber-400 bg-amber-400/10',
        picking: 'text-blue-400 bg-blue-400/10',
        packing: 'text-purple-400 bg-purple-400/10',
        packed: 'text-purple-400 bg-purple-400/10',
        shipped: 'text-emerald-400 bg-emerald-400/10',
        completed: 'text-emerald-400 bg-emerald-400/10',

        // Problem ticket statuses
        open: 'text-red-400 bg-red-400/10',
        in_progress: 'text-blue-400 bg-blue-400/10',
        resolved: 'text-emerald-400 bg-emerald-400/10',
        closed: 'text-slate-400 bg-slate-400/10',

        // Location statuses
        empty: 'text-slate-400 bg-slate-400/10',
        occupied: 'text-emerald-400 bg-emerald-400/10',
        blocked: 'text-red-400 bg-red-400/10',

        // PO statuses
        received: 'text-blue-400 bg-blue-400/10',
    };

    return statusColors[status] || 'text-slate-400 bg-slate-400/10';
}

/**
 * Capitalizes the first letter of each word
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalizeWords(text: string): string {
    return text
        .split(/[_\s]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}
