import React from 'react';
import { ChevronRight, SplitSquareVertical, Code, Sparkles } from 'lucide-react';
import { EditorTabs } from '../editor/EditorTabs';
import { MonacoWrapper } from '../editor/MonacoWrapper';
import { useEditorStore } from '../../stores/useEditorStore';
import { useProjectStore } from '../../stores/useProjectStore';

export const CenterPanel: React.FC = () => {
  const { openTabs, activeTabId } = useEditorStore();
  const { projectName } = useProjectStore();

  const activeTab = openTabs.find((t) => t.id === activeTabId);

  return (
    <main className="flex-1 flex flex-col h-full bg-nexcode-950 overflow-hidden min-w-0">
      {/* Editor Tabs */}
      <EditorTabs />

      {/* Breadcrumb Navigation Bar */}
      {activeTab && (
        <div className="h-6 bg-nexcode-900/60 border-b border-nexcode-800/80 px-3 flex items-center justify-between text-[11px] text-slate-400 select-none">
          <div className="flex items-center space-x-1.5 truncate">
            <span className="text-slate-300 font-medium">{projectName}</span>
            <ChevronRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span className="text-indigo-400 font-mono flex items-center gap-1">
              <Code className="w-3 h-3" />
              {activeTab.fileName}
            </span>
            {activeTab.isDirty && (
              <span className="text-[10px] text-amber-400 italic">(Unsaved Changes)</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {activeTab.language}
            </span>
            <button
              title="Split Editor"
              className="p-1 hover:text-white hover:bg-nexcode-800 rounded transition-colors"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Monaco Code Editor */}
      <div className="flex-1 relative overflow-hidden">
        <MonacoWrapper />
      </div>
    </main>
  );
};
