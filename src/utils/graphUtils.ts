import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';

export const nodeWidth = 200;
export const nodeHeight = 50;

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
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
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
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: newNodes, edges };
};

const GRAPH_COLORS = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#f43f5e',
    '#84cc16',
];

export const getGroupColor = (tableName: string) => {
    const prefix = tableName.split('_')[0];
    if (!prefix) return '#94a3b8';
    let hash = 0;
    for (let i = 0; i < prefix.length; i++) {
        hash = prefix.charCodeAt(i) + ((hash << 5) - hash);
    }
    return GRAPH_COLORS[Math.abs(hash) % GRAPH_COLORS.length];
};

export const defaultNodeStyle = {
    border: 'none',
    borderRadius: '8px',
    padding: '15px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    width: nodeWidth,
    textAlign: 'center' as const,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    opacity: 1,
    transition: 'all 0.3s ease',
};

export const defaultEdgeStyle = {
    stroke: '#94a3b8',
    strokeWidth: 2,
    transition: 'all 0.3s ease',
};
