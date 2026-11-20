import { create } from 'zustand';
import { FileNode, RecentProject } from '@nexcode/shared';

interface ProjectState {
  rootPath: string | null;
  projectName: string;
  files: FileNode[];
  isLoading: boolean;
  recentProjects: RecentProject[];
  isConfirmDeleteOpen: boolean;
  itemToDelete: { path: string; name: string; isDirectory: boolean } | null;
  isRenameOpen: boolean;
  itemToRename: { path: string; name: string } | null;

  openFolderDialog: () => Promise<void>;
  loadProjectDirectory: (dirPath: string) => Promise<void>;
  refreshFiles: () => Promise<void>;
  loadRecentProjects: () => Promise<void>;
  createNewProject: (parentDir: string, name: string) => Promise<string | null>;
  createFile: (filePath: string) => Promise<boolean>;
  createFolder: (folderPath: string) => Promise<boolean>;
  promptDelete: (item: { path: string; name: string; isDirectory: boolean }) => void;
  confirmDelete: () => Promise<boolean>;
  cancelDelete: () => void;
  promptRename: (item: { path: string; name: string }) => void;
  confirmRename: (newName: string) => Promise<boolean>;
  cancelRename: () => void;
  initFileWatcher: () => () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  rootPath: null,
  projectName: 'NEXCODE Workspace',
  files: [],
  isLoading: false,
  recentProjects: [],
  isConfirmDeleteOpen: false,
  itemToDelete: null,
  isRenameOpen: false,
  itemToRename: null,

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
      await window.nexcode.fs.watchStart(dirPath);
      await get().loadRecentProjects();
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
  },

  loadRecentProjects: async () => {
    if (!window.nexcode) return;
    try {
      const recents = await window.nexcode.db.getRecentProjects();
      set({ recentProjects: recents || [] });
    } catch (err) {
      console.warn('Failed to load recent projects:', err);
    }
  },

  createNewProject: async (parentDir: string, name: string) => {
    if (!window.nexcode) return null;
    try {
      const projectPath = `${parentDir}\\${name}`;
      await window.nexcode.fs.createDir(projectPath);

      // Create initial README and package.json / main.ts template
      await window.nexcode.fs.createFile(`${projectPath}\\README.md`);
      await window.nexcode.fs.writeFile(
        `${projectPath}\\README.md`,
        `# ${name}\n\nCreated with NEXCODE AI.\nCode Smarter. Build Beyond.\n`
      );
      await window.nexcode.fs.createFile(`${projectPath}\\main.ts`);
      await window.nexcode.fs.writeFile(
        `${projectPath}\\main.ts`,
        `console.log("Hello from ${name}!");\n`
      );

      await get().loadProjectDirectory(projectPath);
      return projectPath;
    } catch (err) {
      console.error('Failed to create new project:', err);
      return null;
    }
  },

  createFile: async (filePath: string) => {
    if (!window.nexcode) return false;
    try {
      const res = await window.nexcode.fs.createFile(filePath);
      if (res.success) {
        await get().refreshFiles();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  createFolder: async (folderPath: string) => {
    if (!window.nexcode) return false;
    try {
      const res = await window.nexcode.fs.createDir(folderPath);
      if (res.success) {
        await get().refreshFiles();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  promptDelete: (item) => set({ isConfirmDeleteOpen: true, itemToDelete: item }),

  confirmDelete: async () => {
    const { itemToDelete } = get();
    if (!itemToDelete || !window.nexcode) return false;
    try {
      const res = await window.nexcode.fs.deleteItem(itemToDelete.path);
      if (res.success) {
        await get().refreshFiles();
        set({ isConfirmDeleteOpen: false, itemToDelete: null });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  cancelDelete: () => set({ isConfirmDeleteOpen: false, itemToDelete: null }),

  promptRename: (item) => set({ isRenameOpen: true, itemToRename: item }),

  confirmRename: async (newName: string) => {
    const { itemToRename } = get();
    if (!itemToRename || !newName.trim() || !window.nexcode) return false;
    try {
      const dir = itemToRename.path.substring(0, itemToRename.path.lastIndexOf('\\'));
      const newPath = `${dir}\\${newName.trim()}`;
      const res = await window.nexcode.fs.renameItem(itemToRename.path, newPath);
      if (res.success) {
        await get().refreshFiles();
        set({ isRenameOpen: false, itemToRename: null });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  cancelRename: () => set({ isRenameOpen: false, itemToRename: null }),

  initFileWatcher: () => {
    if (!window.nexcode) return () => {};
    const cleanup = window.nexcode.fs.onFileChanged(() => {
      get().refreshFiles();
    });
    return cleanup;
  }
}));
