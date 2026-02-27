/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState } from "react";
import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { parseFile } from "../utils/csvParser";

interface DropFileContextType {
  isDragging: boolean;
}

const DropFileContext = createContext<DropFileContextType>({
  isDragging: false,
});

export const useDragDrop = () => React.useContext(DropFileContext);

export function DropFileProvider({ children }: { children: ReactNode }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Safety check allowing drag over child elements without flickering
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Local drop handler just in case it hits the div directly
  const handleLocalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      parseFile(files[0]);
    }
  };

  return (
    <DropFileContext.Provider value={{ isDragging }}>
      <div
        className="w-full h-full relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleLocalDrop}
      >
        {children}

        {/* Global Drag Overlay */}
        {isDragging && (
          <div className="fixed inset-0 z-100 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center border-4 border-primary border-dashed m-4 rounded-3xl transition-all pointer-events-none">
            <div className="size-24 rounded-full flex items-center justify-center mb-6 bg-primary/20 animate-pulse">
              <Inbox size={48} className="text-primary" />
            </div>
            <h2 className="text-3xl font-bold m-0 mb-3 text-primary">
              Drop to Upload
            </h2>
            <p className="text-lg leading-relaxed m-0 mb-6 text-primary/80">
              Release your CSV file anywhere to generate diagram
            </p>
          </div>
        )}
      </div>
    </DropFileContext.Provider>
  );
}
