/**
 * Sidebar Component
 * @description Navigation sidebar with module links and user profile
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    PackageOpen,
    Truck,
    Box,
    AlertTriangle,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
    Warehouse,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES, APP_NAME } from '@/lib/constants';
import { useUserStore } from '@/store/userStore';

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
    },
    {
        label: 'Inbound',
        href: ROUTES.INBOUND,
        icon: PackageOpen,
        children: [
            { label: 'Receive', href: ROUTES.RECEIVE },
            { label: 'Dock', href: ROUTES.DOCK },
            { label: 'Putaway', href: ROUTES.PUTAWAY },
            { label: 'Replenishment', href: '/inbound/replenishment' },
        ],
    },
    {
        label: 'Outbound',
        href: ROUTES.OUTBOUND,
        icon: Truck,
        children: [
            { label: 'Waves', href: ROUTES.WAVES },
            { label: 'Picking', href: ROUTES.PICKING },
            { label: 'Packing', href: ROUTES.PACKING },
            { label: 'Shipping', href: ROUTES.SHIPPING },
        ],
    },
    {
        label: 'Inventory',
        href: ROUTES.INVENTORY,
        icon: Box,
        children: [
            { label: 'ICQA', href: ROUTES.ICQA },
            { label: 'Counts', href: ROUTES.COUNTS },
        ],
    },
    {
        label: 'Problem Solve',
        href: ROUTES.PROBLEM_SOLVE,
        icon: AlertTriangle,
    },
];

export function Sidebar(): React.JSX.Element {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const pathname = usePathname();
    const { user, logout } = useUserStore();

    const toggleExpanded = (label: string) => {
        setExpandedItems((prev) =>
            prev.includes(label)
                ? prev.filter((item) => item !== label)
                : [...prev, label]
        );
    };

    const isActive = (href: string) => pathname === href;
    const isParentActive = (item: NavItem) =>
        item.children?.some((child) => pathname.startsWith(child.href)) ||
        pathname === item.href;

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 h-full bg-white border-r border-slate-200 transition-all flex flex-col shadow-sm z-50',
                isCollapsed ? 'w-16' : 'w-72'
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <Warehouse className="w-6 h-6 text-blue-600" />
                        <h1 className="font-bold text-lg text-slate-800">{APP_NAME}</h1>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isExpanded = expandedItems.includes(item.label);
                        const active = isParentActive(item);

                        return (
                            <li key={item.label}>
                                {/* Parent Item */}
                                <Link
                                    href={item.href}
                                    onClick={(e) => {
                                        if (item.children) {
                                            e.preventDefault();
                                            toggleExpanded(item.label);
                                        }
                                    }}
                                    className={cn(
                                        'flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all group',
                                        active
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                                    )}
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <Icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-blue-600')} />
                                        {!isCollapsed && (
                                            <span className="text-sm truncate">{item.label}</span>
                                        )}
                                    </div>
                                    {!isCollapsed && item.children && (
                                        <ChevronRight
                                            className={cn(
                                                'w-4 h-4 transition-transform flex-shrink-0',
                                                isExpanded && 'rotate-90'
                                            )}
                                        />
                                    )}
                                </Link>

                                {/* Children Items */}
                                {item.children && isExpanded && !isCollapsed && (
                                    <ul className="mt-1 ml-3 space-y-1 border-l-2 border-slate-200 pl-3">
                                        {item.children.map((child) => (
                                            <li key={child.href}>
                                                <Link
                                                    href={child.href}
                                                    className={cn(
                                                        'block px-3 py-2 rounded-lg text-sm transition-colors',
                                                        isActive(child.href)
                                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                                                    )}
                                                >
                                                    {child.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="border-t border-slate-200 p-3">
                {/* User Profile */}
                {user && (
                    <div className={cn(
                        'mb-3 p-3 rounded-lg bg-slate-50',
                        isCollapsed && 'px-2'
                    )}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-blue-600" />
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">
                                        {user.email}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                        {user.role}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Settings & Logout */}
                <div className="space-y-1">
                    <Link
                        href={ROUTES.SETTINGS}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    >
                        <Settings className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && (
                            <span className="text-sm">Settings</span>
                        )}
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && (
                            <span className="text-sm font-medium">Logout</span>
                        )}
                    </button>
                </div>
            </div>
        </aside>
    );
}
