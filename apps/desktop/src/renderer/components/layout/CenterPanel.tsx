import React from 'react';
import { ChevronRight, SplitSquareVertical, Code, Sparkles, Folder } from 'lucide-react';
import { EditorTabs } from '../editor/EditorTabs';
import { MonacoWrapper } from '../editor/MonacoWrapper';
import { useEditorStore } from '../../stores/useEditorStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { useSettingsStore } from '../../stores/useSettingsStore';

export const CenterPanel: React.FC = () => {
  const { openTabs, activeTabId } = useEditorStore();
  const { projectName } = useProjectStore();
  const { settings } = useSettingsStore();

  const isLight = settings.theme === 'nova-light';
  const activeTab = openTabs.find((t) => t.id === activeTabId);

  return (
    <main
      className={`flex-1 flex flex-col h-full overflow-hidden min-w-0 transition-colors ${
        isLight ? 'bg-white' : 'bg-[#080a10]'
      }`}
    >
      {/* Editör Sekmeleri */}
      <EditorTabs />

      {/* Gezinme Yolu (Breadcrumbs Bar) */}
      {activeTab && (
        <div
          className={`h-6 border-b px-3 flex items-center justify-between text-[11px] select-none transition-colors ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-600'
              : 'bg-[#0c0f18] border-[#1c2438] text-slate-400'
          }`}
        >
          <div className="flex items-center space-x-1.5 truncate">
            <span className="flex items-center gap-1 font-medium text-slate-400">
              <Folder className="w-3 h-3 text-amber-400" />
              {projectName || 'Workspace'}
            </span>
            <ChevronRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span className="text-cyan-400 font-mono flex items-center gap-1">
              <Code className="w-3 h-3" />
              {activeTab.fileName}
            </span>
            {activeTab.isDirty && (
              <span className="text-[10px] text-amber-400 italic">(Kaydedilmemiş Değişiklik)</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {activeTab.language}
            </span>
            <button
              title="Editörü Böl"
              className="p-1 hover:text-white hover:bg-slate-700/30 rounded transition-colors"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Monaco Kod Editörü */}
      <div className="flex-1 relative overflow-hidden">
        <MonacoWrapper />
      </div>
    </main>
  );
};