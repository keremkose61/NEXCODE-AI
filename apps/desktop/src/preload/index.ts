import { contextBridge, ipcRenderer } from 'electron';
import {
  IPC_CHANNELS,
  FileNode,
  RecentProject,
  IDESettings,
  AIChatSession,
  AIChatMessage,
  AgentTask,
  AgentAuditLog
} from '@nexcode/shared';

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
  agent: {
    planTask: (goal: string): Promise<AgentTask> => ipcRenderer.invoke(IPC_CHANNELS.AGENT_PLAN_TASK, goal),
    approveAction: (action: any): Promise<{ success: boolean; log?: AgentAuditLog; error?: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.AGENT_APPROVE_ACTION, action),
    revertAction: (logId: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.AGENT_REVERT_ACTION, logId),
    getAuditLogs: (): Promise<AgentAuditLog[]> => ipcRenderer.invoke(IPC_CHANNELS.AGENT_GET_AUDIT_LOGS)
  },
  db: {
    getRecentProjects: (): Promise<RecentProject[]> => ipcRenderer.invoke(IPC_CHANNELS.DB_GET_RECENT_PROJECTS),
    addRecentProject: (name: string, projectPath: string): Promise<RecentProject> =>
      ipcRenderer.invoke(IPC_CHANNELS.DB_ADD_RECENT_PROJECT, name, projectPath),
    getSettings: (): Promise<IDESettings> => ipcRenderer.invoke(IPC_CHANNELS.DB_GET_SETTINGS),
    saveSettings: (settings: Partial<IDESettings>): Promise<IDESettings> =>
      ipcRenderer.invoke(IPC_CHANNELS.DB_SAVE_SETTINGS, settings),
    getChatSessions: (): Promise<AIChatSession[]> => ipcRenderer.invoke(IPC_CHANNELS.DB_GET_CHAT_SESSIONS),
    createChatSession: (title: string, model: string): Promise<AIChatSession> =>
      ipcRenderer.invoke(IPC_CHANNELS.DB_CREATE_CHAT_SESSION, title, model),
    deleteChatSession: (sessionId: string): Promise<boolean> =>
      ipcRenderer.invoke(IPC_CHANNELS.DB_DELETE_CHAT_SESSION, sessionId),
    getChatMessages: (sessionId: string): Promise<AIChatMessage[]> =>
      ipcRenderer.invoke(IPC_CHANNELS.DB_GET_CHAT_MESSAGES, sessionId),
    saveChatMessage: (sessionId: string, message: AIChatMessage): Promise<AIChatMessage> =>
      ipcRenderer.invoke(IPC_CHANNELS.DB_SAVE_CHAT_MESSAGE, sessionId, message),
    clearChatSession: (sessionId: string): Promise<boolean> =>
      ipcRenderer.invoke(IPC_CHANNELS.DB_CLEAR_CHAT_SESSION, sessionId)
  }
};

contextBridge.exposeInMainWorld('nexcode', nexcodeAPI);

export type NexcodeAPI = typeof nexcodeAPI;
