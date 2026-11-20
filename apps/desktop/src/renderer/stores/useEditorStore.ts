import { create } from 'zustand';
import { OpenTab } from '@nexcode/shared';
import { detectLanguageFromPath } from '@nexcode/editor';

export interface EditorRange {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

interface EditorState {
  openTabs: OpenTab[];
  activeTabId: string | null;
  cursorPosition: { line: number; column: number };
  openFile: (file: { path: string; name: string; content: string }) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  reorderTabs: (sourceIndex: number, targetIndex: number) => void;
  updateContent: (tabId: string, newContent: string) => void;
  setCursorPosition: (line: number, column: number) => void;
  saveCurrentFile: () => Promise<void>;
  applyCodeReplacement: (replacement: string, range?: EditorRange) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  openTabs: [
    {
      id: 'welcome-tab',
      filePath: 'welcome.ts',
      fileName: 'welcome.ts',
      content: `// ==========================================
// NOVA IDE – Professional AI-Powered Windows IDE
// Designed for speed, privacy & deep local intelligence.
// ==========================================

import { createLocalAI } from '@nova/ai-engine';

interface IDEConfig {
  name: string;
  theme: 'nova-dark' | 'nova-light';
  engine: 'Ollama' | 'PyTorch' | 'Local';
  privacy: '100% Offline' | 'Zero Cloud Telemetry';
  acceleration: 'AMD ROCm' | 'NVIDIA CUDA' | 'CPU Safe';
}

const novaConfig: IDEConfig = {
  name: 'NOVA IDE',
  theme: 'nova-dark',
  engine: 'Ollama',
  privacy: '100% Offline',
  acceleration: 'CPU Safe'
};

export async function bootstrap() {
  console.log("Welcome to NOVA IDE:", novaConfig.name);
  console.log("Local intelligence pipeline ready.");
}
`,
      originalContent: '',
      isDirty: false,
      language: 'typescript'
    }
  ],
  activeTabId: 'welcome-tab',
  cursorPosition: { line: 1, column: 1 },

  openFile: ({ path, name, content }) => {
    const existing = get().openTabs.find((t) => t.filePath === path);
    if (existing) {
      set({ activeTabId: existing.id });
      return;
    }

    const newTab: OpenTab = {
      id: `tab-${Date.now()}`,
      filePath: path,
      fileName: name,
      content,
      originalContent: content,
      isDirty: false,
      language: detectLanguageFromPath(path)
    };

    set((state) => ({
      openTabs: [...state.openTabs, newTab],
      activeTabId: newTab.id
    }));
  },

  closeTab: (tabId: string) => {
    set((state) => {
      const remaining = state.openTabs.filter((t) => t.id !== tabId);
      let nextActiveId = state.activeTabId;

      if (state.activeTabId === tabId) {
        if (remaining.length > 0) {
          nextActiveId = remaining[remaining.length - 1].id;
        } else {
          nextActiveId = null;
        }
      }

      return {
        openTabs: remaining,
        activeTabId: nextActiveId
      };
    });
  },

  setActiveTab: (tabId: string) => set({ activeTabId: tabId }),

  reorderTabs: (sourceIndex: number, targetIndex: number) => {
    set((state) => {
      const newTabs = [...state.openTabs];
      const [moved] = newTabs.splice(sourceIndex, 1);
      newTabs.splice(targetIndex, 0, moved);
      return { openTabs: newTabs };
    });
  },

  updateContent: (tabId: string, newContent: string) => {
    set((state) => ({
      openTabs: state.openTabs.map((tab) => {
        if (tab.id === tabId) {
          return {
            ...tab,
            content: newContent,
            isDirty: newContent !== tab.originalContent
          };
        }
        return tab;
      })
    }));
  },

  setCursorPosition: (line: number, column: number) => {
    set({ cursorPosition: { line, column } });
  },

  saveCurrentFile: async () => {
    const { activeTabId, openTabs } = get();
    const activeTab = openTabs.find((t) => t.id === activeTabId);
    if (!activeTab || !activeTab.isDirty) return;

    if (window.nexcode && activeTab.filePath && !activeTab.filePath.startsWith('welcome')) {
      const res = await window.nexcode.fs.writeFile(activeTab.filePath, activeTab.content);
      if (res.success) {
        set((state) => ({
          openTabs: state.openTabs.map((t) =>
            t.id === activeTabId ? { ...t, isDirty: false, originalContent: t.content } : t
          )
        }));
      }
    } else {
      set((state) => ({
        openTabs: state.openTabs.map((t) =>
          t.id === activeTabId ? { ...t, isDirty: false, originalContent: t.content } : t
        )
      }));
    }
  },

  applyCodeReplacement: (replacement: string, range?: EditorRange) => {
    const { activeTabId, openTabs } = get();
    const activeTab = openTabs.find((t) => t.id === activeTabId);
    if (!activeTab) return;

    if (!range) {
      // Append or replace
      get().updateContent(activeTab.id, replacement);
      return;
    }

    const lines = activeTab.content.split('\n');
    const startLineIdx = range.startLineNumber - 1;
    const endLineIdx = range.endLineNumber - 1;

    if (startLineIdx >= 0 && endLineIdx < lines.length) {
      const before = lines[startLineIdx].substring(0, range.startColumn - 1);
      const after = lines[endLineIdx].substring(range.endColumn - 1);
      const newBlock = before + replacement + after;

      const newLines = [
        ...lines.slice(0, startLineIdx),
        ...newBlock.split('\n'),
        ...lines.slice(endLineIdx + 1)
      ];

      get().updateContent(activeTab.id, newLines.join('\n'));
    } else {
      get().updateContent(activeTab.id, replacement);
    }
  }
}));
