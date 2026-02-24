import React from 'react';
import { useUIStore } from '../stores/useUIStore';
import { useGraphStore } from '../stores/useGraphStore';

export function SearchBar() {
    const searchQuery = useUIStore((state) => state.searchQuery);
    const setSearchQuery = useUIStore((state) => state.setSearchQuery);
    const focusedNodeId = useUIStore((state) => state.focusedNodeId);
    const updateHighlights = useGraphStore((state) => state.updateHighlights);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        updateHighlights(focusedNodeId, e.target.value);
    };

    return (
        <div className="absolute top-6 right-6 z-20 rounded-xl border border-border shadow-lg p-1 bg-panel">
            <input
                type="text"
                placeholder="Search tables..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="px-4 py-2.5 rounded-lg border-none w-[260px] text-sm outline-none bg-background text-foreground"
            />
        </div>
    );
}
