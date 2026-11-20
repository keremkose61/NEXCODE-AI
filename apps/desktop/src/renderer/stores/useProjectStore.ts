import { create } from 'zustand';
import { FileNode } from '@nexcode/shared';

interface ProjectState {
  rootPath: string | null;
  projectName: string;
  files: FileNode[];
  isLoading: boolean;
  openFolderDialog: () => Promise<void>;
  loadProjectDirectory: (dirPath: string) => Promise<void>;
  refreshFiles: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  rootPath: null,
  projectName: 'NEXCODE Workspace',
  files: [],
  isLoading: false,

  openFolderDialog: async () => {
    if (!window.nexcode) return;
    set({ isLoading: true });
    try {
      const selected = await window.nexcode.fs.openFolderDialog();
      if (selected) {
        await get().loadProjectDirectory(selected);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  loadProjectDirectory: async (dirPath: string) => {
    if (!window.nexcode) return;
    set({ isLoading: true });
    try {
      const files = await window.nexcode.fs.readDir(dirPath);
      const name = dirPath.split(/[\\/]/).pop() || 'Project';
      set({
        rootPath: dirPath,
        projectName: name,
        files
      });
    } catch (err) {
      console.error('Failed to load project directory:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  refreshFiles: async () => {
    const { rootPath } = get();
    if (!rootPath || !window.nexcode) return;
    try {
      const files = await window.nexcode.fs.readDir(rootPath);
      set({ files });
    } catch (err) {
      console.error('Failed to refresh files:', err);
    }
  }
}));
