import { create } from 'zustand';
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType
} from '@xyflow/react';
import type {
    Node,
    Edge,
    Connection,
    NodeChange,
    EdgeChange
} from '@xyflow/react';
import { defaultNodeStyle, defaultEdgeStyle } from '../utils/graphUtils';

interface GraphState {
    nodes: Node[];
    edges: Edge[];
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Edge | Connection) => void;
    updateHighlights: (focusId: string | null, search: string) => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
    nodes: [],
    edges: [],
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
    onNodesChange: (changes: NodeChange[]) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        set({ edges: applyEdgeChanges(changes, get().edges) });
    },
    onConnect: (connection: Edge | Connection) => {
        set({ edges: addEdge(connection, get().edges) });
    },
    updateHighlights: (focusId, search) => {
        const normalize = (str: string) => str.toLowerCase().replace(/[_ -]/g, '');
        const searchNormalized = normalize(search);

        set((state) => {
            const connected = new Set<string>();
            if (focusId) {
                connected.add(focusId);
                state.edges.forEach(e => {
                    if (e.source === focusId) connected.add(e.target);
                    if (e.target === focusId) connected.add(e.source);
                });
            }

            const newNodes = state.nodes.map((n) => {
                const isFocused = n.id === focusId;
                const isConnected = connected.has(n.id);
                const nodeLabelNormalized = normalize(n.data.label as string);
                const matchesSearch = searchNormalized && nodeLabelNormalized.includes(searchNormalized);

                let opacity = 1;
                let border = 'none';
                let boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';

                if (focusId) {
                    if (!isConnected) opacity = 0.15;
                    if (isFocused) {
                        border = '2px solid #ffffff';
                        boxShadow = `0 0 0 4px ${n.data.baseColor}80`;
                    }
                } else if (searchNormalized) {
                    if (!matchesSearch) opacity = 0.15;
                    else {
                        border = '2px solid #ffffff';
                        boxShadow = `0 0 0 4px ${n.data.baseColor}80`;
                    }
                }

                return {
                    ...n,
                    style: {
                        ...defaultNodeStyle,
                        background: n.data.baseColor as string,
                        opacity,
                        border,
                        boxShadow,
                        zIndex: (isFocused || matchesSearch) ? 100 : (isConnected ? 10 : 1)
                    }
                };
            });

            const newEdges = state.edges.map((e) => {
                const isConnectedEdge = focusId ? (e.source === focusId || e.target === focusId) : false;
                const dims = focusId ? !isConnectedEdge : (searchNormalized ? true : false);

                return {
                    ...e,
                    animated: isConnectedEdge,
                    style: {
                        ...defaultEdgeStyle,
                        stroke: isConnectedEdge ? 'var(--color-edge-active)' : 'var(--color-edge-inactive)',
                        strokeWidth: isConnectedEdge ? 3 : 2,
                        opacity: dims ? 0.15 : 1
                    },
                    labelStyle: {
                        fill: '#64748b',
                        fontWeight: 500,
                        fontSize: 12,
                        opacity: dims ? 0.15 : 1
                    },
                    labelBgStyle: {
                        fill: '#f8fafc',
                        color: '#f8fafc',
                        fillOpacity: dims ? 0.1 : 0.8,
                        opacity: dims ? 0.15 : 1
                    },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: isConnectedEdge ? 'var(--color-edge-active)' : (dims ? 'var(--color-edge-inactive)' : 'var(--color-edge-active)'),
                    }
                };
            });

            return { nodes: newNodes, edges: newEdges };
        });
    }
}));
