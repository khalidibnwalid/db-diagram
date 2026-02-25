import React, { useState } from 'react';
import { FileUp, Upload, AlertCircle, Inbox } from 'lucide-react';
import { SQLHelpDialog } from './SQLHelpDialog';
import { useUIStore } from '../stores/useUIStore';
import { parseFile } from '../utils/csvParser';

export function EmptyState() {
    const error = useUIStore((state) => state.error);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            parseFile(files[0]);
        }
    };

    return (
        <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-background p-4 h-full w-full"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className={`flex flex-col items-center p-12 rounded-2xl border-2 border-dashed max-w-[400px] text-center bg-panel relative transition-colors ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border'
                }`}>
                {isDragging ? (
                    <>
                        <div className="size-16 rounded-full flex items-center justify-center mb-6 bg-primary/20 animate-pulse">
                            <Inbox size={32} className="text-primary" />
                        </div>
                        <h2 className="text-xl font-bold m-0 mb-3 text-primary">Drop to Upload</h2>
                        <p className="text-sm leading-relaxed m-0 mb-6 text-primary/80">
                            Release your CSV file here
                        </p>
                    </>
                ) : (
                    <>
                        <div className="size-16 rounded-full flex items-center justify-center mb-6 bg-border/50">
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
                    </>
                )}
            </div>
        </div>
    );
}
