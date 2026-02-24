import React, { useCallback } from 'react';
import { ReactFlow, Controls, MiniMap, Background } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import { useGraphStore } from '../stores/useGraphStore';
import { useUIStore } from '../stores/useUIStore';

export function Canvas() {
    const nodes = useGraphStore((state) => state.nodes);
    const edges = useGraphStore((state) => state.edges);
    const onNodesChange = useGraphStore((state) => state.onNodesChange);
    const onEdgesChange = useGraphStore((state) => state.onEdgesChange);
    const onConnect = useGraphStore((state) => state.onConnect);
    const isDarkMode = useUIStore((state) => state.isDarkMode);
    const setFocusedNodeId = useUIStore((state) => state.setFocusedNodeId);
    const updateHighlights = useGraphStore((state) => state.updateHighlights);
    const searchQuery = useUIStore((state) => state.searchQuery);

    const onNodeClick = useCallback((_: React.MouseEvent, clickedNode: Node) => {
        setFocusedNodeId(clickedNode.id);
        updateHighlights(clickedNode.id, searchQuery);
    }, [setFocusedNodeId, updateHighlights, searchQuery]);

    const onPaneClick = useCallback(() => {
        setFocusedNodeId(null);
        updateHighlights(null, searchQuery);
    }, [setFocusedNodeId, updateHighlights, searchQuery]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
            minZoom={0.05}
        >
            <Controls className="bg-panel! fill-foreground! border border-border" />
            <MiniMap
                nodeStrokeColor="var(--border-color)"
                nodeColor="var(--panel-bg)"
                maskColor={isDarkMode ? "rgba(15, 23, 42, 0.7)" : "rgba(248, 250, 252, 0.7)"}
            />
            <Background gap={16} size={1} color="var(--border-color)" />
        </ReactFlow>
    );
}
