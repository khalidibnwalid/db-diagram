import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import dagre from 'dagre';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from '@xyflow/react';
import type { Connection, Edge, Node } from '@xyflow/react';
import { Moon, Sun, Upload, FileUp } from 'lucide-react'; // Assuming lucide-react is installed as per first prompt
import '@xyflow/react/dist/style.css';

interface CsvRow {
  Child_Table: string;
  Child_Column: string;
  Parent_Table: string;
  Parent_Column: string;
  Relationship_Name: string;
}

const nodeWidth = 200;
const nodeHeight = 50; // Approximate height of the node based on padding/font

const applyDagreLayout = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // LR direction usually produces much more readable database schema diagrams
  // because it reads naturally and text fits better horizontally
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 60,   // vertical separation between nodes in a column
    ranksep: 200,   // horizontal space between columns
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

// Colors for grouping based on table prefixes
const groupColors = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f43f5e', // rose
  '#84cc16', // lime
];
const getGroupColor = (tableName: string) => {
  const prefix = tableName.split('_')[0];
  if (!prefix) return '#94a3b8'; // fallback
  // Simple hash string to color array
  let hash = 0;
  for (let i = 0; i < prefix.length; i++) {
    hash = prefix.charCodeAt(i) + ((hash << 5) - hash);
  }
  return groupColors[Math.abs(hash) % groupColors.length];
};

const defaultNodeStyle = {
  // background will be set dynamically based on group
  border: 'none',
  borderRadius: '8px',
  padding: '15px',
  fontSize: '14px',
  fontWeight: '600',
  color: '#ffffff', // White text on colored background
  width: nodeWidth,
  textAlign: 'center' as const,
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  opacity: 1,
  transition: 'all 0.3s ease',
};

const defaultEdgeStyle = {
  stroke: '#94a3b8',
  strokeWidth: 2,
  transition: 'all 0.3s ease',
};


function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasImported, setHasImported] = useState(false);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('db-graph-theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;

        if (!data || data.length === 0) {
          setError('CSV file is empty or invalid.');
          return;
        }

        const firstRow = data[0];
        if (!firstRow.Child_Table || !firstRow.Parent_Table) {
          setError('CSV must contain Child_Table and Parent_Table columns. Please check your CSV format.');
          return;
        }

        setError(null);

        const uniqueNodes = new Set<string>();
        data.forEach((row) => {
          if (row.Child_Table) uniqueNodes.add(row.Child_Table);
          if (row.Parent_Table) uniqueNodes.add(row.Parent_Table);
        });

        const initialNodes: Node[] = Array.from(uniqueNodes).map((nodeId) => ({
          id: nodeId,
          data: { label: nodeId, baseColor: getGroupColor(nodeId) },
          position: { x: 0, y: 0 },
          style: {
            ...defaultNodeStyle,
            background: getGroupColor(nodeId)
          },
        }));

        const initialEdges: Edge[] = data.map((row, index) => ({
          id: `e-${row.Parent_Table}-${row.Child_Table}-${index}`,
          source: row.Parent_Table,
          target: row.Child_Table,
          label: row.Relationship_Name,
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#94a3b8',
          },
          style: { ...defaultEdgeStyle },
          labelStyle: { fill: '#64748b', fontWeight: 500, fontSize: 12 },
          labelBgStyle: { fill: '#f8fafc', color: '#f8fafc', fillOpacity: 0.8 },
        }));

        const { nodes: layoutedNodes, edges: layoutedEdges } = applyDagreLayout(initialNodes, initialEdges);

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setHasImported(true);
        setFocusedNodeId(null);
        setSearchQuery('');
      },
      error: (error: Error) => {
        setError(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  const updateHighlights = useCallback((focusId: string | null, search: string) => {
    const searchLower = search.toLowerCase();

    setEdges((eds) => {
      const connected = new Set<string>();
      if (focusId) {
        connected.add(focusId);
        eds.forEach(e => {
          if (e.source === focusId) connected.add(e.target);
          if (e.target === focusId) connected.add(e.source);
        });
      }

      setNodes((nds) => nds.map((n) => {
        const isFocused = n.id === focusId;
        const isConnected = connected.has(n.id);
        const matchesSearch = searchLower && (n.data.label as string).toLowerCase().includes(searchLower);

        let opacity = 1;
        let border = 'none';
        let boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';

        if (focusId) {
          if (!isConnected) opacity = 0.15;
          if (isFocused) {
            border = '2px solid #ffffff';
            boxShadow = `0 0 0 4px ${n.data.baseColor}80`;
          }
        } else if (searchLower) {
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
      }));

      return eds.map((e) => {
        const isConnectedEdge = focusId ? (e.source === focusId || e.target === focusId) : false;
        const dims = focusId ? !isConnectedEdge : (searchLower ? true : false);

        return {
          ...e,
          animated: isConnectedEdge,
          style: {
            ...defaultEdgeStyle,
            stroke: isConnectedEdge ? 'var(--color-edge-active)' : 'var(--color-edge-inactive)',
            strokeWidth: isConnectedEdge ? 3 : 2,
            opacity: dims ? 0.2 : 1
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isConnectedEdge ? 'var(--color-edge-active)' : (dims ? 'var(--color-edge-inactive)' : 'var(--color-edge-active)'),
          }
        };
      });
    });
  }, [setNodes, setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, clickedNode: Node) => {
    setFocusedNodeId(clickedNode.id);
    updateHighlights(clickedNode.id, searchQuery);
  }, [searchQuery, updateHighlights]);

  const onPaneClick = useCallback(() => {
    if (focusedNodeId === null) return;
    setFocusedNodeId(null);
    updateHighlights(null, searchQuery);
  }, [focusedNodeId, searchQuery, updateHighlights]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    updateHighlights(focusedNodeId, e.target.value);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem('db-graph-theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  return (
    <div className={`w-screen h-screen flex flex-col m-0 p-0 transition-colors duration-300 bg-background text-foreground ${isDarkMode ? 'dark' : ''}`}>
      <input
        type="file"
        id="csv-upload"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Floating Elements (only show when graph is visible) */}
      {hasImported && (
        <>
          {/* Top Left Controls Island */}
          <div className="absolute top-6 left-6 z-20 flex items-center gap-2 p-2 rounded-xl border border-border bg-panel shadow-lg">
            {/* <h1 className="m-0 text-xs font-bold">
              Database Diagram
            </h1> */}

            <div className="w-px h-6 bg-border" />
            <label
              htmlFor="csv-upload"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer transition-colors shadow-sm hover:bg-primary-hover"
            >
              <Upload size={16} />
            </label>

            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-border cursor-pointer transition-colors bg-muted text-foreground hover:bg-border/50"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {error && <span className="text-red-500 text-sm ml-2">{error}</span>}
          </div>

          {/* Top Right Search Island */}
          <div className="absolute top-6 right-6 z-20 rounded-xl border border-border shadow-lg p-1 bg-panel">
            <input
              type="text"
              placeholder="Search tables..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="px-4 py-2.5 rounded-lg border-none w-[260px] text-sm outline-none bg-background text-foreground"
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 relative">
        {!hasImported ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background">
            <div className="flex flex-col items-center p-12 rounded-2xl border-2 border-dashed border-border max-w-[400px] text-center bg-panel">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-border/50">
                <FileUp size={32} className="text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold m-0 mb-3">No Data Imported</h2>
              <p className="text-sm leading-relaxed m-0 mb-6 text-muted-foreground">
                Upload a CSV file containing your database relationships to auto-generate a directed graph.
              </p>
              <label
                htmlFor="csv-upload"
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-[15px] font-medium cursor-pointer hover:bg-primary-hover transition-colors"
              >
                <Upload size={18} />
                Open CSV File
              </label>
            </div>
          </div>
        ) : (
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
            <Controls className="!bg-panel !fill-foreground border border-border" />
            <MiniMap nodeStrokeColor="var(--border-color)" nodeColor="var(--panel-bg)" maskColor={isDarkMode ? "rgba(15, 23, 42, 0.7)" : "rgba(248, 250, 252, 0.7)"} />
            <Background gap={16} size={1} color="var(--border-color)" />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}

export default App;
