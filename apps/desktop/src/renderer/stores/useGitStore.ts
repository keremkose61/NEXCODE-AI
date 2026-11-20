import { create } from 'zustand';
import { GitFileStatus, GitStatusResult, GitBranchInfo } from '@nexcode/shared';

const getAPI = () => (typeof window !== 'undefined' ? window.nexcode : undefined);

export interface DiffModalState {
  isOpen: boolean;
  filePath: string;
  original: string;
  modified: string;
}

interface GitState {
  isRepo: boolean;
  branch: string;
  branches: string[];
  files: GitFileStatus[];
  ahead: number;
  behind: number;
  isLoading: boolean;
  diffModal: DiffModalState;

  fetchStatus: () => Promise<void>;
  fetchBranches: () => Promise<void>;
  stageFile: (filePath: string) => Promise<void>;
  stageAll: () => Promise<void>;
  unstageFile: (filePath: string) => Promise<void>;
  commit: (message: string) => Promise<{ success: boolean; hash?: string; error?: string }>;
  checkoutBranch: (branch: string, createNew?: boolean) => Promise<{ success: boolean; error?: string }>;
  openDiff: (filePath: string, staged?: boolean) => Promise<void>;
  closeDiff: () => void;
  pull: () => Promise<{ success: boolean; output: string }>;
  push: (userConfirmed: boolean) => Promise<{ success: boolean; output: string; error?: string }>;
}

export const useGitStore = create<GitState>((set, get) => ({
  isRepo: false,
  branch: 'master',
  branches: ['master'],
  files: [],
  ahead: 0,
  behind: 0,
  isLoading: false,
  diffModal: {
    isOpen: false,
    filePath: '',
    original: '',
    modified: ''
  },

  fetchStatus: async () => {
    const api = getAPI();
    if (!api) return;
    set({ isLoading: true });
    try {
      const status: GitStatusResult = await api.git.getStatus();
      set({
        isRepo: status.isRepo,
        branch: status.branch || 'master',
        files: status.files || [],
        ahead: status.ahead || 0,
        behind: status.behind || 0,
        isLoading: false
      });
      await get().fetchBranches();
    } catch (err) {
      console.warn('Git status check error:', err);
      set({ isLoading: false });
    }
  },

  fetchBranches: async () => {
    const api = getAPI();
    if (!api) return;
    try {
      const info: GitBranchInfo = await api.git.getBranches();
      if (info && info.all) {
        set({ branches: info.all, branch: info.current || get().branch });
      }
    } catch (err) {
      console.warn('Fetch branches error:', err);
    }
  },

  stageFile: async (filePath) => {
    const api = getAPI();
    if (api) {
      await api.git.stageFile(filePath);
      await get().fetchStatus();
    }
  },

  stageAll: async () => {
    const api = getAPI();
    if (api) {
      await api.git.stageAll();
      await get().fetchStatus();
    }
  },

  unstageFile: async (filePath) => {
    const api = getAPI();
    if (api) {
      await api.git.unstageFile(filePath);
      await get().fetchStatus();
    }
  },

  commit: async (message) => {
    const api = getAPI();
    if (!api) return { success: false, error: 'No runtime API available' };

    const res = await api.git.commit(message);
    if (res.success) {
      await get().fetchStatus();
    }
    return res;
  },

  checkoutBranch: async (branch, createNew = false) => {
    const api = getAPI();
    if (!api) return { success: false, error: 'No runtime API available' };

    const res = await api.git.checkoutBranch(branch, createNew);
    if (res.success) {
      await get().fetchStatus();
    }
    return res;
  },

  openDiff: async (filePath, staged = false) => {
    const api = getAPI();
    if (api) {
      const diff = await api.git.getDiff(filePath, staged);
      set({
        diffModal: {
          isOpen: true,
          filePath,
          original: diff.original,
          modified: diff.modified
        }
      });
    } else {
      set({
        diffModal: {
          isOpen: true,
          filePath,
          original: '// Previous commit version\nfunction example() {\n  return 1;\n}',
          modified: '// Modified working tree version\nfunction example() {\n  return 42;\n}'
        }
      });
    }
  },

  closeDiff: () => {
    set((state) => ({
      diffModal: { ...state.diffModal, isOpen: false }
    }));
  },

  pull: async () => {
    const api = getAPI();
    if (!api) return { success: false, output: 'No runtime API available' };
    const res = await api.git.pull();
    await get().fetchStatus();
    return res;
  },

  push: async (userConfirmed) => {
    if (!userConfirmed) {
      return {
        success: false,
        output: '',
        error: 'Safety Rule: Remote push rejected without user explicit approval.'
      };
    }
    const api = getAPI();
    if (!api) return { success: false, output: '', error: 'No runtime API available' };
    const res = await api.git.push(userConfirmed);
    await get().fetchStatus();
    return res;
  }
}));
