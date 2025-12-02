import { create } from 'zustand';
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
                const { isGuest } = get();
                set({ isAuthenticated: false, user: null, activeEventId: null, isGuest: false });
                
                if (!isGuest) {
                    try {
                        const res = await fetch('/api/auth/csrf', { credentials: 'include' });
                        const data = await res.json();
                        
                        const form = document.createElement('form');
                        form.method = 'POST';
                        form.action = '/api/auth/signout';
                        
                        const csrfInput = document.createElement('input');
                        csrfInput.type = 'hidden';
                        csrfInput.name = 'csrfToken';
                        csrfInput.value = data.csrfToken;
                        form.appendChild(csrfInput);
                        
                        const callbackInput = document.createElement('input');
                        callbackInput.type = 'hidden';
                        callbackInput.name = 'callbackUrl';
                        callbackInput.value = window.location.origin;
                        form.appendChild(callbackInput);
                        
                        document.body.appendChild(form);
                        form.submit();
                    } catch (e) {
                        console.error('Logout error:', e);
                        window.location.href = '/';
                    }
                }
            },
            
            setActiveEventId: (id) => set({ activeEventId: id }),
            
            checkSession: async () => {
                try {
                    const res = await fetch('/api/auth/session', { credentials: 'include' });
                    const session = await res.json();
                    if (session?.user) {
                        set({ 
                            isAuthenticated: true, 
                            user: {
                                id: session.user.id,
                                name: session.user.name || session.user.email?.split('@')[0] || 'User',
                                email: session.user.email || '',
                                image: session.user.image,
                            },
                            isGuest: false 
                        });
                    }
                } catch (e) {
                    console.log('No active session');
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
