import { Moon, Sun, Upload } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';

export function ControlsBar() {
    const isDarkMode = useUIStore((state) => state.isDarkMode);
    const toggleDarkMode = useUIStore((state) => state.toggleDarkMode);
    const error = useUIStore((state) => state.error);

    return (
        <div className="absolute top-6 left-6 z-20 flex items-center gap-2 p-2 rounded-xl border border-border bg-panel shadow-lg">
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
    );
}
