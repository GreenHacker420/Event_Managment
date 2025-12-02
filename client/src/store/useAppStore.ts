import { create } from 'zustand';
import { authClient } from '../lib/auth';
import { persist } from 'zustand/middleware';

export interface User {
    id?: string;
    name: string;
    email: string;
    image?: string;
}

interface AppState {
    inkLevel: number;
    cursorVariant: 'default' | 'hover' | 'text';
    isAuthenticated: boolean;
    user: User | null;
    activeEventId: string | null;
    isGuest: boolean;

    setInkLevel: (level: number) => void;
    setCursorVariant: (variant: 'default' | 'hover' | 'text') => void;
    setUser: (user: User) => void;
    loginAsGuest: (name: string) => void;
    logout: () => Promise<void>;
    setActiveEventId: (id: string | null) => void;
    checkSession: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            inkLevel: 0,
            cursorVariant: 'default',
            isAuthenticated: false,
            user: null,
            activeEventId: null,
            isGuest: false,

            setInkLevel: (level) => set({ inkLevel: level }),
            setCursorVariant: (variant) => set({ cursorVariant: variant }),

            setUser: (user) => set({
                isAuthenticated: true,
                user,
                isGuest: false
            }),

            loginAsGuest: (name) => set({
                isAuthenticated: true,
                user: { name, email: 'guest@local' },
                isGuest: true
            }),

            logout: async () => {
                try {
                    await authClient.signOut();
                    set({ user: null, isAuthenticated: false, isGuest: false, activeEventId: null });
                    localStorage.removeItem('activeEventId');
                } catch (error) {
                    console.error('Logout failed', error);
                }
            },

            setActiveEventId: (id) => set({ activeEventId: id }),

            checkSession: async () => {
                try {
                    const session = await authClient.getSession();

                    if (session?.data?.user) {
                        set({
                            isAuthenticated: true,
                            user: {
                                id: session.data.user.id,
                                name: session.data.user.name || session.data.user.email?.split('@')[0] || 'User',
                                email: session.data.user.email || '',
                                image: session.data.user.image || undefined,
                            },
                            isGuest: false
                        });
                    } else {
                        set({ user: null, isAuthenticated: false, isGuest: false });
                    }
                } catch (e) {
                    console.log('No active session');
                    set({ user: null, isAuthenticated: false, isGuest: false });
                }
            },
        }),
        {
            name: 'app-store',
            partialize: (state) => ({
                activeEventId: state.activeEventId,
                // Don't persist auth state - check session on load
            }),
        }
    )
);
