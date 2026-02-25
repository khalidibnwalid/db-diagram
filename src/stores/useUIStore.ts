import { create } from 'zustand';

interface UIState {
    error: string | null;
    hasImported: boolean;
    focusedNodeId: string | null;
    searchQuery: string;
    isDarkMode: boolean;

    setError: (error: string | null) => void;
    setHasImported: (hasImported: boolean) => void;
    setSearchQuery: (query: string) => void;
    setFocusedNodeId: (id: string | null) => void;
    toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    error: null,
    hasImported: false,
    focusedNodeId: null,
    searchQuery: '',
    isDarkMode: (() => {
        const savedTheme = localStorage.getItem('db-graph-theme');
        return savedTheme ? savedTheme === 'dark' : false;
    })(),

    setError: (error) => set({ error }),
    setHasImported: (hasImported) => set({ hasImported }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setFocusedNodeId: (focusedNodeId) => set({ focusedNodeId }),
    toggleDarkMode: () => {
        set((state) => {
            const newMode = !state.isDarkMode;
            localStorage.setItem('db-graph-theme', newMode ? 'dark' : 'light');
            return { isDarkMode: newMode };
        });
    },
}));
