import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, FileNode, RecentProject, IDESettings } from '@nexcode/shared';

const nexcodeAPI = {
  window: {
    minimize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
    maximize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
    close: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),
    isMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_IS_MAXIMIZED)
  },
  app: {
    getInfo: () => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_INFO),
    getHardwareInfo: () => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_HARDWARE_INFO)
  },
  fs: {
    openFolderDialog: (): Promise<string | null> => ipcRenderer.invoke(IPC_CHANNELS.FS_OPEN_FOLDER_DIALOG),
    readDir: (dirPath?: string): Promise<FileNode[]> => ipcRenderer.invoke(IPC_CHANNELS.FS_READ_DIR, dirPath),
    readFile: (filePath: string): Promise<{ success: boolean; content?: string; error?: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.FS_READ_FILE, filePath),
    writeFile: (filePath: string, content: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.FS_WRITE_FILE, filePath, content),
    createFile: (filePath: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.FS_CREATE_FILE, filePath),
    createDir: (dirPath: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.FS_CREATE_DIR, dirPath),
    deleteItem: (itemPath: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.FS_DELETE_ITEM, itemPath),
    renameItem: (oldPath: string, newPath: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.FS_RENAME_ITEM, oldPath, newPath),
    watchStart: (dirPath: string): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.FS_WATCH_START, dirPath),
    watchStop: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.FS_WATCH_STOP),
    onFileChanged: (callback: (payload: { eventType: string; filename: string; rootPath: string }) => void) => {
      const subscription = (_: any, data: any) => callback(data);
      ipcRenderer.on(IPC_CHANNELS.FS_FILE_CHANGED, subscription);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.FS_FILE_CHANGED, subscription);
    }
  },
  ai: {
    checkStatus: () => ipcRenderer.invoke(IPC_CHANNELS.AI_CHECK_STATUS),
    listModels: () => ipcRenderer.invoke(IPC_CHANNELS.AI_LIST_MODELS),
    sendChat: (payload: any) => ipcRenderer.invoke(IPC_CHANNELS.AI_SEND_CHAT, payload),
    pullModel: (modelName: string) => ipcRenderer.invoke(IPC_CHANNELS.AI_PULL_MODEL, modelName)
  },
  db: {
    getRecentProjects: (): Promise<RecentProject[]> => ipcRenderer.invoke(IPC_CHANNELS.DB_GET_RECENT_PROJECTS),
    addRecentProject: (name: string, projectPath: string): Promise<RecentProject> =>
      ipcRenderer.invoke(IPC_CHANNELS.DB_ADD_RECENT_PROJECT, name, projectPath),
    getSettings: (): Promise<IDESettings> => ipcRenderer.invoke(IPC_CHANNELS.DB_GET_SETTINGS),
    saveSettings: (settings: Partial<IDESettings>): Promise<IDESettings> =>
      ipcRenderer.invoke(IPC_CHANNELS.DB_SAVE_SETTINGS, settings)
  }
};

contextBridge.exposeInMainWorld('nexcode', nexcodeAPI);

export type NexcodeAPI = typeof nexcodeAPI;
