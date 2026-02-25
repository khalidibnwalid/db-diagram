
import { useGraphStore } from '../stores/useGraphStore';
import { useUIStore } from '../stores/useUIStore';

export const CustomNode = ({ node }: { node: any }) => {
    const data = node.getData();
    // React Shape re-renders when node.setData() is called with { deep: false } or similar if using X6 react form, 
    // but in AntV X6 the best way is often to just use the node's data.
    const { label, baseColor } = data;

    // We can also subscribe to Zustand stores here for highlighting
    const focusId = useUIStore((state) => state.focusedNodeId);
    const searchQuery = useUIStore((state) => state.searchQuery);
    const connectedNodes = useGraphStore((state) => state.connectedNodes);

    const isFocused = node.id === focusId;
    const isConnected = connectedNodes.has(node.id);

    const normalize = (str: string) => str.toLowerCase().replace(/[_ -]/g, '');
    const searchNormalized = normalize(searchQuery);
    const nodeLabelNormalized = normalize(label as string);
    const matchesSearch = searchNormalized && nodeLabelNormalized.includes(searchNormalized);

    let opacity = 1;
    let border = 'none';
    let boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
    let zIndex = 10;

    if (focusId) {
        if (!isConnected && !isFocused) opacity = 0.15;
        if (isFocused) {
            border = '2px solid #ffffff';
            boxShadow = `0 0 0 4px ${baseColor}80`;
            zIndex = 100;
        }
    } else if (searchNormalized) {
        if (!matchesSearch) opacity = 0.15;
        else {
            border = '2px solid #ffffff';
            boxShadow = `0 0 0 4px ${baseColor}80`;
            zIndex = 100;
        }
    }

    return (
        <div style={{
            background: baseColor,
            borderRadius: '16px',
            padding: '20px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#ffffff',
            width: '300px',
            height: '50px',
            textAlign: 'center',
            boxShadow,
            border,
            opacity,
            zIndex,
            transition: 'all 0.3s ease',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {label}
        </div>
    );
};
