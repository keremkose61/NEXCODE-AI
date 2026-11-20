import { create } from 'zustand';
import { OpenTab } from '@nexcode/shared';
import { detectLanguageFromPath } from '@nexcode/editor';

interface EditorState {
  openTabs: OpenTab[];
  activeTabId: string | null;
  cursorPosition: { line: number; column: number };
  openFile: (file: { path: string; name: string; content: string }) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateContent: (tabId: string, newContent: string) => void;
  setCursorPosition: (line: number, column: number) => void;
  saveCurrentFile: () => Promise<void>;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  openTabs: [
    {
      id: 'welcome-tab',
      filePath: 'welcome.ts',
      fileName: 'welcome.ts',
      content: `// ==========================================
// NEXCODE AI – Professional Local Desktop IDE
// Slogan: Code Smarter. Build Beyond.
// ==========================================

import { createLocalAI } from '@nexcode/ai-engine';

interface IDEConfig {
  name: string;
  engine: 'Ollama' | 'PyTorch' | 'Local';
  privacy: '100% Offline' | 'Zero Cloud Telemetry';
  acceleration: 'AMD ROCm' | 'NVIDIA CUDA' | 'CPU';
}

const nexcodeConfig: IDEConfig = {
  name: 'NEXCODE AI',
  engine: 'Local',
  privacy: '100% Offline',
  acceleration: 'CPU'
};

export async function bootstrap() {
  console.log("Welcome to NEXCODE AI:", nexcodeConfig.name);
  console.log("Local intelligence pipeline initialized.");
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
      // Memory file save
      set((state) => ({
        openTabs: state.openTabs.map((t) =>
          t.id === activeTabId ? { ...t, isDirty: false, originalContent: t.content } : t
        )
      }));
    }
  }
}));
