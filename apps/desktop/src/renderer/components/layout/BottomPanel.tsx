import React, { useState } from 'react';
import {
  Terminal,
  AlertTriangle,
  FileText,
  Bug,
  Plus,
  Trash2,
  Maximize2,
  Minimize2,
  X,
  ChevronRight
} from 'lucide-react';
import { useUIStore, BottomPanelTab } from '../../stores/useUIStore';
import { useProjectStore } from '../../stores/useProjectStore';

export const BottomPanel: React.FC = () => {
  const { bottomPanelOpen, activeBottomTab, setBottomTab, toggleBottomPanel, bottomPanelHeight } =
    useUIStore();
  const { rootPath, projectName } = useProjectStore();

  const [terminals, setTerminals] = useState<
    { id: string; name: string; shell: 'powershell' | 'cmd'; history: string[] }[]
  >([
    {
      id: 'term-1',
      name: '1: PowerShell',
      shell: 'powershell',
      history: [
        'Windows PowerShell',
        'Copyright (C) Microsoft Corporation. All rights reserved.',
        '',
        'NEXCODE AI Local Development Terminal ready.',
        `Working directory: ${rootPath || 'C:\\NEXCODE-AI'}`
      ]
    }
  ]);
  const [activeTermId, setActiveTermId] = useState('term-1');
  const [commandInput, setCommandInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  if (!bottomPanelOpen) return null;

  const activeTerm = terminals.find((t) => t.id === activeTermId) || terminals[0];

  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim();
    setTerminals((prev) =>
      prev.map((t) => {
        if (t.id === activeTermId) {
          return {
            ...t,
            history: [
              ...t.history,
              `PS ${rootPath || 'C:\\NEXCODE-AI'}> ${cmd}`,
              `[NEXCODE Local Runner] Executing: ${cmd}`,
              `Done (Simulated safe shell session)`
            ]
          };
        }
        return t;
      })
    );
    setCommandInput('');
  };

  const handleClear = () => {
    setTerminals((prev) =>
      prev.map((t) => (t.id === activeTermId ? { ...t, history: [] } : t))
    );
  };

  const handleAddTerminal = () => {
    const newId = `term-${Date.now()}`;
    const newTerm = {
      id: newId,
      name: `${terminals.length + 1}: PowerShell`,
      shell: 'powershell' as const,
      history: ['PowerShell Session Initialized.']
    };
    setTerminals([...terminals, newTerm]);
    setActiveTermId(newId);
  };

  return (
    <div
      style={{ height: isExpanded ? '450px' : `${bottomPanelHeight}px` }}
      className="bg-nexcode-950 border-t border-nexcode-800 flex flex-col select-none text-xs transition-all z-20 flex-shrink-0"
    >
      {/* Tab Bar Header */}
      <div className="h-8 px-3 border-b border-nexcode-800 flex items-center justify-between bg-nexcode-900/80">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setBottomTab('terminal')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
              activeBottomTab === 'terminal'
                ? 'text-indigo-400 bg-nexcode-950 font-semibold border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>
          <button
            onClick={() => setBottomTab('problems')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
              activeBottomTab === 'problems'
                ? 'text-indigo-400 bg-nexcode-950 font-semibold border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Problems</span>
            <span className="text-[10px] px-1 rounded-full bg-slate-800 text-slate-400 font-mono">
              0
            </span>
          </button>
          <button
            onClick={() => setBottomTab('output')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
              activeBottomTab === 'output'
                ? 'text-indigo-400 bg-nexcode-950 font-semibold border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Output</span>
          </button>
          <button
            onClick={() => setBottomTab('debug')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
              activeBottomTab === 'debug'
                ? 'text-indigo-400 bg-nexcode-950 font-semibold border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Debug Console</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 text-slate-400">
          {activeBottomTab === 'terminal' && (
            <>
              <button
                onClick={handleAddTerminal}
                title="New Terminal"
                className="p-1 hover:text-white hover:bg-nexcode-800 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClear}
                title="Clear Terminal"
                className="p-1 hover:text-white hover:bg-nexcode-800 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Restore Panel' : 'Maximize Panel'}
            className="p-1 hover:text-white hover:bg-nexcode-800 rounded transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={toggleBottomPanel}
            title="Close Panel"
            className="p-1 hover:text-white hover:bg-nexcode-800 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab: Terminal Content */}
      {activeBottomTab === 'terminal' && (
        <div className="flex-1 flex flex-col p-2 font-mono text-xs overflow-hidden bg-nexcode-950">
          {/* Terminal Output history */}
          <div className="flex-1 overflow-y-auto space-y-1 text-slate-300 pr-1">
            {activeTerm.history.map((line, idx) => (
              <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                {line}
              </div>
            ))}
          </div>

          {/* Terminal Command Input Form */}
          <form onSubmit={handleRunCommand} className="flex items-center space-x-1.5 pt-1 border-t border-nexcode-850">
            <span className="text-indigo-400 font-bold flex items-center">
              PS &gt;
            </span>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Run command or script in safe shell..."
              className="flex-1 bg-transparent text-slate-100 focus:outline-none text-xs font-mono"
            />
          </form>
        </div>
      )}

      {/* Tab: Problems Content */}
      {activeBottomTab === 'problems' && (
        <div className="flex-1 p-4 flex flex-col items-center justify-center text-slate-500 text-xs">
          <p>No problems detected in workspace.</p>
        </div>
      )}

      {/* Tab: Output Content */}
      {activeBottomTab === 'output' && (
        <div className="flex-1 p-3 font-mono text-xs text-slate-400 overflow-y-auto">
          [NEXCODE-Main] Application started in development environment.
          <br />
          [NEXCODE-LSP] Language server host loaded.
          <br />
          [NEXCODE-AI] Local Engine probe: http://localhost:11434.
        </div>
      )}

      {/* Tab: Debug Console Content */}
      {activeBottomTab === 'debug' && (
        <div className="flex-1 p-4 flex flex-col items-center justify-center text-slate-500 text-xs">
          <p>Debug session is not active. Press F5 or click Run to start debugging.</p>
        </div>
      )}
    </div>
  );
};
