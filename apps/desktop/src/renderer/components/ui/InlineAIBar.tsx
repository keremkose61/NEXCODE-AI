import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Check,
  X,
  RefreshCw,
  Zap,
  Code2,
  FileQuestion,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useEditorStore } from '../../stores/useEditorStore';
import { useAIStore } from '../../stores/useAIStore';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { AIAssistantMode } from '@nexcode/shared';

export const InlineAIBar: React.FC = () => {
  const { isInlineAIOpen, inlineAIContext, closeInlineAI } = useUIStore();
  const { openTabs, activeTabId, applyCodeReplacement } = useEditorStore();
  const { selectedModel, isOllamaRunning } = useAIStore();
  const { addNotification } = useNotificationStore();

  const [prompt, setPrompt] = useState('');
  const [selectedMode, setSelectedMode] = useState<AIAssistantMode>('fix');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTab = openTabs.find((t) => t.id === activeTabId);

  useEffect(() => {
    if (isInlineAIOpen) {
      setPrompt('');
      setGeneratedOutput(null);
      setIsGenerating(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isInlineAIOpen]);

  if (!isInlineAIOpen) return null;

  const handleGenerate = async (mode: AIAssistantMode = selectedMode) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGeneratedOutput(null);

    const codeSelection = inlineAIContext?.text || activeTab?.content || '';
    const userPrompt = prompt.trim() || `Analyze and transform according to ${mode}`;

    try {
      if (window.nexcode) {
        const res = await window.nexcode.ai.sendChat({
          model: selectedModel,
          mode: mode,
          messages: [
            {
              role: 'user',
              content: `File: ${activeTab?.fileName || 'untitled'}\nLanguage: ${activeTab?.language || 'typescript'}\n\nSelected Code:\n\`\`\`\n${codeSelection}\n\`\`\`\n\nInstruction: ${userPrompt}`
            }
          ],
          temperature: 0.1
        });

        if (res.success && res.data?.message?.content) {
          let output = res.data.message.content;
          // If code is wrapped in markdown code fence, extract clean code for insertion
          const codeFenceMatch = output.match(/```(?:\w+)?\n([\s\S]*?)```/);
          if (codeFenceMatch && (mode === 'fix' || mode === 'optimize' || mode === 'generate' || mode === 'convert')) {
            output = codeFenceMatch[1];
          }
          setGeneratedOutput(output);
          setIsGenerating(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Inline AI error:', err);
    }

    // Fallback simulation when model is offline
    const simulatedResponse = `// Refactored with NEXCODE AI (${mode})
export async function optimizedHandler() {
  // ${userPrompt}
  return Promise.resolve({ success: true, processedAt: Date.now() });
}`;
    setGeneratedOutput(simulatedResponse);
    setIsGenerating(false);
  };

  const handleAccept = () => {
    if (!generatedOutput) return;
    applyCodeReplacement(generatedOutput, inlineAIContext?.range);
    addNotification({
      type: 'success',
      title: 'AI Edit Applied',
      message: 'Code modifications applied to active file.'
    });
    closeInlineAI();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (e.ctrlKey && generatedOutput) {
        handleAccept();
      } else {
        handleGenerate();
      }
    } else if (e.key === 'Escape') {
      closeInlineAI();
    }
  };

  const quickModes: { mode: AIAssistantMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'fix', label: 'Edit / Fix', icon: <Sparkles className="w-3 h-3" /> },
    { mode: 'optimize', label: 'Optimize', icon: <Zap className="w-3 h-3" /> },
    { mode: 'testgen', label: 'Gen Tests', icon: <ShieldCheck className="w-3 h-3" /> },
    { mode: 'docgen', label: 'Add Docs', icon: <BookOpen className="w-3 h-3" /> },
    { mode: 'explain', label: 'Explain', icon: <FileQuestion className="w-3 h-3" /> }
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 pointer-events-auto">
      <div className="bg-nexcode-900/95 backdrop-blur-md border border-indigo-500/40 rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs text-slate-200 ring-1 ring-white/10">
        {/* Top Header / Mode Selection Bar */}
        <div className="px-3 py-2 bg-nexcode-950/90 border-b border-nexcode-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1 font-semibold text-indigo-400">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>NEXCODE Inline AI</span>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-[11px] text-slate-400 font-mono">
              {inlineAIContext?.text
                ? `${inlineAIContext.text.split('\n').length} lines selected`
                : activeTab?.fileName || 'Active File'}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            {quickModes.map((item) => (
              <button
                key={item.mode}
                onClick={() => {
                  setSelectedMode(item.mode);
                  handleGenerate(item.mode);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center space-x-1 transition-all ${
                  selectedMode === item.mode
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-nexcode-800 text-slate-400 hover:text-slate-200 hover:bg-nexcode-750'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
            <button
              onClick={closeInlineAI}
              className="p-1 text-slate-400 hover:text-slate-100 hover:bg-nexcode-800 rounded transition-colors ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-2.5 flex items-center space-x-2 bg-nexcode-900">
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Instruct local AI (e.g., 'refactor to async/await', 'add null check', 'convert to Rust')..."
            className="flex-1 bg-nexcode-950 px-3 py-2 rounded-lg border border-nexcode-750 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            {isGenerating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Generate</span>
          </button>
        </div>

        {/* Generated Preview & Action Confirmation */}
        {generatedOutput && (
          <div className="border-t border-nexcode-800/80 bg-nexcode-950 p-3 space-y-2 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-indigo-300 flex items-center space-x-1">
                <Code2 className="w-3.5 h-3.5" />
                <span>AI Proposed Change</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Model: {selectedModel} {isOllamaRunning ? '(Local Active)' : '(Simulated)'}
              </span>
            </div>

            <pre className="p-2.5 rounded-lg bg-nexcode-900 border border-nexcode-800 font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed select-text">
              {generatedOutput}
            </pre>

            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                onClick={closeInlineAI}
                className="px-3 py-1.5 rounded-lg bg-nexcode-800 hover:bg-nexcode-750 text-slate-300 font-medium transition-colors text-[11px]"
              >
                Discard (Esc)
              </button>
              <button
                onClick={handleAccept}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center space-x-1.5 transition-colors shadow-md text-[11px]"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept & Replace (Ctrl+Enter)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
