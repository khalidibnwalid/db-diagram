import React, { useRef, useEffect } from 'react';
import { useUIStore } from '../stores/useUIStore';
import { useGraphStore } from '../stores/useGraphStore';

export function SearchBar() {
    const searchQuery = useUIStore((state) => state.searchQuery);
    const setSearchQuery = useUIStore((state) => state.setSearchQuery);
    const focusedNodeId = useUIStore((state) => state.focusedNodeId);
    const updateHighlights = useGraphStore((state) => state.updateHighlights);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                document.activeElement?.tagName === 'INPUT' ||
                document.activeElement?.tagName === 'TEXTAREA'
            ) return;

            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey)
                inputRef.current?.focus();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        updateHighlights(focusedNodeId, e.target.value);
    };

    return (
        <div className="absolute top-6 right-6 z-20 rounded-xl border border-border shadow-lg p-1 bg-panel">
            <input
                ref={inputRef}
                type="text"
                placeholder="Search tables..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="px-4 py-2.5 rounded-lg border-none w-[260px] text-sm outline-none bg-background text-foreground"
            />
        </div>
    );
}
