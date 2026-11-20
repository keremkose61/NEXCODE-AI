import React, { useEffect } from 'react';
import { TopBar } from './components/layout/TopBar';
import { ActivityBar } from './components/layout/ActivityBar';
import { LeftPanel } from './components/layout/LeftPanel';
import { CenterPanel } from './components/layout/CenterPanel';
import { RightPanel } from './components/layout/RightPanel';
import { BottomPanel } from './components/layout/BottomPanel';
import { StatusBar } from './components/layout/StatusBar';
import { useAIStore } from './stores/useAIStore';
import { useUIStore } from './stores/useUIStore';
import { useEditorStore } from './stores/useEditorStore';

export const App: React.FC = () => {
  const { checkLocalAIStatus } = useAIStore();
  const { toggleLeftSidebar, toggleBottomPanel, toggleRightSidebar } = useUIStore();
  const { saveCurrentFile } = useEditorStore();

  useEffect(() => {
    // Initial hardware & local AI engine status check
    checkLocalAIStatus();

    // Global IDE keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S: Save file
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCurrentFile();
      }
      // Ctrl+B: Toggle left sidebar
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleLeftSidebar();
      }
      // Ctrl+J: Toggle bottom terminal panel
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        toggleBottomPanel();
      }
      // Ctrl+L: Toggle right AI assistant panel
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleRightSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [checkLocalAIStatus, saveCurrentFile, toggleLeftSidebar, toggleBottomPanel, toggleRightSidebar]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-nexcode-950 text-slate-200">
      {/* Top Application Bar */}
      <TopBar />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Left Activity Bar */}
        <ActivityBar />

        {/* Left Resizable Panel (Explorer, Search, Git, Extensions, AI) */}
        <LeftPanel />

        {/* Center Code Area + Bottom Panel */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <CenterPanel />
          <BottomPanel />
        </div>

        {/* Right AI Assistant Panel */}
        <RightPanel />
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />
    </div>
  );
};
