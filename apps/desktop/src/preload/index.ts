import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, FileNode } from '@nexcode/shared';

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
      ipcRenderer.invoke(IPC_CHANNELS.FS_RENAME_ITEM, oldPath, newPath)
  },
  ai: {
    checkStatus: () => ipcRenderer.invoke(IPC_CHANNELS.AI_CHECK_STATUS)
  }
};

contextBridge.exposeInMainWorld('nexcode', nexcodeAPI);

export type NexcodeAPI = typeof nexcodeAPI;
