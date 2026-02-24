import { FileUp, Upload, AlertCircle } from 'lucide-react';
import { SQLHelpDialog } from './SQLHelpDialog';
import { useUIStore } from '../stores/useUIStore';

export function EmptyState() {
    const error = useUIStore((state) => state.error);

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background p-4">
            <div className="flex flex-col items-center p-12 rounded-2xl border-2 border-dashed border-border max-w-[400px] text-center bg-panel relative">
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

                <SQLHelpDialog />

                {error && (
                    <div className="mt-6 flex items-start gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-left w-full">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
