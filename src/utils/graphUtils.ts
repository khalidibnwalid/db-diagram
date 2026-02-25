import dagre from 'dagre';

export const NODE_WIDTH = 300;
export const NODE_HEIGHT = 50;

export const applyDagreLayout = (nodes: any[], edges: any[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({
        rankdir: 'LR',
        nodesep: 60,
        ranksep: 200,
        edgesep: 20,
        marginx: 50,
        marginy: 50,
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id!, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    edges.forEach((edge) => {
        const sourceId = typeof edge.source === 'object' ? edge.source.cell : edge.source;
        const targetId = typeof edge.target === 'object' ? edge.target.cell : edge.target;
        dagreGraph.setEdge(sourceId, targetId);
    });

    dagre.layout(dagreGraph);

    const newNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id!);
        return {
            ...node,
            x: nodeWithPosition.x - NODE_WIDTH / 2,
            y: nodeWithPosition.y - NODE_HEIGHT / 2,
        };
    });

    return { nodes: newNodes, edges };
};

const GRAPH_COLORS = [
    'var(--graph-color-1)',
    'var(--graph-color-2)',
    'var(--graph-color-3)',
    'var(--graph-color-4)',
    'var(--graph-color-5)',
    'var(--graph-color-6)',
    'var(--graph-color-7)',
    'var(--graph-color-8)',
];

export const getGroupColor = (tableName: string) => {
    const prefix = tableName.split('_')[0];
    if (!prefix) return 'var(--graph-default)';
    let hash = 0;
    for (let i = 0; i < prefix.length; i++) {
        hash = prefix.charCodeAt(i) + ((hash << 5) - hash);
    }
    return GRAPH_COLORS[Math.abs(hash) % GRAPH_COLORS.length];
};

export const defaultEdgeStyle = {
    line: {
        stroke: 'var(--color-edge-inactive)',
        strokeWidth: 2,
        targetMarker: {
            name: 'block',
            width: 12,
            height: 8,
            fill: 'var(--color-edge-inactive)',
        },
    }
};

export const activeEdgeStyle = {
    line: {
        stroke: 'var(--color-edge-active)',
        strokeWidth: 3,
        targetMarker: {
            name: 'block',
            width: 12,
            height: 8,
            fill: 'var(--color-edge-active)',
        },
    }
};
