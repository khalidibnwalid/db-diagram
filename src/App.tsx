import { useState, useCallback } from 'react';
import Papa from 'papaparse';
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
import '@xyflow/react/dist/style.css';

interface CsvRow {
  Child_Table: string;
  Child_Column: string;
  Parent_Table: string;
  Parent_Column: string;
  Relationship_Name: string;
}

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasImported, setHasImported] = useState(false);

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

        const newNodes: Node[] = Array.from(uniqueNodes).map((nodeId, index) => ({
          id: nodeId,
          data: { label: nodeId },
          // Simple grid layout, user can drag to re-arrange
          position: {
            x: (index % 5) * 300,
            y: Math.floor(index / 5) * 150
          },
          style: {
            background: '#ffffff',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            padding: '15px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1e293b',
            width: 220,
            textAlign: 'center' as const,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
          }
        }));

        const newEdges: Edge[] = data.map((row, index) => ({
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
          style: {
            stroke: '#94a3b8',
            strokeWidth: 2
          },
          labelStyle: { fill: '#64748b', fontWeight: 500, fontSize: 12 },
          labelBgStyle: { fill: '#f8fafc', color: '#f8fafc', fillOpacity: 0.8 },
        }));

        setNodes(newNodes);
        setEdges(newEdges);
        setHasImported(true);
      },
      error: (error: Error) => {
        setError(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', margin: 0, padding: 0 }}>
      {!hasImported && (
        <div style={{
          padding: '24px',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #1e293b',
          zIndex: 10,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        }}>
          <h1 style={{ margin: '0 0 16px 0', fontSize: '28px', color: '#f8fafc', fontWeight: 'bold' }}>
            Database Diagram Generator
          </h1>
          <p style={{ color: '#cbd5e1', marginBottom: '16px', fontSize: '14px' }}>
            Upload a CSV file containing your database relationships to auto-generate a directed graph.
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{
              display: 'block',
              color: '#f8fafc',
              backgroundColor: '#1e293b',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #334155',
              cursor: 'pointer'
            }}
          />
          {error && <div style={{ color: '#ef4444', marginTop: '12px', fontWeight: '500' }}>{error}</div>}
        </div>
      )}

      <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative', backgroundColor: '#f1f5f9' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          minZoom={0.1}
        >
          <Controls />
          <MiniMap nodeStrokeColor="#cbd5e1" nodeColor="#e2e8f0" maskColor="rgba(248, 250, 252, 0.7)" />
          <Background gap={16} size={1} color="#cbd5e1" />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;
