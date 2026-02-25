import { create } from 'zustand';


interface GraphState {
    nodesData: any[];
    edgesData: any[];
    connectedNodes: Set<string>;
    setGraphData: (nodes: any[], edges: any[]) => void;
    updateHighlights: (focusId: string | null) => void;
}

export const useGraphStore = create<GraphState>((set) => ({
    nodesData: [],
    edgesData: [],
    connectedNodes: new Set(),
    setGraphData: (nodesData, edgesData) => set({ nodesData, edgesData }),
    updateHighlights: (focusId) => {
        set((state) => {
            const connected = new Set<string>();
            if (focusId) {
                connected.add(focusId);
                state.edgesData.forEach(e => {
                    const sourceId = typeof e.source === 'object' ? e.source.cell : e.source;
                    const targetId = typeof e.target === 'object' ? e.target.cell : e.target;
                    if (sourceId === focusId) connected.add(targetId as string);
                    if (targetId === focusId) connected.add(sourceId as string);
                });
            }
            return { connectedNodes: connected };
        });
    }
}));
