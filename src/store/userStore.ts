/**
 * User Store
 * @description Zustand store for user session and authentication state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';

interface UserState {
    /** Current authenticated user */
    user: User | null;
    /** Authentication loading state */
    isLoading: boolean;
    /** Authentication error */
    error: string | null;
    /** Whether user is authenticated */
    isAuthenticated: boolean;
}

interface UserActions {
    /** Set the current user */
    setUser: (user: User | null) => void;
    /** Set loading state */
    setLoading: (loading: boolean) => void;
    /** Set error message */
    setError: (error: string | null) => void;
    /** Clear user session */
    logout: () => void;
    /** Check if user has a specific role */
    hasRole: (role: UserRole | UserRole[]) => boolean;
}

type UserStore = UserState & UserActions;

/**
 * User store for managing authentication state
 */
export const useUserStore = create<UserStore>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            isLoading: false,
            error: null,
            isAuthenticated: false,

            // Actions
            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: !!user,
                    error: null,
                }),

            setLoading: (isLoading) => set({ isLoading }),

            setError: (error) => set({ error }),

            logout: () =>
                set({
                    user: null,
                    isAuthenticated: false,
                    error: null,
                }),

            hasRole: (role) => {
                const { user } = get();
                if (!user) return false;

                if (Array.isArray(role)) {
                    return role.includes(user.role);
                }

                return user.role === role;
            },
        }),
        {
            name: 'nexus-user-store',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useUserStore;
