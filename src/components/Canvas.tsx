import { useEffect, useRef } from "react";
import { Graph } from "@antv/x6";
import { register } from "@antv/x6-react-shape";
import { CustomNode } from "./CustomNode";
import { useGraphStore } from "../stores/useGraphStore";
import { useUIStore } from "../stores/useUIStore";

register({
  shape: "custom-node",
  width: 300,
  height: 50,
  component: CustomNode,
});

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const nodesData = useGraphStore((state) => state.nodesData);
  const edgesData = useGraphStore((state) => state.edgesData);
  const focusedNodeId = useUIStore((state) => state.focusedNodeId);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setFocusedNodeId = useUIStore((state) => state.setFocusedNodeId);
  const updateHighlights = useGraphStore((state) => state.updateHighlights);
  const findShortestPath = useGraphStore((state) => state.findShortestPath);
  const paths = useGraphStore((state) => state.paths);

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = new Graph({
      container: containerRef.current,
      autoResize: true,
      panning: {
        enabled: true,
      },
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        minScale: 0.05,
        maxScale: 3,
      },
      grid: {
        size: 16,
        visible: true,
        type: "dot",
        args: {
          color: "#64748b",
          thickness: 1,
        },
      },
      background: {
        color: "transparent",
      },
      interacting: {
        edgeLabelMovable: false,
        edgeMovable: false,
        nodeMovable: true,
      },
    });

    graph.on("node:click", ({ node, e }) => {
      const shiftKey = e.shiftKey;
      const currentFocusedId = useUIStore.getState().focusedNodeId;

      if (shiftKey && currentFocusedId && currentFocusedId !== node.id) {
        findShortestPath(currentFocusedId, node.id);
      } else {
        setFocusedNodeId(node.id);
        updateHighlights(node.id);
      }
    });

    graph.on("blank:click", () => {
      setFocusedNodeId(null);
      updateHighlights(null);
    });

    graphRef.current = graph;

    return () => {
      graph.dispose();
      graphRef.current = null;
    };
  }, [setFocusedNodeId, updateHighlights, findShortestPath]);

  useEffect(() => {
    if (graphRef.current && nodesData.length > 0) {
      graphRef.current.fromJSON({ nodes: nodesData, edges: edgesData });
      graphRef.current.centerContent();
    }
  }, [nodesData, edgesData]);

  useEffect(() => {
    if (!graphRef.current) return;
    const graph = graphRef.current;
    const normalize = (str: string) => str.toLowerCase().replace(/[_ -]/g, "");
    const searchNormalized = normalize(searchQuery);

    const pathColors = [
      "var(--color-edge-path-1, #f59e0b)", // Gold
      "var(--color-edge-path-2, #6366f1)", // Indigo
      "var(--color-edge-path-3, #ec4899)", // Pink
    ];

    graph.getEdges().forEach((edge) => {
      const source = edge.getSourceCellId();
      const target = edge.getTargetCellId();
      const edgeId = edge.id;

      let pathIndex = -1;
      paths.forEach((path, index) => {
        if (path.edges.has(edgeId)) {
          pathIndex = index;
        }
      });

      const isPartOfPath = pathIndex !== -1;
      const isConnectedEdge =
        isPartOfPath ||
        (focusedNodeId
          ? source === focusedNodeId || target === focusedNodeId
          : false);

      const dims =
        focusedNodeId || paths.length > 0
          ? !isConnectedEdge
          : searchNormalized
            ? true
            : false;

      const color = isPartOfPath
        ? pathColors[pathIndex % pathColors.length]
        : isConnectedEdge
          ? "var(--color-edge-active)"
          : "var(--color-edge-inactive)";

      const strokeWidth = isPartOfPath ? 4 : isConnectedEdge ? 3 : 2;
      const opacity = dims ? 0.15 : 1;

      edge.attr("line/stroke", color);
      edge.attr("line/strokeWidth", strokeWidth);
      edge.attr("line/targetMarker/fill", color);
      edge.attr("line/style/opacity", opacity);
      edge.setZIndex(isConnectedEdge ? 5 : 1);

      edge.prop("labels/0/attrs/label/opacity", opacity);
      edge.prop("labels/0/attrs/body/opacity", opacity);

      // Critical fix to prevent edges from stealing clicks from nodes underneath
      edge.attr("line/style/pointerEvents", "none");
    });
  }, [focusedNodeId, searchQuery, paths]);

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
