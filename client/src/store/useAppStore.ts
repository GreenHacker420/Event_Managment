import { create } from 'zustand';

interface AppState {
    inkLevel: number;
    cursorVariant: 'default' | 'hover' | 'text';
    isAuthenticated: boolean;
    user: { name: string; email: string } | null;
    activeEventId: string | null;

    setInkLevel: (level: number) => void;
    setCursorVariant: (variant: 'default' | 'hover' | 'text') => void;
    login: (username: string) => void;
    logout: () => void;
    setActiveEventId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
    inkLevel: 0,
    cursorVariant: 'default',
    isAuthenticated: false,
    user: null,
    activeEventId: null,

    setInkLevel: (level) => set({ inkLevel: level }),
    setCursorVariant: (variant) => set({ cursorVariant: variant }),
    login: (username) => set({ isAuthenticated: true, user: { name: username, email: '' } }),
    logout: () => set({ isAuthenticated: false, user: null, activeEventId: null }),
    setActiveEventId: (id) => set({ activeEventId: id }),
}));
