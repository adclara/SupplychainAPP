/**
 * Login Page
 * @description User authentication login page
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Mail, Lock, Warehouse, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/store/userStore';
import { login } from '@/services/authService';
import { toast } from 'react-hot-toast';
import { APP_NAME } from '@/lib/constants';

export default function LoginPage(): React.JSX.Element {
    const router = useRouter();
    const { setUser } = useUserStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        try {
            setLoading(true);
            const user = await login({ email, password });
            setUser(user);
            toast.success(`Welcome back, ${user.full_name || user.email}!`);
            router.push('/dashboard');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4 shadow-lg">
                        <Warehouse className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800">{APP_NAME}</h1>
                    <p className="text-slate-600 mt-2">Warehouse Management System</p>
                </div>

                {/* Login Card */}
                <Card variant="elevated" className="bg-white border border-slate-200">
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Sign In</h2>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email Address
                                </label>
                                <Input
                                    type="email"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    leftIcon={<Mail className="w-5 h-5" />}
                                    disabled={loading}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Password
                                </label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    leftIcon={<Lock className="w-5 h-5" />}
                                    disabled={loading}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-600">Remember me</span>
                                </label>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                leftIcon={<LogIn className="w-5 h-5" />}
                                disabled={loading}
                                isLoading={loading}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-600">
                                Don't have an account?{' '}
                                <Link
                                    href="/auth/signup"
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Demo Credentials */}
                <Card variant="elevated" className="mt-6 bg-blue-50 border border-blue-200">
                    <div className="p-4">
                        <p className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials:</p>
                        <p className="text-sm text-blue-800">
                            <strong>Email:</strong> demo@nexuswms.com<br />
                            <strong>Password:</strong> demo123
                        </p>
                    </div>
                </Card>

                {/* Footer */}
                <p className="text-center text-sm text-slate-500 mt-8">
                    © 2026 {APP_NAME}. All rights reserved.
                </p>
            </div>
        </div>
    );
}
