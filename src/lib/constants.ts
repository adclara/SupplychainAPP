/**
 * Application Constants
 * @description Configuration constants for the Nexus Chain WMS application
 */

// =============================================================================
// APPLICATION METADATA
// =============================================================================

export const APP_NAME = 'Nexus Chain WMS';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Enterprise Warehouse Management System';

// =============================================================================
// API CONFIGURATION
// =============================================================================

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
export const API_TIMEOUT = 10000; // 10 seconds

// =============================================================================
// WAVE CONFIGURATION
// =============================================================================

export const WAVE_CONFIG = {
    MAX_SHIPMENTS_PER_WAVE: 50,
    AUTO_RELEASE_HOURS: 5,
    WAVE_NUMBER_PREFIX: 'WAVE',
} as const;

// =============================================================================
// INVENTORY CONFIGURATION
// =============================================================================

export const INVENTORY_CONFIG = {
    REPLENISHMENT_THRESHOLD: 0.3, // 30% capacity
    HIGH_VARIANCE_THRESHOLD: 0.1, // 10% variance triggers review
    MAX_PRIME_CAPACITY: 100,
    MAX_RESERVE_CAPACITY: 500,
} as const;

// =============================================================================
// PAGINATION
// =============================================================================

export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 25,
    MAX_PAGE_SIZE: 100,
} as const;

// =============================================================================
// UI CONFIGURATION
// =============================================================================

export const UI_CONFIG = {
    TOAST_DURATION: 5000, // 5 seconds
    DEBOUNCE_DELAY: 300, // 300ms
    MIN_TOUCH_TARGET: 44, // 44px
    SIDEBAR_WIDTH: 280,
    SIDEBAR_COLLAPSED_WIDTH: 64,
} as const;

// =============================================================================
// DESIGN SYSTEM COLORS - Modern Light Theme
// =============================================================================

export const COLORS = {
    background: {
        primary: '#F8FAFC',      // Slate 50 - Main background
        secondary: '#FFFFFF',     // White - Card backgrounds
        tertiary: '#F1F5F9',      // Slate 100 - Subtle backgrounds
    },
    primary: {
        default: '#3B82F6',       // Blue 500 - Primary actions
        hover: '#2563EB',         // Blue 600 - Hover state
        light: '#DBEAFE',         // Blue 100 - Light backgrounds
        dark: '#1E40AF',          // Blue 700 - Dark accents
    },
    accent: {
        primary: '#0EA5E9',       // Sky 500 - Accent elements
        secondary: '#38BDF8',     // Sky 400 - Secondary accents
        tertiary: '#7DD3FC',      // Sky 300 - Tertiary accents
    },
    success: {
        primary: '#10B981',       // Emerald 500
        secondary: '#34D399',     // Emerald 400
        light: '#D1FAE5',         // Emerald 100
    },
    error: {
        primary: '#EF4444',       // Red 500
        secondary: '#F87171',     // Red 400
        light: '#FEE2E2',         // Red 100
    },
    warning: {
        primary: '#F59E0B',       // Amber 500
        secondary: '#FBBF24',     // Amber 400
        light: '#FEF3C7',         // Amber 100
    },
    text: {
        primary: '#1E293B',       // Slate 800 - Main text
        secondary: '#64748B',     // Slate 500 - Secondary text
        muted: '#94A3B8',         // Slate 400 - Muted text
        inverse: '#FFFFFF',       // White - Text on dark backgrounds
    },
    border: {
        default: '#E2E8F0',       // Slate 200 - Default borders
        light: '#F1F5F9',         // Slate 100 - Light borders
        dark: '#CBD5E1',          // Slate 300 - Dark borders
    },
} as const;

// =============================================================================
// NAVIGATION ROUTES
// =============================================================================

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',

    // Inbound
    INBOUND: '/inbound',
    RECEIVE: '/inbound/receive',
    DOCK: '/inbound/dock',
    PUTAWAY: '/inbound/putaway',

    // Outbound
    OUTBOUND: '/outbound',
    WAVES: '/outbound/waves',
    PICKING: '/outbound/picking',
    PACKING: '/outbound/packing',
    SHIPPING: '/outbound/shipping',

    // Inventory
    INVENTORY: '/inventory',
    ICQA: '/inventory/icqa',
    COUNTS: '/inventory/counts',

    // Problem Solve
    PROBLEM_SOLVE: '/problem-solve',

    // Admin
    ADMIN: '/admin',
    USERS: '/admin/users',
    SETTINGS: '/admin/settings',
} as const;

// =============================================================================
// USER ROLES
// =============================================================================

export const USER_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    ASSOCIATE: 'associate',
    QA: 'qa',
    PROBLEM_SOLVER: 'problem_solver',
} as const;

export const ROLE_LABELS: Record<string, string> = {
    admin: 'Administrator',
    manager: 'Manager',
    associate: 'Associate',
    qa: 'Quality Assurance',
    problem_solver: 'Problem Solver',
};

// =============================================================================
// LOCATION TYPES
// =============================================================================

export const LOCATION_TYPES = {
    PRIME: 'prime',
    RESERVE: 'reserve',
    DOCK: 'dock',
    PROBLEM: 'problem',
} as const;

export const LOCATION_TYPE_LABELS: Record<string, string> = {
    prime: 'Prime (Level 1)',
    reserve: 'Reserve (Levels 2-4)',
    dock: 'Dock',
    problem: 'Problem Zone',
};

// =============================================================================
// TICKET TYPES
// =============================================================================

export const TICKET_TYPES = {
    SHORTAGE: 'shortage',
    DAMAGE: 'damage',
    MISLABEL: 'mislabel',
    WRONG_LOCATION: 'wrong_location',
    OTHER: 'other',
} as const;

export const TICKET_TYPE_LABELS: Record<string, string> = {
    shortage: 'Shortage',
    damage: 'Damaged Item',
    mislabel: 'Mislabeled Product',
    wrong_location: 'Wrong Location',
    other: 'Other Issue',
};

// =============================================================================
// STATUS LABELS
// =============================================================================

export const WAVE_STATUS_LABELS: Record<string, string> = {
    pending: 'Pending',
    picking: 'Picking',
    packing: 'Packing',
    shipped: 'Shipped',
};

export const SHIPMENT_STATUS_LABELS: Record<string, string> = {
    pending: 'Pending',
    picking: 'Picking',
    packed: 'Packed',
    shipped: 'Shipped',
};

export const TICKET_STATUS_LABELS: Record<string, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
};

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

export const SHORTCUTS = {
    SEARCH: 'ctrl+k',
    NEW_WAVE: 'ctrl+shift+w',
    PROBLEM_TICKET: 'ctrl+shift+p',
    SCAN_MODE: 'ctrl+s',
} as const;
