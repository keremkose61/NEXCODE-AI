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
  ChevronDown,
  HardDrive,
  Mic,
  MicOff,
  Image as ImageIcon,
  Database,
  Eye
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useAIStore, ASSISTANT_MODES } from '../../stores/useAIStore';
import { useEditorStore } from '../../stores/useEditorStore';
import { useGitStore } from '../../stores/useGitStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { AgentPanel } from '../ai/AgentPanel';
import { AIAssistantMode } from '@nexcode/shared';

export const RightPanel: React.FC = () => {
  const { rightSidebarOpen, activeRightTab, setRightTab, rightPanelWidth, openModelManager } = useUIStore();
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
  const { showCustomDiff } = useGitStore();
  const { settings } = useSettingsStore();
  const { addNotification } = useNotificationStore();

  const isLight = settings.theme === 'nova-light';

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSessionsDropdown, setShowSessionsDropdown] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [ragStats, setRagStats] = useState<{ filesCount: number; chunksCount: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeTab = openTabs.find((t) => t.id === activeTabId);
  const activeModelMeta = availableModels.find((m) => m.name === selectedModel);
  const currentSession = sessions.find((s) => s.id === currentSessionId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, isStreaming]);

  if (!rightSidebarOpen) return null;

  const toggleVoiceRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addNotification({
        type: 'warning',
        message: 'Speech recognition is not available on this system.'
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'tr-TR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        addNotification({ type: 'info', message: 'Listening for speech input...' });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAttachedImage(base64);
      addNotification({ type: 'info', message: 'UI screenshot attached. Ask AI to generate code!' });
    };
    reader.readAsDataURL(file);
  };

  const handleIndexCodebase = async () => {
    if (!window.nexcode) return;
    addNotification({ type: 'info', message: 'Scanning and indexing workspace codebase...' });
    const res = await window.nexcode.rag.indexProject();
    setRagStats(res);
    addNotification({
      type: 'success',
      title: 'Codebase Indexed',
      message: `Indexed ${res.filesCount} files into ${res.chunksCount} semantic chunks!`
    });
  };

  const handleSend = async (overrideMode?: AIAssistantMode) => {
    if ((!input.trim() && !attachedImage) || isThinking) return;
    const mode = overrideMode || activeMode;
    const requiresCode = [
      'explain',
      'fix',
      'optimize',
      'convert',
      'error_analysis',
      'docgen',
      'testgen',
      'analyze_file'
    ].includes(mode);

    let promptText = input.trim();
    if (attachedImage) {
      promptText = promptText
        ? `[UI Mockup/Screenshot Attached]\nTask: ${promptText}\nConvert this visual interface into clean, responsive Tailwind CSS and React component code.`
        : `[UI Mockup/Screenshot Attached]\nConvert this visual interface design into clean, responsive Tailwind CSS and React component code.`;
    }

    let ragContext: string | undefined = undefined;
    if (mode === 'project_context' && window.nexcode) {
      const chunks = await window.nexcode.rag.queryProject(promptText, 3);
      if (chunks && chunks.length > 0) {
        ragContext = chunks
          .map((c: any) => `// File: ${c.filePath} (lines ${c.lineStart}-${c.lineEnd})\n${c.content}`)
          .join('\n\n');
      }
    }

    sendMessage(
      promptText,
      ragContext || (requiresCode ? activeTab?.content : undefined),
      mode
    );
    setInput('');
    setAttachedImage(null);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addNotification({ type: 'info', message: 'Copied message to clipboard.' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePreviewDiff = (code: string) => {
    const curContent = activeTab?.content || '';
    const fname = activeTab?.fileName || 'untitled.ts';
    showCustomDiff(fname, curContent, code, () => {
      applyCodeReplacement(code);
      addNotification({
        type: 'success',
        title: 'Kod Uygulandı',
        message: `${fname} dosyası başarıyla güncellendi.`
      });
    });
  };

  const handleInsertCode = (code: string) => {
    const ok = window.confirm(
      `Yapay zekâ tarafından üretilen kodu "${activeTab?.fileName || 'aktif dosya'}" üzerine uygulamak istediğinize emin misiniz?`
    );
    if (!ok) return;

    applyCodeReplacement(code);
    addNotification({
      type: 'success',
      title: 'Kod Uygulandı',
      message: `${activeTab?.fileName || 'Aktif dosya'} güncellendi.`
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
      className={`border-l flex flex-col select-none text-xs h-full overflow-hidden z-30 flex-shrink-0 transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-[#0b0e17] border-[#1c2438] text-slate-200'
      }`}
    >
      {/* Üst Başlık ve Sekmeler */}
      <div
        className={`h-9 px-3 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080a10] border-[#1c2438]'
        }`}
      >
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setRightTab('chat')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
              activeRightTab === 'chat'
                ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Asistanı</span>
          </button>
          <button
            onClick={() => setRightTab('agent')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
              activeRightTab === 'agent'
                ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>Ajan Görevleri</span>
          </button>
          <button
            onClick={() => setRightTab('context')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
              activeRightTab === 'context'
                ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>RAG Bellek</span>
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
          <button
            onClick={openModelManager}
            title="Open Local Model Hub (Download & Manage Weights)"
            className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 border border-indigo-500/30 transition-colors"
          >
            <HardDrive className="w-2.5 h-2.5" />
            <span>Hub</span>
          </button>
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
                    className={`p-3 rounded-2xl max-w-[95%] leading-relaxed text-xs break-words shadow-sm relative group ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                        : isLight
                        ? 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                        : 'bg-[#0e1322] border border-[#222c44] hover:border-cyan-500/40 text-slate-200 rounded-bl-none shadow-[0_0_15px_rgba(6,182,212,0.06)]'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">
                      {msg.content}
                      {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-3.5 bg-cyan-400 ml-1 animate-pulse align-middle" />
                      )}
                    </div>

                    {msg.role === 'assistant' && msg.content && !msg.isStreaming && (
                      <div className="flex items-center space-x-1.5 mt-2.5 pt-1.5 border-t border-slate-700/40 justify-end">
                        {codeBlock && (
                          <>
                            <button
                              onClick={() => handlePreviewDiff(codeBlock)}
                              className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-white transition-colors text-[10px] font-semibold border border-purple-500/30 cursor-pointer"
                              title="Değişiklikleri uygulamadan önce görsel diff önizlemesi"
                            >
                              <Eye className="w-3 h-3 text-cyan-400" />
                              <span>Diff Önizlemesi</span>
                            </button>
                            <button
                              onClick={() => handleInsertCode(codeBlock)}
                              className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors text-[10px] font-semibold border border-emerald-500/30 cursor-pointer"
                              title="Editördeki aktif dosyaya onayla ve uygula"
                            >
                              <ArrowDownToLine className="w-3 h-3" />
                              <span>Uygula</span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="flex items-center space-x-1 px-2 py-1 rounded-md bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors text-[10px] cursor-pointer"
                          title="Mesajı Kopyala"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Kopyala</span>
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
            {attachedImage && (
              <div className="mb-2 p-1.5 bg-nexcode-900 border border-indigo-500/40 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <img src={attachedImage} alt="Attachment" className="w-8 h-8 rounded object-cover border border-indigo-500/30" />
                  <span className="text-[11px] text-indigo-300">UI Mockup Attached (Multimodal)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="p-1 hover:text-rose-400 text-slate-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

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
                  <span>100% Local</span>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach UI screenshot / design mockup"
                    className="p-1 hover:text-indigo-400 text-slate-400 rounded transition-colors"
                  >
                    <ImageIcon className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={toggleVoiceRecognition}
                    title={isListening ? 'Stop Listening' : 'Dictate Prompt (Voice)'}
                    className={`p-1 rounded transition-colors ${
                      isListening ? 'text-rose-400 animate-pulse bg-rose-500/20' : 'hover:text-indigo-400 text-slate-400'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                  </button>
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && !attachedImage) || isThinking}
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
      {activeRightTab === 'agent' && <AgentPanel />}

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

          {/* Local Codebase RAG Card */}
          <div className="p-3 rounded-lg bg-nexcode-950 border border-nexcode-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>Codebase Semantic RAG</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% Offline
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Indexes multi-file codebase into semantic chunks for context-aware queries.
            </p>
            {ragStats && (
              <div className="p-2 rounded bg-nexcode-900 border border-nexcode-800 text-[11px] text-indigo-300 font-mono">
                Indexed: {ragStats.filesCount} files • {ragStats.chunksCount} chunks
              </div>
            )}
            <button
              type="button"
              onClick={handleIndexCodebase}
              className="w-full py-1.5 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 font-medium text-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{ragStats ? 'Re-index Codebase' : 'Index Workspace Now'}</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
