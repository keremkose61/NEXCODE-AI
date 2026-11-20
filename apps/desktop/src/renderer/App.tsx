import React, { useEffect } from 'react';
import { TopBar } from './components/layout/TopBar';
import { ActivityBar } from './components/layout/ActivityBar';
import { LeftPanel } from './components/layout/LeftPanel';
import { CenterPanel } from './components/layout/CenterPanel';
import { RightPanel } from './components/layout/RightPanel';
import { BottomPanel } from './components/layout/BottomPanel';
import { StatusBar } from './components/layout/StatusBar';
import { ResizeHandle } from './components/ui/ResizeHandle';
import { CommandPalette } from './components/ui/CommandPalette';
import { QuickOpen } from './components/ui/QuickOpen';
import { SettingsModal } from './components/ui/SettingsModal';
import { ToastContainer } from './components/ui/ToastContainer';
import { useAIStore } from './stores/useAIStore';
import { useUIStore } from './stores/useUIStore';
import { useEditorStore } from './stores/useEditorStore';
import { useSettingsStore } from './stores/useSettingsStore';
import { useNotificationStore } from './stores/useNotificationStore';

export const App: React.FC = () => {
  const { checkLocalAIStatus } = useAIStore();
  const {
    leftSidebarOpen,
    rightSidebarOpen,
    bottomPanelOpen,
    leftPanelWidth,
    setLeftPanelWidth,
    rightPanelWidth,
    setRightPanelWidth,
    bottomPanelHeight,
    setBottomPanelHeight,
    toggleLeftSidebar,
    toggleBottomPanel,
    toggleRightSidebar,
    openCommandPalette,
    openQuickOpen
  } = useUIStore();
  const { saveCurrentFile } = useEditorStore();
  const { openSettingsModal } = useSettingsStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    // Initial hardware & local AI engine status check
    checkLocalAIStatus();

    // Global IDE keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+P / F1: Command Palette
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') || e.key === 'F1') {
        e.preventDefault();
        openCommandPalette();
        return;
      }

      // Ctrl+P: Quick Open Files
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        openQuickOpen();
        return;
      }

      // Ctrl+,: Settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        openSettingsModal();
        return;
      }

      // Ctrl+S: Save file
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCurrentFile().then(() => {
          addNotification({ type: 'success', message: 'File saved successfully.' });
        });
        return;
      }

      // Ctrl+B: Toggle left sidebar
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleLeftSidebar();
        return;
      }

      // Ctrl+J: Toggle bottom terminal panel
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        toggleBottomPanel();
        return;
      }

      // Ctrl+L: Toggle right AI assistant panel
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleRightSidebar();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    checkLocalAIStatus,
    saveCurrentFile,
    toggleLeftSidebar,
    toggleBottomPanel,
    toggleRightSidebar,
    openCommandPalette,
    openQuickOpen,
    openSettingsModal,
    addNotification
  ]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-nexcode-950 text-slate-200">
      {/* Top Application Bar */}
      <TopBar />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Left Activity Bar */}
        <ActivityBar />

        {/* Left Resizable Panel (Explorer, Search, Git, Extensions, AI) */}
        {leftSidebarOpen && (
          <>
            <LeftPanel />
            <ResizeHandle
              direction="vertical"
              onResize={(delta) => setLeftPanelWidth(leftPanelWidth + delta)}
            />
          </>
        )}

        {/* Center Code Area + Bottom Panel */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <CenterPanel />

          {/* Bottom Panel Resizer & Panel */}
          {bottomPanelOpen && (
            <>
              <ResizeHandle
                direction="horizontal"
                onResize={(delta) => setBottomPanelHeight(bottomPanelHeight - delta)}
              />
              <BottomPanel />
            </>
          )}
        </div>

        {/* Right Resizable AI Assistant Panel */}
        {rightSidebarOpen && (
          <>
            <ResizeHandle
              direction="vertical"
              onResize={(delta) => setRightPanelWidth(rightPanelWidth - delta)}
            />
            <RightPanel />
          </>
        )}
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />

      {/* Interactive Overlays & Modals */}
      <CommandPalette />
      <QuickOpen />
      <SettingsModal />
      <ToastContainer />
    </div>
  );
};
