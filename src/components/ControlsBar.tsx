import { Moon, Sun, Upload, HelpCircle, Github } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';
import { SQLHelpDialog } from './SQLHelpDialog';

export function ControlsBar() {
    const isDarkMode = useUIStore((state) => state.isDarkMode);
    const toggleDarkMode = useUIStore((state) => state.toggleDarkMode);
    const error = useUIStore((state) => state.error);

    return (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 p-2 rounded-xl border border-border bg-panel shadow-lg">
            <label
                htmlFor="csv-upload"
                className="flex items-center justify-center size-9 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer transition-colors shadow-sm hover:bg-primary-hover"
            >
                <Upload size={16} />
            </label>
            <button
                onClick={toggleDarkMode}
                className="flex items-center justify-center size-9 rounded-lg border border-border cursor-pointer transition-colors bg-muted text-foreground hover:bg-border/50"
            >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

           <a
                href="https://github.com/khalidibnwalid/db-diagram"
                target='_blank'
                className="flex items-center justify-center size-9 rounded-lg border border-border cursor-pointer transition-colors bg-muted text-foreground hover:bg-border/50"
            >
                <Github size={18} />
            </a>
            
            <SQLHelpDialog>
                <div className="flex items-center justify-center size-9 rounded-lg border border-border cursor-pointer transition-colors bg-muted text-foreground hover:bg-border/50 pointer-events-none">
                    <HelpCircle size={18} />
                </div>
            </SQLHelpDialog>

            {error && <span className="text-red-500 text-sm ml-2">{error}</span>}
        </div>
    );
}
