import { useUIStore } from '../stores/useUIStore';
import { ControlsBar } from './ControlsBar';
import { SearchBar } from './SearchBar';

export function Header() {
    const hasImported = useUIStore((state) => state.hasImported);

    if (!hasImported) return null;

    return (
        <>
            <ControlsBar />
            <SearchBar />
        </>
    );
}
