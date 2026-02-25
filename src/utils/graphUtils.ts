import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';

export const NODE_WIDTH = 300;
export const NODE_HEIGHT = 50;

export const applyDagreLayout = (nodes: Node[], edges: Edge[], direction = 'LR') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 60,
        ranksep: 200,
        edgesep: 20,
        marginx: 50,
        marginy: 50,
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const newNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            targetPosition: 'left' as any,
            sourcePosition: 'right' as any,
            position: {
                x: nodeWithPosition.x - NODE_WIDTH / 2,
                y: nodeWithPosition.y - NODE_HEIGHT / 2,
            },
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

export const defaultNodeStyle: React.CSSProperties = {
    border: 'none',
    borderRadius: '16px',
    padding: '20px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    minWidth: NODE_WIDTH,
    textAlign: 'center' as const,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    opacity: 1,
    transition: 'all 0.3s ease',
};

export const defaultEdgeStyle = {
    stroke: 'var(--graph-default)',
    strokeWidth: 2,
    transition: 'all 0.3s ease',
};
