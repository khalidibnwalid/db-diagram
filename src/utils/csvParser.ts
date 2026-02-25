import Papa from 'papaparse';
import { useGraphStore } from '../stores/useGraphStore';
import { useUIStore } from '../stores/useUIStore';
import { applyDagreLayout, getGroupColor, defaultNodeStyle, defaultEdgeStyle } from './graphUtils';
import type { Node, Edge } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';

export interface CsvRow {
    Child_Table: string;
    Child_Column: string;
    Parent_Table: string;
    Parent_Column: string;
    Relationship_Name: string;
}

export const parseFile = (file: File) => {
    const { setError, setHasImported, setFocusedNodeId, setSearchQuery } = useUIStore.getState();
    const { setNodes, setEdges } = useGraphStore.getState();

    Papa.parse<string[]>(file, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
            const rawData = results.data;

            if (!rawData || rawData.length === 0) {
                setError('CSV file is empty or invalid.');
                return;
            }

            let data: CsvRow[] = [];

            const firstRow = rawData[0];
            const hasHeader = firstRow.includes('Child_Table') && firstRow.includes('Parent_Table');

            if (hasHeader) {
                const childTableIdx = firstRow.indexOf('Child_Table');
                const childColumnIdx = firstRow.indexOf('Child_Column');
                const parentTableIdx = firstRow.indexOf('Parent_Table');
                const parentColumnIdx = firstRow.indexOf('Parent_Column');
                const relationshipIdx = firstRow.indexOf('Relationship_Name');

                if (childTableIdx === -1 || parentTableIdx === -1) {
                    setError('CSV header must contain Child_Table and Parent_Table columns.');
                    return;
                }

                data = rawData.slice(1).map(row => ({
                    Child_Table: row[childTableIdx],
                    Child_Column: row[childColumnIdx],
                    Parent_Table: row[parentTableIdx],
                    Parent_Column: row[parentColumnIdx],
                    Relationship_Name: row[relationshipIdx]
                }));
            } else {
                data = rawData.map(row => ({
                    Child_Table: row[0],
                    Child_Column: row[1],
                    Parent_Table: row[2],
                    Parent_Column: row[3],
                    Relationship_Name: row[4]
                }));
            }

            if (data.length === 0 || !data[0].Child_Table || !data[0].Parent_Table) {
                setError('CSV must contain valid valid relationship data. Check columns.');
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

export const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    parseFile(file);
};
