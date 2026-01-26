/**
 * Authentication Service
 * @description Handles user authentication with Supabase
 */

import { supabase } from '@/lib/supabase';
import type { User } from '@/types';


export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupCredentials extends LoginCredentials {
    full_name: string;
    warehouse_id: string;
    role?: string;
}

/**
 * Login user with email and password
 * @param credentials - User credentials
 * @returns User object if successful
 */
export async function login(credentials: LoginCredentials): Promise<User> {
    try {
        // Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('No user returned from authentication');

        // Get user details from users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single();

        if (userError) throw userError;
        if (!userData) throw new Error('User not found in database');

        return {
            id: userData.id,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role,
            warehouse_id: userData.warehouse_id,
            is_active: userData.is_active,
            created_at: userData.created_at,
            updated_at: userData.updated_at,
        };
    } catch (error) {
        console.error('Login error:', error);
        throw new Error('Invalid email or password');
    }
}

/**
 * Signup new user
 * @param credentials - Signup credentials
 * @returns User object if successful
 */
export async function signup(credentials: SignupCredentials): Promise<User> {
    try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Failed to create user');

        // Create user in users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email: credentials.email,
                full_name: credentials.full_name,
                role: credentials.role || 'associate',
                warehouse_id: credentials.warehouse_id,
            })
            .select()
            .single();

        if (userError) {
            // Rollback auth user if database insert fails
            await supabase.auth.admin.deleteUser(authData.user.id);
            throw userError;
        }

        return {
            id: userData.id,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role,
            warehouse_id: userData.warehouse_id,
            is_active: userData.is_active,
            created_at: userData.created_at,
            updated_at: userData.updated_at,
        };
    } catch (error) {
        console.error('Signup error:', error);
        throw new Error('Failed to create account. Please try again.');
    }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    } catch (error) {
        console.error('Logout error:', error);
        throw new Error('Failed to logout');
    }
}

/**
 * Get current authenticated user
 * @returns User object if authenticated, null otherwise
 */
export async function getCurrentUser(): Promise<User | null> {
    try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!session) return null;

        // Get user details from database
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (userError) throw userError;
        if (!userData) return null;

        return {
            id: userData.id,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role,
            warehouse_id: userData.warehouse_id,
            is_active: userData.is_active,
            created_at: userData.created_at,
            updated_at: userData.updated_at,
        };
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
}

/**
 * Check if user is authenticated
 * @returns True if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return !!session;
    } catch (error) {
        console.error('Check authentication error:', error);
        return false;
    }
}

/**
 * Reset password
 * @param email - User email
 */
export async function resetPassword(email: string): Promise<void> {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) throw error;
    } catch (error) {
        console.error('Reset password error:', error);
        throw new Error('Failed to send reset password email');
    }
}

/**
 * Update password
 * @param newPassword - New password
 */
export async function updatePassword(newPassword: string): Promise<void> {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) throw error;
    } catch (error) {
        console.error('Update password error:', error);
        throw new Error('Failed to update password');
    }
}

/**
 * Listen to auth state changes
 * @param callback - Callback function to execute on auth change
 * @returns Unsubscribe function
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            const user = await getCurrentUser();
            callback(user);
        } else {
            callback(null);
        }
    });

    return () => subscription.unsubscribe();
}
