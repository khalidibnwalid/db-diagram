import { create } from 'zustand';


interface GraphNode {
    id: string;
    label: string;
    baseColor: string;
    [key: string]: unknown;
}

interface GraphEdge {
    id: string;
    source: string | { cell: string };
    target: string | { cell: string };
    [key: string]: unknown;
}


interface GraphPath {
    nodes: Set<string>;
    edges: Set<string>;
}

interface GraphState {
    nodesData: GraphNode[];
    edgesData: GraphEdge[];
    connectedNodes: Set<string>;
    paths: GraphPath[];
    setGraphData: (nodes: GraphNode[], edges: GraphEdge[]) => void;
    updateHighlights: (focusId: string | null) => void;
    findShortestPath: (startId: string, endId: string) => void;
}


export const useGraphStore = create<GraphState>((set) => ({
    nodesData: [],
    edgesData: [],
    connectedNodes: new Set(),
    paths: [],
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
            // Clear path when resetting highlights or focusing a single node
            return {
                connectedNodes: connected,
                paths: []
            };
        });
    },
    findShortestPath: (startId, endId) => {
        set((state) => {
            if (startId === endId) return state;

            const allPaths: GraphPath[] = [];
            const currentExclusions = new Set<string>();

            const findOnePath = (excluded: Set<string>): GraphPath | null => {
                // Build adjacency list
                const adj: Record<string, { node: string, edge: string }[]> = {};
                state.edgesData.forEach(e => {
                    if (excluded.has(e.id)) return;
                    const source = typeof e.source === 'object' ? e.source.cell : e.source;
                    const target = typeof e.target === 'object' ? e.target.cell : e.target;
                    const edgeId = e.id;

                    if (!adj[source]) adj[source] = [];
                    if (!adj[target]) adj[target] = [];
                    adj[source].push({ node: target, edge: edgeId });
                    adj[target].push({ node: source, edge: edgeId });
                });

                // BFS
                const queue: string[] = [startId];
                const visited: Record<string, { parentNode: string | null, edgeId: string | null }> = {
                    [startId]: { parentNode: null, edgeId: null }
                };

                let found = false;
                while (queue.length > 0) {
                    const current = queue.shift();
                    if (!current) break;
                    if (current === endId) {
                        found = true;
                        break;
                    }

                    (adj[current] || []).forEach(({ node: neighbor, edge: edgeId }) => {
                        if (!(neighbor in visited)) {
                            visited[neighbor] = { parentNode: current, edgeId };
                            queue.push(neighbor);
                        }
                    });
                }

                if (!found) return null;

                // Reconstruct path
                const pathNodes = new Set<string>();
                const pathEdges = new Set<string>();
                let curr: string | null = endId;
                while (curr !== null) {
                    pathNodes.add(curr);
                    const info: { parentNode: string | null, edgeId: string | null } = visited[curr];
                    if (info.edgeId) pathEdges.add(info.edgeId);
                    curr = info.parentNode;
                }
                return { nodes: pathNodes, edges: pathEdges };
            };

            // Find up to 3 paths
            const firstPath = findOnePath(currentExclusions);
            if (firstPath) {
                allPaths.push(firstPath);

                // Try to find a 2nd path by excluding an edge from the 1st
                const p1Edges = Array.from(firstPath.edges);
                if (p1Edges.length > 1) {
                    currentExclusions.add(p1Edges[Math.floor(p1Edges.length / 2)]);
                    const secondPath = findOnePath(currentExclusions);
                    if (secondPath) {
                        allPaths.push(secondPath);

                        // Try to find a 3rd path by excluding another edge
                        const p2Edges = Array.from(secondPath.edges);
                        if (p2Edges.length > 1) {
                            currentExclusions.add(p2Edges[Math.floor(p2Edges.length / 2)]);
                            const thirdPath = findOnePath(currentExclusions);
                            if (thirdPath) allPaths.push(thirdPath);
                        }
                    }
                }
            }

            if (allPaths.length === 0) return state;

            const allPathNodeIds = new Set<string>();
            allPaths.forEach(p => p.nodes.forEach(id => allPathNodeIds.add(id)));

            return {
                paths: allPaths,
                connectedNodes: allPathNodeIds
            };
        });
    }
}));
