import React from 'react';
import {
  GitBranch,
  XCircle,
  AlertTriangle,
  Cpu,
  Sparkles,
  Terminal,
  CheckCircle,
  Shield
} from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';
import { useAIStore } from '../../stores/useAIStore';
import { useUIStore } from '../../stores/useUIStore';

export const StatusBar: React.FC = () => {
  const { cursorPosition, openTabs, activeTabId } = useEditorStore();
  const { selectedModel, isOllamaRunning, hardware } = useAIStore();
  const { toggleBottomPanel, toggleRightSidebar, rightSidebarOpen, bottomPanelOpen } =
    useUIStore();

  const activeTab = openTabs.find((t) => t.id === activeTabId);

  return (
    <footer className="h-6 bg-indigo-950/80 border-t border-nexcode-800 flex items-center justify-between px-2 select-none text-[11px] text-slate-300 font-sans z-40">
      {/* Left items: Git & Diagnostics */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1 hover:text-white cursor-pointer transition-colors">
          <GitBranch className="w-3 h-3 text-indigo-400" />
          <span>main</span>
        </div>

        <div className="flex items-center space-x-2 text-slate-400">
          <div className="flex items-center space-x-0.5 hover:text-white cursor-pointer">
            <XCircle className="w-3 h-3 text-slate-500" />
            <span>0</span>
          </div>
          <div className="flex items-center space-x-0.5 hover:text-white cursor-pointer">
            <AlertTriangle className="w-3 h-3 text-slate-500" />
            <span>0</span>
          </div>
        </div>
      </div>

      {/* Middle items: AI status & Hardware info */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleRightSidebar}
          className={`flex items-center space-x-1.5 px-2 py-0.5 rounded cursor-pointer transition-colors ${
            rightSidebarOpen ? 'bg-indigo-600/30 text-indigo-300' : 'hover:bg-nexcode-800'
          }`}
          title="Toggle AI Assistant"
        >
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>
            {isOllamaRunning ? `Ollama: ${selectedModel}` : 'Ollama: Standby (Local)'}
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOllamaRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
        </button>

        <div className="hidden sm:flex items-center space-x-1 text-slate-400 text-[10px]">
          <Cpu className="w-3 h-3 text-slate-400" />
          <span>{hardware.accelerationMode} (AMD/CPU Safe)</span>
        </div>
      </div>

      {/* Right items: Cursor position, Encoding, Language */}
      <div className="flex items-center space-x-3 text-slate-400">
        <button
          onClick={toggleBottomPanel}
          className={`flex items-center space-x-1 px-1.5 py-0.5 rounded hover:text-white transition-colors ${
            bottomPanelOpen ? 'text-indigo-400' : ''
          }`}
          title="Toggle Terminal Panel"
        >
          <Terminal className="w-3 h-3" />
        </button>

        <div className="hover:text-white cursor-pointer">
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </div>

        <div className="hidden md:block hover:text-white cursor-pointer">Spaces: 2</div>

        <div className="hidden md:block hover:text-white cursor-pointer">UTF-8</div>

        <div className="hover:text-white font-medium cursor-pointer text-indigo-300">
          {activeTab?.language ? activeTab.language.toUpperCase() : 'TYPESCRIPT'}
        </div>
      </div>
    </footer>
  );
};
