import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  Cpu,
  RefreshCw,
  Terminal,
  Shield,
  Layers,
  ChevronRight,
  Bot,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useUIStore, RightPanelTab } from '../../stores/useUIStore';
import { useAIStore } from '../../stores/useAIStore';
import { useEditorStore } from '../../stores/useEditorStore';

export const RightPanel: React.FC = () => {
  const { rightSidebarOpen, activeRightTab, setRightTab, toggleRightSidebar } = useUIStore();
  const {
    messages,
    sendMessage,
    isThinking,
    selectedModel,
    isOllamaRunning,
    hardware,
    checkLocalAIStatus,
    clearHistory
  } = useAIStore();
  const { openTabs, activeTabId } = useEditorStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeTab = openTabs.find((t) => t.id === activeTabId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  if (!rightSidebarOpen) return null;

  const handleSend = () => {
    if (!input.trim() || isThinking) return;
    sendMessage(input, activeTab?.content);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const promptChips = [
    { label: 'Explain File', icon: '💡', prompt: `Please explain the structure and logic of ${activeTab?.fileName || 'the current code'}.` },
    { label: 'Generate Tests', icon: '🧪', prompt: `Generate comprehensive unit tests for ${activeTab?.fileName || 'this code'}.` },
    { label: 'Optimize Logic', icon: '⚡', prompt: `Analyze and suggest performance optimizations for this file.` },
    { label: 'Security Review', icon: '🛡️', prompt: `Check this code for security vulnerabilities, edge cases, and bounds.` }
  ];

  return (
    <aside className="w-80 bg-nexcode-900 border-l border-nexcode-800 flex flex-col select-none text-xs h-full overflow-hidden z-30">
      {/* Top Header & Tabs */}
      <div className="h-9 px-3 border-b border-nexcode-800 flex items-center justify-between bg-nexcode-950">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setRightTab('chat')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
              activeRightTab === 'chat'
                ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Chat</span>
          </button>
          <button
            onClick={() => setRightTab('agent')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
              activeRightTab === 'agent'
                ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Agent Tasks</span>
          </button>
          <button
            onClick={() => setRightTab('context')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
              activeRightTab === 'context'
                ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Context</span>
          </button>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={clearHistory}
            title="Clear Chat History"
            className="p-1 hover:text-rose-400 hover:bg-nexcode-850 rounded text-slate-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Model & Local Hardware Status Banner */}
      <div className="px-3 py-1.5 bg-nexcode-950/80 border-b border-nexcode-800 flex items-center justify-between text-[10px]">
        <div className="flex items-center space-x-1.5 truncate">
          <span
            className={`w-2 h-2 rounded-full ${
              isOllamaRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="font-mono text-slate-300 font-medium truncate">{selectedModel}</span>
        </div>
        <button
          onClick={checkLocalAIStatus}
          title="Re-check Local Ollama Connection"
          className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 hover:underline"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Sync Status</span>
        </button>
      </div>

      {/* Tab: Chat */}
      {activeRightTab === 'chat' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center space-x-1 text-[10px] text-slate-500 mb-1 px-1">
                  <span>{msg.role === 'user' ? 'You' : 'NEXCODE Local AI'}</span>
                  {msg.model && <span>• {msg.model}</span>}
                </div>

                <div
                  className={`p-3 rounded-xl max-w-[95%] leading-relaxed text-xs break-words shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-nexcode-950 border border-nexcode-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center space-x-2 text-indigo-400 p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Local model is computing response...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Chips */}
          <div className="px-2.5 py-1.5 border-t border-nexcode-800/80 bg-nexcode-950/60 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            {promptChips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => setInput(chip.prompt)}
                className="flex items-center space-x-1 px-2 py-1 rounded-md bg-nexcode-850 hover:bg-nexcode-800 text-slate-300 border border-nexcode-750 text-[10px] whitespace-nowrap transition-colors"
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Chat Input Area */}
          <div className="p-3 border-t border-nexcode-800 bg-nexcode-950">
            <div className="relative rounded-lg border border-nexcode-750 bg-nexcode-900 focus-within:border-indigo-500 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder={
                  isOllamaRunning
                    ? `Ask local ${selectedModel}... (Enter to send)`
                    : 'Ask anything (Ollama offline guide will assist)...'
                }
                className="w-full bg-transparent p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
              />

              <div className="px-2 py-1 border-t border-nexcode-800/50 flex items-center justify-between text-[10px]">
                <div className="flex items-center space-x-1 text-slate-500">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span>100% Local • Zero Telemetry</span>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isThinking}
                  className="p-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Agent Tasks */}
      {activeRightTab === 'agent' && (
        <div className="flex-1 p-3 overflow-y-auto space-y-3">
          <div className="p-2.5 rounded-lg bg-nexcode-950 border border-nexcode-800 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold text-[11px]">
              <Zap className="w-3.5 h-3.5" />
              <span>Autonomous Project Agent</span>
            </div>
            <p className="text-[11px] text-slate-400">
              The Agent breaks goals into multi-stage plans, modifies files, and runs tests with strict safety controls.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
              Safety Guardrails
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Explicit confirmation for file overwrites</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Diff preview before applying changes</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Never run shell commands without consent</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Strict project-boundary file isolation</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Context Viewer */}
      {activeRightTab === 'context' && (
        <div className="flex-1 p-3 overflow-y-auto space-y-3">
          <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
            Active Context Token Window
          </div>
          <div className="p-2.5 rounded-lg bg-nexcode-950 border border-nexcode-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Active Document:</span>
              <span className="font-mono text-indigo-400">{activeTab?.fileName || 'None'}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Tokens Estimate:</span>
              <span className="font-mono text-slate-300">
                {activeTab ? Math.round(activeTab.content.length / 4) : 0} tokens
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Memory Engine:</span>
              <span className="font-mono text-emerald-400">SQLite Vector DB</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
