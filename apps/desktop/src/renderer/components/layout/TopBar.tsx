import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Settings,
  Minus,
  Square,
  X,
  ChevronDown,
  Cpu,
  FolderOpen
} from 'lucide-react';
import { useAIStore } from '../../stores/useAIStore';
import { useProjectStore } from '../../stores/useProjectStore';

export const TopBar: React.FC = () => {
  const { selectedModel, availableModels, setSelectedModel, isOllamaRunning } = useAIStore();
  const { projectName, openFolderDialog } = useProjectStore();
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const handleMinimize = () => window.nexcode?.window.minimize();
  const handleMaximize = () => window.nexcode?.window.maximize();
  const handleClose = () => window.nexcode?.window.close();

  return (
    <header className="h-9 bg-nexcode-950 border-b border-nexcode-800 flex items-center justify-between px-3 select-none drag-region text-xs z-50">
      {/* Left: Branding & Menu */}
      <div className="flex items-center space-x-3 no-drag-region">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-sm shadow-indigo-500/20">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold tracking-wider text-slate-100 flex items-center gap-1.5">
            NEXCODE <span className="text-indigo-400 font-extrabold text-[10px] px-1 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">AI</span>
          </span>
        </div>

        {/* Application Menus */}
        <div className="hidden md:flex items-center space-x-1 text-slate-400 font-medium ml-2">
          {['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'].map((item) => (
            <button
              key={item}
              className="px-2 py-0.5 rounded hover:bg-nexcode-850 hover:text-slate-200 transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Middle: Active Project / Workspace Breadcrumb */}
      <div className="flex items-center space-x-2 text-slate-400 text-[11px] no-drag-region">
        <button
          onClick={openFolderDialog}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-nexcode-900 border border-nexcode-800 hover:border-indigo-500/50 hover:text-slate-200 transition-all cursor-pointer"
          title="Open Folder"
        >
          <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-medium text-slate-300">{projectName}</span>
        </button>
      </div>

      {/* Right: AI Model Selector & Window Controls */}
      <div className="flex items-center space-x-2 no-drag-region">
        {/* AI Model Dropdown */}
        <div className="relative">
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-nexcode-900 border border-nexcode-750 hover:border-indigo-500/60 transition-all text-slate-300"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOllamaRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-[11px] font-medium">{selectedModel}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {modelDropdownOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-nexcode-900 border border-nexcode-750 rounded-lg shadow-2xl p-1.5 z-50">
              <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-nexcode-800">
                Local AI Models (Ollama)
              </div>
              <div className="py-1">
                {availableModels.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => {
                      setSelectedModel(m.name);
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md flex flex-col hover:bg-nexcode-800 transition-colors ${
                      selectedModel === m.name ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-[11px] font-semibold">{m.name}</span>
                      {m.size && <span className="text-[10px] text-slate-500">{m.size}</span>}
                    </div>
                    {m.description && (
                      <span className="text-[10px] text-slate-400 truncate">{m.description}</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="px-2 py-1 bg-nexcode-950 rounded text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Status:</span>
                <span className={isOllamaRunning ? 'text-emerald-400' : 'text-amber-400'}>
                  {isOllamaRunning ? '● Local Engine Online' : '○ Standby / CPU Ready'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Run Project Button */}
        <button
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
          title="Run Active File (F5)"
        >
          <Play className="w-3 h-3 fill-current" />
          <span className="text-[11px]">Run</span>
        </button>

        {/* Settings Button */}
        <button
          className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-nexcode-850 transition-colors"
          title="Settings (Ctrl+,)"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Windows OS Window Controls */}
        <div className="flex items-center ml-1 border-l border-nexcode-800 pl-1">
          <button
            onClick={handleMinimize}
            className="w-7 h-7 flex items-center justify-center hover:bg-nexcode-800 text-slate-400 hover:text-white transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleMaximize}
            className="w-7 h-7 flex items-center justify-center hover:bg-nexcode-800 text-slate-400 hover:text-white transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center hover:bg-rose-600 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
