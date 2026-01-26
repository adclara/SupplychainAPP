/**
 * Supabase Client Configuration
 * @description Creates and exports Supabase client instances for browser and server usage
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        'Supabase environment variables are not set. Using placeholder values for development.'
    );
}

/**
 * Browser Supabase client for client-side operations
 * Uses the anonymous key with RLS policies
 */
export const supabase: SupabaseClient = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    }
);

/**
 * Creates a Supabase client for server-side operations
 * @param serviceRoleKey - Optional service role key for admin operations
 * @returns Supabase client instance
 */
export function createServerClient(serviceRoleKey?: string): SupabaseClient {
    const key = serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

    return createClient(
        supabaseUrl || 'https://placeholder.supabase.co',
        key || supabaseAnonKey || 'placeholder-key',
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        }
    );
}

/**
 * Get the current user session
 * @returns User session or null
 */
export async function getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error('Error getting session:', error.message);
        return null;
    }

    return session;
}

/**
 * Get the current authenticated user
 * @returns User data or null
 */
export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
        console.error('Error getting user:', error.message);
        return null;
    }

    return user;
}

export default supabase;
