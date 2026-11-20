import React, { useState } from 'react';
import { X, Plus, Circle, FileCode, FileText, Palette, Database, Terminal, File } from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';
import { useSettingsStore } from '../../stores/useSettingsStore';

export const EditorTabs: React.FC = () => {
  const { openTabs, activeTabId, setActiveTab, closeTab, openFile, reorderTabs } = useEditorStore();
  const { settings } = useSettingsStore();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const isLight = settings.theme === 'nova-light';

  const handleCreateNew = () => {
    const id = `new-${Date.now().toString().slice(-4)}`;
    const fname = `untitled-${openTabs.length + 1}.ts`;
    openFile({
      path: fname,
      name: fname,
      content: `// Yeni NOVA IDE komut dosyası\nconsole.log("NOVA IDE local coding session started.");\n`
    });
  };

  const getTabIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return <FileCode className="w-3.5 h-3.5 text-cyan-400" />;
      case 'js':
      case 'jsx':
        return <FileCode className="w-3.5 h-3.5 text-amber-300" />;
      case 'py':
        return <FileCode className="w-3.5 h-3.5 text-yellow-400" />;
      case 'rs':
        return <FileCode className="w-3.5 h-3.5 text-orange-400" />;
      case 'css':
      case 'scss':
        return <Palette className="w-3.5 h-3.5 text-pink-400" />;
      case 'json':
      case 'yaml':
      case 'yml':
        return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
      case 'sql':
      case 'db':
        return <Database className="w-3.5 h-3.5 text-purple-400" />;
      case 'sh':
      case 'ps1':
        return <Terminal className="w-3.5 h-3.5 text-teal-400" />;
      default:
        return <File className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div
      className={`h-9 border-b flex items-center select-none overflow-x-auto text-xs transition-colors ${
        isLight
          ? 'bg-slate-100 border-slate-200'
          : 'bg-[#080a10] border-[#1c2438]'
      }`}
    >
      <div className="flex items-center h-full">
        {openTabs.map((tab, index) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              draggable
              onDragStart={(e) => {
                setDraggedIndex(index);
                e.dataTransfer.setData('text/plain', String(index));
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const src = draggedIndex;
                if (src !== null && src !== index) {
                  reorderTabs(src, index);
                }
                setDraggedIndex(null);
              }}
              onClick={() => setActiveTab(tab.id)}
              className={`h-full flex items-center space-x-2 px-3 border-r cursor-pointer transition-all group relative ${
                isActive
                  ? isLight
                    ? 'bg-white text-slate-900 font-semibold border-r-slate-200 shadow-xs'
                    : 'bg-[#0f1422] text-slate-100 font-medium border-r-[#1c2438]'
                  : isLight
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 border-r-slate-200'
                  : 'bg-[#080a10] text-slate-400 hover:bg-[#0f1422] hover:text-slate-200 border-r-[#1c2438]'
              }`}
            >
              {/* Active Tab Top Glowing Indicator */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 shadow-[0_0_8px_#06b6d4]" />
              )}

              {/* Tab File Icon */}
              {getTabIcon(tab.fileName)}

              <span className="truncate max-w-[140px]">{tab.fileName}</span>

              {/* Dirty indicator or Close button */}
              <div className="flex items-center ml-1">
                {tab.isDirty && (
                  <Circle className="w-2 h-2 fill-cyan-400 text-cyan-400 mr-1 animate-pulse" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className={`w-4 h-4 rounded flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity ${
                    isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-slate-700/50 text-slate-400 hover:text-white'
                  }`}
                  title="Sekmeyi Kapat"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Yeni Sekme / Dosya Butonu */}
      <button
        onClick={handleCreateNew}
        title="Yeni Dosya Aç (Ctrl+N)"
        className={`h-full px-2.5 flex items-center justify-center transition-colors ${
          isLight
            ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/70'
            : 'text-slate-400 hover:text-white hover:bg-[#0f1422]'
        }`}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};