import React from 'react';
import { X, Plus, Circle } from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';

export const EditorTabs: React.FC = () => {
  const { openTabs, activeTabId, setActiveTab, closeTab, openFile } = useEditorStore();

  const handleCreateNew = () => {
    const id = `new-${Date.now()}`;
    openFile({
      path: `untitled-${openTabs.length + 1}.ts`,
      name: `untitled-${openTabs.length + 1}.ts`,
      content: `// New script\nconsole.log("Hello from NEXCODE AI");\n`
    });
  };

  return (
    <div className="h-8 bg-nexcode-950 border-b border-nexcode-800 flex items-center select-none overflow-x-auto text-xs">
      <div className="flex items-center h-full">
        {openTabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-full flex items-center space-x-2 px-3 border-r border-nexcode-800 cursor-pointer transition-colors group relative ${
                isActive
                  ? 'bg-nexcode-900 text-slate-100 font-medium'
                  : 'bg-nexcode-950/70 text-slate-400 hover:bg-nexcode-900 hover:text-slate-200'
              }`}
            >
              {/* Active tab top glowing indicator */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-sm" />
              )}

              <span className="truncate max-w-[150px]">{tab.fileName}</span>

              {/* Dirty indicator or close button */}
              <div className="flex items-center">
                {tab.isDirty && (
                  <Circle className="w-2 h-2 fill-indigo-400 text-indigo-400 mr-1" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="w-4 h-4 rounded flex items-center justify-center opacity-60 group-hover:opacity-100 hover:bg-nexcode-750 text-slate-400 hover:text-white transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plus tab button */}
      <button
        onClick={handleCreateNew}
        title="New File (Ctrl+N)"
        className="h-full px-2.5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-nexcode-900 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
