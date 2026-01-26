/**
 * Login Page
 * @description Authentication page with email/password form and dark theme styling
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Warehouse, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUserStore } from '@/store/userStore';
import { APP_NAME, ROUTES } from '@/lib/constants';

export default function LoginPage(): React.JSX.Element {
    const router = useRouter();
    const { setUser, setLoading, setError, isLoading, error } = useUserStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});

    const validateForm = (): boolean => {
        const errors: { email?: string; password?: string } = {};

        if (!email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Please enter a valid email';
        }

        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            // Demo login - In production, this would use Supabase Auth
            // For now, we simulate a successful login with demo user
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Set demo user
            setUser({
                id: 'demo-user-id',
                email: email,
                full_name: 'Demo User',
                role: 'associate',
                warehouse_id: 'demo-warehouse-id',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

            router.push(ROUTES.DASHBOARD);
        } catch {
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900" />

                {/* Animated Gradient Overlay */}
                <div
                    className="absolute inset-0 opacity-50"
                    style={{
                        background: 'radial-gradient(ellipse at 30% 20%, rgba(99, 102, 241, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
                    }}
                />

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                    }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center">
                            <Warehouse className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">{APP_NAME}</span>
                    </div>

                    <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
                        Revolutionizing<br />
                        Warehouse<br />
                        Operations
                    </h1>

                    <p className="text-lg text-blue-100/80 max-w-md mb-8">
                        Enterprise-grade warehouse management with AI-driven exception handling
                        and real-time transaction tracking.
                    </p>

                    <div className="grid grid-cols-2 gap-4 max-w-md">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <div className="text-3xl font-bold text-white mb-1">30%</div>
                            <div className="text-sm text-blue-100/70">Faster Putaway</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <div className="text-3xl font-bold text-white mb-1">&lt;200ms</div>
                            <div className="text-sm text-blue-100/70">Response Time</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <div className="text-3xl font-bold text-white mb-1">99.5%</div>
                            <div className="text-sm text-blue-100/70">Inventory Accuracy</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <div className="text-3xl font-bold text-white mb-1">1000+</div>
                            <div className="text-sm text-blue-100/70">Concurrent Users</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-slate-900">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="flex items-center gap-3 mb-8 lg:hidden">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                            <Warehouse className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-100">{APP_NAME}</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-100 mb-2">
                            Welcome back
                        </h2>
                        <p className="text-slate-400">
                            Sign in to your account to continue
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={formErrors.email}
                            leftIcon={<Mail className="w-5 h-5" />}
                            autoComplete="email"
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={formErrors.password}
                            leftIcon={<Lock className="w-5 h-5" />}
                            autoComplete="current-password"
                        />

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                                />
                                Remember me
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            isLoading={isLoading}
                            rightIcon={<ArrowRight className="w-5 h-5" />}
                        >
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-400">
                        Don&apos;t have an account?{' '}
                        <Link
                            href={ROUTES.REGISTER}
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                            Create account
                        </Link>
                    </div>

                    {/* Demo Credentials Hint */}
                    <div className="mt-8 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-slate-500 text-center">
                            <strong className="text-slate-400">Demo Mode:</strong> Enter any email and password (min 6 chars) to explore the dashboard.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
