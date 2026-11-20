import React, { useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { X, GitCommit, FileCode, Check } from 'lucide-react';
import { useGitStore } from '../../stores/useGitStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { detectLanguageFromPath } from '@nexcode/editor';

export const DiffViewerModal: React.FC = () => {
  const { diffModal, closeDiff } = useGitStore();
  const { settings } = useSettingsStore();

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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-150">
      <div className="bg-nexcode-900 border border-nexcode-750 rounded-xl shadow-2xl flex flex-col w-full max-w-5xl h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="h-11 px-4 bg-nexcode-950 border-b border-nexcode-800 flex items-center justify-between text-xs text-slate-200">
          <div className="flex items-center space-x-2">
            <GitCommit className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-100">Visual Diff:</span>
            <span className="font-mono text-indigo-300 font-medium">{diffModal.filePath}</span>
            <span className="text-[10px] text-slate-500">• (HEAD vs Working Tree)</span>
          </div>

          <button
            onClick={closeDiff}
            className="p-1 hover:bg-nexcode-800 text-slate-400 hover:text-white rounded transition-colors"
            title="Close Diff (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Monaco DiffEditor */}
        <div className="flex-1 w-full h-full bg-nexcode-950 overflow-hidden relative">
          <DiffEditor
            height="100%"
            width="100%"
            original={diffModal.original}
            modified={diffModal.modified}
            language={language}
            theme={settings.theme || 'nexcode-dark'}
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
        <div className="h-9 px-4 bg-nexcode-950 border-t border-nexcode-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/30 border border-rose-500/50" />
              <span>Original (HEAD)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500/50" />
              <span>Modified (Working Tree)</span>
            </span>
          </div>

          <button
            onClick={closeDiff}
            className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
