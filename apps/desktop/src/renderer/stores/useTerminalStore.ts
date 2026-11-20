import { create } from 'zustand';

const getAPI = () => (typeof window !== 'undefined' ? window.nexcode : undefined);

export interface TerminalTabItem {
  id: string;
  name: string;
  shell: 'powershell' | 'cmd';
  cwd: string;
  output: string[];
}

interface TerminalState {
  tabs: TerminalTabItem[];
  activeTabId: string;
  history: string[];

  addTab: (shell?: 'powershell' | 'cmd', cwd?: string) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  sendCommand: (tabId: string, cmd: string) => void;
  clearTerminal: (tabId: string) => void;
  appendOutput: (tabId: string, text: string) => void;
  initTerminalListener: () => () => void;
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  tabs: [
    {
      id: 'term-default',
      name: 'PowerShell',
      shell: 'powershell',
      cwd: '',
      output: [
        'Windows PowerShell',
        'Copyright (C) Microsoft Corporation. All rights reserved.',
        '',
        'NEXCODE AI Terminal ready. Enter PowerShell commands below.'
      ]
    }
  ],
  activeTabId: 'term-default',
  history: [],

  addTab: (shell = 'powershell', cwd = '') => {
    const id = `term-${Date.now()}`;
    const name = `${shell === 'cmd' ? 'Command Prompt' : 'PowerShell'} (${get().tabs.length + 1})`;
    const newTab: TerminalTabItem = {
      id,
      name,
      shell,
      cwd,
      output: [`${shell === 'cmd' ? 'Command Prompt' : 'PowerShell'} Session Initialized.`]
    };

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: id
    }));

    const api = getAPI();
    if (api) {
      api.terminal.spawn(id, shell, cwd);
    }
  },

  closeTab: (tabId: string) => {
    const api = getAPI();
    if (api) {
      api.terminal.close(tabId);
    }

    set((state) => {
      const remaining = state.tabs.filter((t) => t.id !== tabId);
      let nextId = state.activeTabId;
      if (state.activeTabId === tabId) {
        nextId = remaining.length > 0 ? remaining[remaining.length - 1].id : '';
      }
      return {
        tabs: remaining,
        activeTabId: nextId
      };
    });
  },

  setActiveTab: (tabId: string) => set({ activeTabId: tabId }),

  sendCommand: (tabId: string, cmd: string) => {
    if (!cmd.trim()) return;

    set((state) => ({
      history: [...state.history, cmd],
      tabs: state.tabs.map((t) => {
        if (t.id === tabId) {
          return {
            ...t,
            output: [...t.output, `> ${cmd}`]
          };
        }
        return t;
      })
    }));

    const api = getAPI();
    if (api) {
      api.terminal.writeInput(tabId, `${cmd}\r\n`);
    } else {
      // Offline fallback echo
      setTimeout(() => {
        get().appendOutput(tabId, `[Simulated Shell] Executed: ${cmd}`);
      }, 50);
    }
  },

  clearTerminal: (tabId: string) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, output: [] } : t))
    }));
  },

  appendOutput: (tabId: string, text: string) => {
    set((state) => ({
      tabs: state.tabs.map((t) => {
        if (t.id === tabId) {
          const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
          return {
            ...t,
            output: [...t.output, ...lines]
          };
        }
        return t;
      })
    }));
  },

  initTerminalListener: () => {
    const api = getAPI();
    if (!api) return () => {};

    // Spawn default terminal on startup
    const firstTab = get().tabs[0];
    if (firstTab) {
      api.terminal.spawn(firstTab.id, firstTab.shell, firstTab.cwd);
    }

    const cleanup = api.terminal.onOutput(({ tabId, data }) => {
      get().appendOutput(tabId, data);
    });

    return cleanup;
  }
}));
