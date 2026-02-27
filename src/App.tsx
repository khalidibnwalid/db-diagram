import { useUIStore } from "./stores/useUIStore";
import { handleFileUpload } from "./utils/csvParser";
import { Header } from "./components/Header";
import { Canvas } from "./components/Canvas";
import { EmptyState } from "./components/EmptyState";
import { DropFileProvider } from "./components/DropFileProvider";

function App() {
  const isDarkMode = useUIStore((state) => state.isDarkMode);
  const hasImported = useUIStore((state) => state.hasImported);

  return (
    <DropFileProvider>
      <div
        className={`w-screen h-screen flex flex-col m-0 p-0 transition-colors duration-300 bg-background text-foreground ${isDarkMode ? "dark" : ""}`}
      >
        <input
          type="file"
          id="csv-upload"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Header />

        <div className="flex-1 relative">
          {!hasImported ? <EmptyState /> : <Canvas />}
        </div>
      </div>
    </DropFileProvider>
  );
}

export default App;
