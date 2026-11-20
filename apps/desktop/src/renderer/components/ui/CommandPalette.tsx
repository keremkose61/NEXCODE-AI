import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  FolderOpen,
  FilePlus,
  Save,
  Terminal,
  Sparkles,
  Settings,
  Trash2,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { useEditorStore } from '../../stores/useEditorStore';
import { useAIStore } from '../../stores/useAIStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useNotificationStore } from '../../stores/useNotificationStore';

interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, closeCommandPalette, toggleLeftSidebar, toggleBottomPanel, toggleRightSidebar, setRightTab } =
    useUIStore();
  const { openFolderDialog } = useProjectStore();
  const { saveCurrentFile, openFile, openTabs } = useEditorStore();
  const { checkLocalAIStatus, clearHistory } = useAIStore();
  const { openSettingsModal } = useSettingsStore();
  const { addNotification } = useNotificationStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'file-new',
      title: 'File: New File',
      category: 'File',
      icon: <FilePlus className="w-4 h-4 text-indigo-400" />,
      shortcut: 'Ctrl+N',
      action: () => {
        openFile({
          path: `untitled-${openTabs.length + 1}.ts`,
          name: `untitled-${openTabs.length + 1}.ts`,
          content: '// New script\n'
        });
        addNotification({ type: 'info', message: 'Created new file tab.' });
      }
    },
    {
      id: 'file-open-folder',
      title: 'File: Open Project Folder',
      category: 'File',
      icon: <FolderOpen className="w-4 h-4 text-amber-400" />,
      shortcut: 'Ctrl+O',
      action: () => openFolderDialog()
    },
    {
      id: 'file-recent-projects',
      title: 'File: Open Recent Projects...',
      category: 'File',
      icon: <FolderOpen className="w-4 h-4 text-indigo-400" />,
      shortcut: 'Ctrl+R',
      action: () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', ctrlKey: true }));
      }
    },
    {
      id: 'file-save',
      title: 'File: Save Current File',
      category: 'File',
      icon: <Save className="w-4 h-4 text-emerald-400" />,
      shortcut: 'Ctrl+S',
      action: async () => {
        await saveCurrentFile();
        addNotification({ type: 'success', message: 'File saved successfully.' });
      }
    },
    {
      id: 'view-toggle-left',
      title: 'View: Toggle Primary Side Bar (Explorer)',
      category: 'View',
      icon: <FolderOpen className="w-4 h-4 text-indigo-400" />,
      shortcut: 'Ctrl+B',
      action: () => toggleLeftSidebar()
    },
    {
      id: 'view-toggle-terminal',
      title: 'View: Toggle Bottom Panel (Terminal)',
      category: 'View',
      icon: <Terminal className="w-4 h-4 text-indigo-400" />,
      shortcut: 'Ctrl+J',
      action: () => toggleBottomPanel()
    },
    {
      id: 'view-toggle-ai',
      title: 'View: Toggle AI Assistant Panel',
      category: 'View',
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
      shortcut: 'Ctrl+L',
      action: () => toggleRightSidebar()
    },
    {
      id: 'ai-check-status',
      title: 'AI: Probe Local Ollama Connection & Hardware',
      category: 'AI Engine',
      icon: <Cpu className="w-4 h-4 text-emerald-400" />,
      action: async () => {
        await checkLocalAIStatus();
        addNotification({ type: 'info', title: 'Local AI Probe', message: 'Checked localhost:11434 Ollama status.' });
      }
    },
    {
      id: 'ai-clear-history',
      title: 'AI: Clear Conversation History',
      category: 'AI Engine',
      icon: <Trash2 className="w-4 h-4 text-rose-400" />,
      action: () => {
        clearHistory();
        addNotification({ type: 'info', message: 'AI chat history cleared.' });
      }
    },
    {
      id: 'preferences-settings',
      title: 'Preferences: Open IDE Settings',
      category: 'Preferences',
      icon: <Settings className="w-4 h-4 text-slate-400" />,
      shortcut: 'Ctrl+,',
      action: () => openSettingsModal()
    },
    {
      id: 'help-shortcuts',
      title: 'Help: Keyboard Shortcuts & Documentation',
      category: 'Help',
      icon: <HelpCircle className="w-4 h-4 text-sky-400" />,
      action: () => {
        addNotification({
          type: 'info',
          title: 'NEXCODE AI Shortcuts',
          message: 'Ctrl+Shift+P: Command Palette | Ctrl+P: Quick Open | Ctrl+S: Save | Ctrl+B: Toggle Sidebar | Ctrl+J: Terminal | Ctrl+L: AI Panel'
        });
      }
    }
  ];

  const filtered = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isCommandPaletteOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeCommandPalette();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        closeCommandPalette();
      }
    }
  };

  return (
    <div
      onClick={closeCommandPalette}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-nexcode-900 border border-nexcode-750 rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs"
      >
        {/* Input Header */}
        <div className="flex items-center px-3 py-2.5 border-b border-nexcode-800 bg-nexcode-950">
          <Search className="w-4 h-4 text-indigo-400 mr-2 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-xs"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-nexcode-850 text-slate-400 text-[10px] border border-nexcode-750">
            Esc
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
          {filtered.length > 0 ? (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    closeCommandPalette();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'text-slate-300 hover:bg-nexcode-850'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <span className={isSelected ? 'text-white' : ''}>{cmd.icon}</span>
                    <span className="truncate">{cmd.title}</span>
                  </div>
                  {cmd.shortcut && (
                    <kbd
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isSelected
                          ? 'bg-indigo-700/80 text-indigo-100 border border-indigo-400/40'
                          : 'bg-nexcode-950 text-slate-400 border border-nexcode-800'
                      }`}
                    >
                      {cmd.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-slate-500 text-xs">
              No matching commands found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
