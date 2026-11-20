import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  RefreshCw,
  Shield,
  Layers,
  Bot,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Plus,
  ArrowDownToLine,
  ChevronDown
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useAIStore, ASSISTANT_MODES } from '../../stores/useAIStore';
import { useEditorStore } from '../../stores/useEditorStore';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { AIAssistantMode } from '@nexcode/shared';

export const RightPanel: React.FC = () => {
  const { rightSidebarOpen, activeRightTab, setRightTab, rightPanelWidth } = useUIStore();
  const {
    messages,
    sendMessage,
    isThinking,
    isStreaming,
    selectedModel,
    availableModels,
    isOllamaRunning,
    hardware,
    checkLocalAIStatus,
    clearHistory,
    pullModel,
    sessions,
    currentSessionId,
    activeMode,
    setActiveMode,
    createNewSession,
    switchSession,
    deleteSession
  } = useAIStore();
  const { openTabs, activeTabId, applyCodeReplacement } = useEditorStore();
  const { addNotification } = useNotificationStore();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSessionsDropdown, setShowSessionsDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeTab = openTabs.find((t) => t.id === activeTabId);
  const activeModelMeta = availableModels.find((m) => m.name === selectedModel);
  const currentSession = sessions.find((s) => s.id === currentSessionId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, isStreaming]);

  if (!rightSidebarOpen) return null;

  const handleSend = (overrideMode?: AIAssistantMode) => {
    if (!input.trim() || isThinking) return;
    sendMessage(input, activeTab?.content, overrideMode || activeMode);
    setInput('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addNotification({ type: 'info', message: 'Copied message to clipboard.' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsertCode = (code: string) => {
    applyCodeReplacement(code);
    addNotification({
      type: 'success',
      title: 'Inserted Code',
      message: 'Code block inserted into active editor file.'
    });
  };

  const handlePullModel = async () => {
    addNotification({
      type: 'info',
      title: 'Download Initiated',
      message: `Requesting ${selectedModel} download via Ollama...`
    });
    const res = await pullModel(selectedModel);
    if (res) {
      addNotification({ type: 'success', message: `Pulling ${selectedModel} in background.` });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const extractCodeBlock = (content: string): string | null => {
    const match = content.match(/```(?:\w+)?\n([\s\S]*?)```/);
    return match ? match[1] : null;
  };

  return (
    <aside
      style={{ width: `${rightPanelWidth}px` }}
      className="bg-nexcode-900 border-l border-nexcode-800 flex flex-col select-none text-xs h-full overflow-hidden z-30 flex-shrink-0"
    >
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
            <span>AI Assistant</span>
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
            onClick={() => createNewSession()}
            title="Start New Chat Session"
            className="p-1 hover:text-indigo-300 hover:bg-nexcode-850 rounded text-slate-400 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={clearHistory}
            title="Clear Current Session History"
            className="p-1 hover:text-rose-400 hover:bg-nexcode-850 rounded text-slate-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Session Selector & Ollama Connection Bar */}
      <div className="px-3 py-1.5 bg-nexcode-950/80 border-b border-nexcode-800 flex items-center justify-between text-[10px] relative">
        <div className="flex items-center space-x-1.5 truncate max-w-[60%]">
          <button
            onClick={() => setShowSessionsDropdown(!showSessionsDropdown)}
            className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-nexcode-850 hover:bg-nexcode-800 text-slate-300 border border-nexcode-750 truncate transition-colors"
            title="Switch Session"
          >
            <span className="truncate max-w-[110px]">{currentSession?.title || 'Session'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
          </button>

          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              isOllamaRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'
            }`}
            title={isOllamaRunning ? 'Local Ollama Connected' : 'Local Ollama Offline'}
          />
          <span className="font-mono text-slate-400 truncate">{selectedModel}</span>
        </div>

        <div className="flex items-center space-x-1">
          {activeModelMeta && !activeModelMeta.isAvailableLocally && (
            <button
              onClick={handlePullModel}
              title="Download Model into Ollama"
              className="flex items-center space-x-0.5 px-1.5 py-0.5 rounded bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
            >
              <Download className="w-2.5 h-2.5" />
              <span>Pull</span>
            </button>
          )}
          <button
            onClick={checkLocalAIStatus}
            title="Re-check Local Ollama Connection"
            className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 hover:underline"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sync</span>
          </button>
        </div>

        {/* Sessions Dropdown Menu */}
        {showSessionsDropdown && (
          <div className="absolute top-8 left-3 z-50 w-64 bg-nexcode-900 border border-nexcode-750 rounded-lg shadow-xl p-1.5 space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-semibold text-slate-400 border-b border-nexcode-800">
              <span>Saved Chat Sessions ({sessions.length})</span>
              <button
                onClick={() => {
                  createNewSession();
                  setShowSessionsDropdown(false);
                }}
                className="text-indigo-400 hover:text-indigo-300 flex items-center space-x-0.5"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>New</span>
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors ${
                    s.id === currentSessionId
                      ? 'bg-indigo-600/30 text-indigo-200'
                      : 'hover:bg-nexcode-800 text-slate-300'
                  }`}
                  onClick={() => {
                    switchSession(s.id);
                    setShowSessionsDropdown(false);
                  }}
                >
                  <span className="truncate text-[11px]">{s.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(s.id);
                    }}
                    className="p-0.5 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete session"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mode Selector Chips Bar (12 Modes) */}
      <div className="px-2 py-1.5 border-b border-nexcode-800 bg-nexcode-950 flex items-center space-x-1 overflow-x-auto no-scrollbar">
        {ASSISTANT_MODES.map((item) => (
          <button
            key={item.mode}
            onClick={() => setActiveMode(item.mode)}
            title={item.description}
            className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center space-x-1 whitespace-nowrap transition-all ${
              activeMode === item.mode
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-nexcode-850 text-slate-400 hover:text-slate-200 hover:bg-nexcode-800'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Chat */}
      {activeRightTab === 'chat' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
            {messages.map((msg) => {
              const codeBlock = extractCodeBlock(msg.content);
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 mb-1 px-1">
                    <span>{msg.role === 'user' ? 'You' : 'NEXCODE Local AI'}</span>
                    {msg.mode && (
                      <span className="text-indigo-400 uppercase font-mono text-[9px] bg-indigo-500/10 px-1 py-0.2 rounded">
                        {msg.mode}
                      </span>
                    )}
                    {msg.model && <span>• {msg.model}</span>}
                    {msg.latencyMs !== undefined && (
                      <span className="text-emerald-400 font-mono">⚡ {msg.latencyMs}ms</span>
                    )}
                    {msg.tokens !== undefined && (
                      <span className="text-slate-400 font-mono">({msg.tokens} tokens)</span>
                    )}
                  </div>

                  <div
                    className={`p-3 rounded-xl max-w-[95%] leading-relaxed text-xs break-words shadow-sm relative group ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-nexcode-950 border border-nexcode-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">
                      {msg.content}
                      {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-3.5 bg-indigo-400 ml-1 animate-pulse align-middle" />
                      )}
                    </div>

                    {msg.role === 'assistant' && msg.content && !msg.isStreaming && (
                      <div className="flex items-center space-x-1 mt-2 pt-1 border-t border-nexcode-800/60 justify-end">
                        {codeBlock && (
                          <button
                            onClick={() => handleInsertCode(codeBlock)}
                            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors text-[10px]"
                            title="Insert into active file"
                          >
                            <ArrowDownToLine className="w-3 h-3" />
                            <span>Insert</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="flex items-center space-x-1 px-2 py-0.5 rounded bg-nexcode-850 hover:bg-nexcode-750 text-slate-400 hover:text-white transition-colors text-[10px]"
                          title="Copy Message"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Copy</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isThinking && (
              <div className="flex items-center space-x-2 text-indigo-400 p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Local model ({selectedModel}) is computing response...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Context & Mode Indicator */}
          <div className="px-2.5 py-1 border-t border-nexcode-800 bg-nexcode-950/80 flex items-center justify-between text-[10px] text-slate-400">
            <span className="truncate">
              Target: <strong className="text-slate-200">{activeTab?.fileName || 'No open file'}</strong>
            </span>
            <span className="text-indigo-400 font-medium">Mode: {activeMode}</span>
          </div>

          {/* Chat Input Area */}
          <div className="p-3 border-t border-nexcode-800 bg-nexcode-950">
            <div className="relative rounded-lg border border-nexcode-750 bg-nexcode-900 focus-within:border-indigo-500 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder={`Instruct ${activeMode} on ${activeTab?.fileName || 'code'}... (Enter to send)`}
                className="w-full bg-transparent p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
              />

              <div className="px-2 py-1 border-t border-nexcode-800/50 flex items-center justify-between text-[10px]">
                <div className="flex items-center space-x-1 text-slate-500">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span>100% Local • Zero Cloud Telemetry</span>
                </div>
                <button
                  onClick={() => handleSend()}
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
              <span className="font-mono text-emerald-400">SQLite Store + Vector Index</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
