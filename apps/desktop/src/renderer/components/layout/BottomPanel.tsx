import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal as TerminalIcon,
  AlertTriangle,
  FileText,
  Bug,
  Plus,
  Trash2,
  Maximize2,
  Minimize2,
  X,
  Play,
  Pause,
  RotateCcw,
  StepForward,
  CornerDownRight,
  CornerUpLeft,
  Square,
  ChevronRight,
  CircleDot,
  Send
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { useTerminalStore } from '../../stores/useTerminalStore';
import { useDebuggerStore } from '../../stores/useDebuggerStore';
import { useEditorStore } from '../../stores/useEditorStore';

export const BottomPanel: React.FC = () => {
  const { bottomPanelOpen, activeBottomTab, setBottomTab, toggleBottomPanel, bottomPanelHeight } =
    useUIStore();
  const { rootPath } = useProjectStore();
  const { activeTabId, openTabs } = useEditorStore();
  const {
    tabs,
    activeTabId: activeTermId,
    addTab,
    closeTab,
    setActiveTab: setActiveTermId,
    sendCommand,
    clearTerminal,
    initTerminalListener
  } = useTerminalStore();

  const {
    isDebugging,
    isPaused,
    currentLine,
    currentFile,
    breakpoints,
    callStack,
    variables,
    consoleLogs,
    startDebugging,
    stopDebugging,
    pauseDebugging,
    resumeDebugging,
    stepOver,
    stepInto,
    stepOut,
    evaluateExpression,
    clearConsole
  } = useDebuggerStore();

  const [commandInput, setCommandInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [debugExpr, setDebugExpr] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const debugEndRef = useRef<HTMLDivElement>(null);

  const activeTerm = tabs.find((t) => t.id === activeTermId) || tabs[0];
  const activeTab = openTabs.find((t) => t.id === activeTabId);

  useEffect(() => {
    const cleanup = initTerminalListener();
    return () => {
      cleanup();
    };
  }, [initTerminalListener]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTerm?.output]);

  useEffect(() => {
    debugEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs]);

  if (!bottomPanelOpen) return null;

  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim() || !activeTerm) return;
    sendCommand(activeTerm.id, commandInput);
    setCommandInput('');
    setHistoryIndex(null);
  };

  const handleDebugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debugExpr.trim()) return;
    evaluateExpression(debugExpr);
    setDebugExpr('');
  };

  return (
    <div
      style={{ height: isExpanded ? '460px' : `${bottomPanelHeight}px` }}
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
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Terminal</span>
            <span className="text-[9px] px-1 rounded-full bg-slate-800 text-slate-400 font-mono">
              {tabs.length}
            </span>
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
            {isDebugging && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
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
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 text-slate-400">
          {activeBottomTab === 'terminal' && (
            <>
              <button
                onClick={() => addTab('powershell', rootPath || '')}
                title="New PowerShell Terminal"
                className="px-1.5 py-0.5 hover:text-white hover:bg-nexcode-800 rounded text-[10px] flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>PowerShell</span>
              </button>
              <button
                onClick={() => addTab('cmd', rootPath || '')}
                title="New Command Prompt"
                className="px-1.5 py-0.5 hover:text-white hover:bg-nexcode-800 rounded text-[10px] flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>CMD</span>
              </button>
              {activeTerm && (
                <button
                  onClick={() => clearTerminal(activeTerm.id)}
                  title="Clear Terminal Output"
                  className="p-1 hover:text-white hover:bg-nexcode-800 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}

          {activeBottomTab === 'debug' && (
            <button
              onClick={clearConsole}
              title="Clear Debug Console"
              className="p-1 hover:text-white hover:bg-nexcode-800 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
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
        <div className="flex-1 flex flex-col font-mono text-xs overflow-hidden bg-nexcode-950">
          {/* Terminal Tabs Selector */}
          <div className="h-6 px-2 bg-nexcode-900 border-b border-nexcode-800 flex items-center space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTermId(tab.id)}
                className={`flex items-center space-x-1.5 px-2 py-0.5 rounded cursor-pointer text-[10px] transition-colors ${
                  tab.id === activeTermId
                    ? 'bg-nexcode-950 text-indigo-300 font-semibold border border-nexcode-750'
                    : 'text-slate-400 hover:bg-nexcode-850 hover:text-slate-200'
                }`}
              >
                <span>{tab.name}</span>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className="p-0.5 hover:text-rose-400 rounded"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Terminal Output history */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 text-slate-300 font-mono text-[11px] leading-relaxed select-text">
            {activeTerm?.output.map((line, idx) => (
              <div key={idx} className="whitespace-pre-wrap break-all">
                {line}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Terminal Command Input Form */}
          <form
            onSubmit={handleRunCommand}
            className="flex items-center space-x-2 px-2 py-1.5 border-t border-nexcode-850 bg-nexcode-900/60"
          >
            <span className="text-indigo-400 font-bold flex items-center text-[11px] truncate max-w-[260px]">
              {activeTerm?.shell === 'cmd' ? 'CMD' : 'PS'} {rootPath || 'C:\\NEXCODE-AI'}&gt;
            </span>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Run shell command, script, or executable..."
              className="flex-1 bg-transparent text-slate-100 focus:outline-none text-xs font-mono"
            />
          </form>
        </div>
      )}

      {/* Tab: Debug Console Content */}
      {activeBottomTab === 'debug' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-nexcode-950">
          {/* Debugger Controls Bar */}
          <div className="h-7 px-3 bg-nexcode-900 border-b border-nexcode-800 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              {!isDebugging ? (
                <button
                  onClick={() => startDebugging(activeTab?.fileName || 'index.ts')}
                  className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center space-x-1 text-[10px] transition-colors"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start (F5)</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={isPaused ? resumeDebugging : pauseDebugging}
                    className="p-1 rounded bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                    title={isPaused ? 'Continue (F5)' : 'Pause (F6)'}
                  >
                    {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={stepOver}
                    className="p-1 rounded bg-nexcode-800 hover:bg-nexcode-700 text-slate-200 transition-colors"
                    title="Step Over (F10)"
                  >
                    <StepForward className="w-3 h-3" />
                  </button>
                  <button
                    onClick={stepInto}
                    className="p-1 rounded bg-nexcode-800 hover:bg-nexcode-700 text-slate-200 transition-colors"
                    title="Step Into (F11)"
                  >
                    <CornerDownRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={stepOut}
                    className="p-1 rounded bg-nexcode-800 hover:bg-nexcode-700 text-slate-200 transition-colors"
                    title="Step Out (Shift+F11)"
                  >
                    <CornerUpLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={stopDebugging}
                    className="p-1 rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                    title="Stop Debugging (Shift+F5)"
                  >
                    <Square className="w-3 h-3 fill-current" />
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono">
              <span>Target: {currentFile || activeTab?.fileName || 'None'}</span>
              {currentLine && (
                <span className="text-amber-400 font-semibold">Line: {currentLine}</span>
              )}
              <span>Breakpoints: {breakpoints.length}</span>
            </div>
          </div>

          {/* Split Debugger Area: Variables & Stack (Left) + Console REPL (Right) */}
          <div className="flex-1 flex overflow-hidden">
            {/* Inspector Left Column */}
            <div className="w-64 border-r border-nexcode-800 bg-nexcode-900/40 flex flex-col overflow-y-auto p-2 space-y-3">
              {/* Variables */}
              <div className="space-y-1">
                <span className="font-semibold text-slate-400 uppercase text-[9px] tracking-wider">
                  Variables
                </span>
                <div className="space-y-0.5 text-[11px] font-mono">
                  {variables.length === 0 ? (
                    <span className="text-slate-500 italic text-[10px]">No active scope</span>
                  ) : (
                    variables.map((v) => (
                      <div key={v.name} className="flex items-center justify-between py-0.5">
                        <span className="text-indigo-300 truncate">{v.name}:</span>
                        <span className="text-emerald-400 truncate max-w-[120px]">{v.value}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Call Stack */}
              <div className="space-y-1">
                <span className="font-semibold text-slate-400 uppercase text-[9px] tracking-wider">
                  Call Stack
                </span>
                <div className="space-y-0.5 text-[10px] font-mono">
                  {callStack.length === 0 ? (
                    <span className="text-slate-500 italic">Not running</span>
                  ) : (
                    callStack.map((f) => (
                      <div key={f.id} className="text-slate-300 truncate">
                        ▶ {f.name} ({f.file}:{f.line})
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Breakpoints */}
              <div className="space-y-1">
                <span className="font-semibold text-slate-400 uppercase text-[9px] tracking-wider">
                  Breakpoints ({breakpoints.length})
                </span>
                <div className="space-y-0.5 text-[10px] font-mono">
                  {breakpoints.length === 0 ? (
                    <span className="text-slate-500 italic">No breakpoints</span>
                  ) : (
                    breakpoints.map((b, idx) => (
                      <div key={idx} className="flex items-center space-x-1 text-slate-300">
                        <CircleDot className="w-3 h-3 text-rose-500 fill-rose-500" />
                        <span>{b.file}:{b.line}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Debug Console Logs & REPL (Right) */}
            <div className="flex-1 flex flex-col overflow-hidden bg-nexcode-950">
              <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-[11px] select-text">
                {consoleLogs.map((log) => {
                  let color = 'text-slate-300';
                  if (log.type === 'input') color = 'text-indigo-400 font-semibold';
                  if (log.type === 'result') color = 'text-emerald-300';
                  if (log.type === 'error') color = 'text-rose-400';
                  return (
                    <div key={log.id} className={`whitespace-pre-wrap ${color}`}>
                      {log.type === 'input' && '▶ '}
                      {log.text}
                    </div>
                  );
                })}
                <div ref={debugEndRef} />
              </div>

              {/* REPL Evaluation Input */}
              <form
                onSubmit={handleDebugSubmit}
                className="flex items-center space-x-2 px-2 py-1.5 border-t border-nexcode-850 bg-nexcode-900/60"
              >
                <span className="text-indigo-400 font-bold text-xs">&gt;</span>
                <input
                  type="text"
                  value={debugExpr}
                  onChange={(e) => setDebugExpr(e.target.value)}
                  placeholder="Evaluate expression in debugger context (e.g. 2 + 2, activeLine)..."
                  className="flex-1 bg-transparent text-slate-100 focus:outline-none text-xs font-mono"
                />
              </form>
            </div>
          </div>
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
        <div className="flex-1 p-3 font-mono text-xs text-slate-400 overflow-y-auto space-y-1">
          <div>[NEXCODE-Main] Application started in local runtime environment.</div>
          <div>[NEXCODE-Terminal] Windows PowerShell & CMD processes registered.</div>
          <div>[NEXCODE-Debugger] Breakpoint manager and inspection host loaded.</div>
          <div>[NEXCODE-AI] Local Engine connected at http://localhost:11434.</div>
        </div>
      )}
    </div>
  );
};
