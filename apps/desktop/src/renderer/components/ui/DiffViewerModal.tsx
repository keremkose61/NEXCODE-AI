import React, { useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { X, GitCommit, Check, Sparkles, AlertCircle } from 'lucide-react';
import { useGitStore } from '../../stores/useGitStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { detectLanguageFromPath } from '@nexcode/editor';

export const DiffViewerModal: React.FC = () => {
  const { diffModal, closeDiff } = useGitStore();
  const { settings } = useSettingsStore();

  const isLight = settings.theme === 'nova-light';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && diffModal.isOpen) {
        closeDiff();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [diffModal.isOpen, closeDiff]);

  if (!diffModal.isOpen) return null;

  const language = detectLanguageFromPath(diffModal.filePath);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-150">
      <div
        className={`border rounded-2xl shadow-2xl flex flex-col w-full max-w-5xl h-[85vh] overflow-hidden ${
          isLight
            ? 'bg-white border-slate-200'
            : 'bg-[#0d111b] border-[#1c2438] shadow-[0_0_30px_rgba(0,0,0,0.8)]'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`h-11 px-4 border-b flex items-center justify-between text-xs ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-700'
              : 'bg-[#080a10] border-[#1c2438] text-slate-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {diffModal.onApply ? (
              <Sparkles className="w-4 h-4 text-cyan-400" />
            ) : (
              <GitCommit className="w-4 h-4 text-purple-400" />
            )}
            <span className="font-bold text-slate-100">
              {diffModal.onApply ? 'AI Kod Değişikliği Diff Önizlemesi:' : 'Görsel Diff:'}
            </span>
            <span className="font-mono text-cyan-400 font-semibold">{diffModal.filePath}</span>
            <span className="text-[10px] text-slate-400">
              {diffModal.onApply ? '• Onayınız olmadan dosya güncellenmez' : '• (HEAD vs Çalışma Ağacı)'}
            </span>
          </div>

          <button
            onClick={closeDiff}
            className="p-1 hover:bg-slate-700/30 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Kapat (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Monaco DiffEditor */}
        <div className="flex-1 w-full h-full overflow-hidden relative">
          <DiffEditor
            height="100%"
            width="100%"
            original={diffModal.original}
            modified={diffModal.modified}
            language={language}
            theme={settings.theme || 'nova-dark'}
            options={{
              readOnly: true,
              renderSideBySide: true,
              automaticLayout: true,
              fontSize: settings.fontSize,
              fontFamily: settings.fontFamily,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              renderWhitespace: 'selection',
              smoothScrolling: true
            }}
          />
        </div>

        {/* Modal Footer */}
        <div
          className={`h-11 px-4 border-t flex items-center justify-between text-[11px] ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-600'
              : 'bg-[#080a10] border-[#1c2438] text-slate-400'
          }`}
        >
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 text-rose-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/30 border border-rose-500/50" />
              <span>Mevcut Dosya (Önceki)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500/50" />
              <span>Yapay Zekâ Önerisi (Yeni)</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={closeDiff}
              className="px-3 py-1.5 rounded-lg border border-slate-700/50 hover:bg-slate-800 text-slate-300 font-medium text-xs transition-colors"
            >
              Vazgeç
            </button>

            {diffModal.onApply && (
              <button
                onClick={() => {
                  diffModal.onApply?.();
                  closeDiff();
                }}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Değişiklikleri Onayla & Uygula</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};