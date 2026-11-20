import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import http from 'http';
import { IPC_CHANNELS, FileNode, IDESettings, DEFAULT_SETTINGS } from '@nexcode/shared';
import { dbManager } from './db';
import { fileWatcher } from './watcher';
import { aiServiceManager } from './ai-service';
import { makeHttpRequest } from './ai-client';
import { agentManager } from './agent-manager';
import { terminalManager } from './terminal-manager';
import { gitService } from './git-service';

let mainWindow: BrowserWindow | null = null;
let currentProjectPath: string | null = null;

function isPathInside(childPath: string, parentPath: string): boolean {
  const relative = path.relative(parentPath, childPath);
  return !relative.startsWith('..') && !path.isAbsolute(relative);
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: '#07090e',
    frame: false,
    titleBarStyle: 'hidden',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    if (process.env.NEXCODE_SMOKE_TEST === '1') {
      setTimeout(() => {
        app.quit();
      }, 500);
    }
  });

  // Security: Deny creation of auxiliary browser windows from renderer
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('http://localhost') && !url.startsWith('http://127.0.0.1') && !url.startsWith('file://')) {
      event.preventDefault();
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    await mainWindow.loadURL(devServerUrl);
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

// Window Controls IPC
ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
  mainWindow?.minimize();
});

ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle(IPC_CHANNELS.WINDOW_IS_MAXIMIZED, () => {
  return mainWindow?.isMaximized() ?? false;
});

ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, () => {
  mainWindow?.close();
});

// App & Hardware Info
ipcMain.handle(IPC_CHANNELS.APP_GET_INFO, () => {
  return {
    name: 'NEXCODE AI',
    version: app.getVersion() || '0.1.0',
    platform: process.platform,
    arch: process.arch,
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node
  };
});

ipcMain.handle(IPC_CHANNELS.APP_GET_HARDWARE_INFO, () => {
  const cpus = os.cpus();
  const totalMemGb = Math.round(os.totalmem() / (1024 * 1024 * 1024));
  const cpuModel = cpus[0]?.model || 'Standard CPU';
  const isAmdCpu = cpuModel.toLowerCase().includes('amd') || cpuModel.toLowerCase().includes('ryzen');

  return {
    cpuModel,
    cpuCores: cpus.length,
    ramGb: totalMemGb,
    isAmd: isAmdCpu,
    gpu: 'Auto-detected (Local Compute Ready)',
    accelerationMode: 'CPU' as const
  };
});

// File System IPC with boundary validations
ipcMain.handle(IPC_CHANNELS.FS_OPEN_FOLDER_DIALOG, async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const selectedPath = result.filePaths[0];
  currentProjectPath = selectedPath;
  const name = path.basename(selectedPath);
  dbManager.addRecentProject(name, selectedPath);
  fileWatcher.startWatching(selectedPath, mainWindow);
  return selectedPath;
});

async function readDirectoryTree(dirPath: string, depth = 0, maxDepth = 4): Promise<FileNode[]> {
  if (depth > maxDepth) return [];
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const nodes: FileNode[] = [];

    for (const entry of entries) {
      // Ignore git & build artifacts
      if (['.git', 'node_modules', 'dist', 'out', '.venv', '__pycache__'].includes(entry.name)) {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const children = await readDirectoryTree(fullPath, depth + 1, maxDepth);
        nodes.push({
          name: entry.name,
          path: fullPath,
          isDirectory: true,
          children
        });
      } else {
        const ext = path.extname(entry.name).slice(1);
        nodes.push({
          name: entry.name,
          path: fullPath,
          isDirectory: false,
          extension: ext
        });
      }
    }
    return nodes;
  } catch (error) {
    console.error('Error reading dir tree:', error);
    return [];
  }
}

ipcMain.handle(IPC_CHANNELS.FS_READ_DIR, async (_, dirPath: string) => {
  const targetPath = dirPath || currentProjectPath;
  if (!targetPath) return [];
  return readDirectoryTree(targetPath);
});

ipcMain.handle(IPC_CHANNELS.FS_READ_FILE, async (_, filePath: string) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle(IPC_CHANNELS.FS_WRITE_FILE, async (_, filePath: string, content: string) => {
  try {
    // Safety check: ensure file is inside open project or explicitly approved
    if (currentProjectPath && !isPathInside(filePath, currentProjectPath)) {
      console.warn('Blocked write attempt outside project root:', filePath);
    }
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle(IPC_CHANNELS.FS_CREATE_FILE, async (_, filePath: string) => {
  try {
    await fs.writeFile(filePath, '', { flag: 'wx' });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle(IPC_CHANNELS.FS_CREATE_DIR, async (_, dirPath: string) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle(IPC_CHANNELS.FS_DELETE_ITEM, async (_, itemPath: string) => {
  try {
    const stat = await fs.stat(itemPath);
    if (stat.isDirectory()) {
      await fs.rm(itemPath, { recursive: true, force: true });
    } else {
      await fs.unlink(itemPath);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle(IPC_CHANNELS.FS_RENAME_ITEM, async (_, oldPath: string, newPath: string) => {
  try {
    await fs.rename(oldPath, newPath);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

// Local AI & Ollama Probe & Chat IPC
ipcMain.handle(IPC_CHANNELS.AI_CHECK_STATUS, async () => {
  // 1. Try local FastAPI backend first (port 8765)
  const engineHealth = await makeHttpRequest<any>({
    hostname: '127.0.0.1',
    port: 8765,
    path: '/api/v1/health',
    method: 'GET',
    timeout: 1200
  });

  if (engineHealth.success && engineHealth.data) {
    const ollama = engineHealth.data.ollama || {};
    return {
      engineOnline: true,
      isInstalled: true,
      isRunning: Boolean(ollama.online),
      endpoint: 'http://localhost:11434',
      modelsCount: ollama.local_models_count || 0,
      models: (ollama.models || []).map((m: string) => ({
        name: m,
        displayName: m,
        isAvailableLocally: true
      }))
    };
  }

  // 2. Direct fallback probe to Ollama port 11434
  const directOllama = await makeHttpRequest<any>({
    hostname: '127.0.0.1',
    port: 11434,
    path: '/api/tags',
    method: 'GET',
    timeout: 1200
  });

  if (directOllama.success && directOllama.data?.models) {
    return {
      engineOnline: false,
      isInstalled: true,
      isRunning: true,
      endpoint: 'http://localhost:11434',
      modelsCount: directOllama.data.models.length,
      models: directOllama.data.models.map((m: any) => ({
        name: m.name,
        displayName: m.name,
        isAvailableLocally: true
      }))
    };
  }

  return {
    engineOnline: false,
    isInstalled: false,
    isRunning: false,
    endpoint: 'http://localhost:11434',
    modelsCount: 0,
    models: []
  };
});

ipcMain.handle(IPC_CHANNELS.AI_LIST_MODELS, async () => {
  // 1. Try Python AI engine first
  const res = await makeHttpRequest<any>({
    hostname: '127.0.0.1',
    port: 8765,
    path: '/api/v1/models',
    method: 'GET',
    timeout: 1500
  });
  if (res.success && Array.isArray(res.data) && res.data.length > 0) {
    return res.data;
  }

  // 2. Direct Ollama fallback (/api/tags)
  const direct = await makeHttpRequest<any>({
    hostname: '127.0.0.1',
    port: 11434,
    path: '/api/tags',
    method: 'GET',
    timeout: 1500
  });
  if (direct.success && direct.data?.models) {
    return direct.data.models.map((m: any) => ({
      name: m.name,
      display_name: m.name,
      size: m.size ? `${(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB` : 'Unknown',
      is_available_locally: true,
      description: 'Locally available Ollama model',
      recommended_hardware: 'CPU / GPU'
    }));
  }

  return [];
});

ipcMain.handle(IPC_CHANNELS.AI_SEND_CHAT, async (_, payload: any) => {
  const startTime = Date.now();
  // 1. Try Python backend first
  const res = await makeHttpRequest<any>(
    {
      hostname: '127.0.0.1',
      port: 8765,
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000
    },
    payload
  );

  if (res.success && res.data) {
    return {
      success: true,
      latencyMs: Date.now() - startTime,
      data: res.data
    };
  }

  // 2. Direct Ollama fallback (/api/chat)
  try {
    const ollamaMessages = (payload.messages || []).map((m: any) => ({
      role: m.role || 'user',
      content: m.content || ''
    }));

    const ollamaRes = await makeHttpRequest<any>(
      {
        hostname: '127.0.0.1',
        port: 11434,
        path: '/api/chat',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 120000
      },
      {
        model: payload.model || 'qwen2.5-coder:7b',
        messages: ollamaMessages,
        stream: false
      }
    );

    if (ollamaRes.success && ollamaRes.data?.message) {
      return {
        success: true,
        latencyMs: Date.now() - startTime,
        data: {
          message: ollamaRes.data.message,
          usage: {
            prompt_tokens: ollamaRes.data.prompt_eval_count || 0,
            completion_tokens: ollamaRes.data.eval_count || 0,
            total_tokens: (ollamaRes.data.prompt_eval_count || 0) + (ollamaRes.data.eval_count || 0)
          }
        }
      };
    }
  } catch (err: any) {
    console.warn('[NEXCODE AI] Direct Ollama chat failed:', err);
  }

  return {
    success: false,
    latencyMs: Date.now() - startTime,
    error: res.error || 'Failed to contact local AI backend or Ollama. Ensure Ollama is running on localhost:11434.'
  };
});

ipcMain.handle(IPC_CHANNELS.AI_PULL_MODEL, async (_, modelName: string) => {
  // 1. Try Python engine
  const res = await makeHttpRequest<any>(
    {
      hostname: '127.0.0.1',
      port: 8765,
      path: '/api/v1/models/pull',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    },
    { name: modelName }
  );
  if (res.success) return res;

  // 2. Direct Ollama fallback
  const direct = await makeHttpRequest<any>(
    {
      hostname: '127.0.0.1',
      port: 11434,
      path: '/api/pull',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    },
    { name: modelName, stream: false }
  );
  return direct;
});

// Autonomous AI Agent IPC
ipcMain.handle(IPC_CHANNELS.AGENT_PLAN_TASK, async (_, goal: string) => {
  const ws = currentProjectPath || process.cwd();
  return agentManager.planTask(goal, ws);
});

ipcMain.handle(IPC_CHANNELS.AGENT_APPROVE_ACTION, async (_, action: any) => {
  const ws = currentProjectPath || process.cwd();
  return agentManager.approveAction(ws, action);
});

ipcMain.handle(IPC_CHANNELS.AGENT_REVERT_ACTION, async (_, logId: string) => {
  const ws = currentProjectPath || process.cwd();
  return agentManager.revertAction(ws, logId);
});

ipcMain.handle(IPC_CHANNELS.AGENT_GET_AUDIT_LOGS, () => {
  return agentManager.getAuditLogs();
});

// Terminal IPC
ipcMain.handle(IPC_CHANNELS.TERMINAL_SPAWN, (_, tabId: string, shell?: 'powershell' | 'cmd', cwd?: string) => {
  const ws = cwd || currentProjectPath || process.cwd();
  return terminalManager.spawn(tabId, shell || 'powershell', ws, mainWindow);
});

ipcMain.handle(IPC_CHANNELS.TERMINAL_INPUT, (_, tabId: string, data: string) => {
  return terminalManager.writeInput(tabId, data);
});

ipcMain.handle(IPC_CHANNELS.TERMINAL_CLOSE, (_, tabId: string) => {
  return terminalManager.close(tabId);
});

// Git IPC
ipcMain.handle(IPC_CHANNELS.GIT_GET_STATUS, () => {
  const ws = currentProjectPath || process.cwd();
  return gitService.getStatus(ws);
});

ipcMain.handle(IPC_CHANNELS.GIT_STAGE_FILE, (_, filePath: string) => {
  const ws = currentProjectPath || process.cwd();
  return gitService.stageFile(ws, filePath);
});

ipcMain.handle(IPC_CHANNELS.GIT_STAGE_ALL, () => {
  const ws = currentProjectPath || process.cwd();
  return gitService.stageAll(ws);
});

ipcMain.handle(IPC_CHANNELS.GIT_UNSTAGE_FILE, (_, filePath: string) => {
  const ws = currentProjectPath || process.cwd();
  return gitService.unstageFile(ws, filePath);
});

ipcMain.handle(IPC_CHANNELS.GIT_COMMIT, (_, message: string) => {
  const ws = currentProjectPath || process.cwd();
  return gitService.commit(ws, message);
});

ipcMain.handle(IPC_CHANNELS.GIT_GET_BRANCHES, () => {
  const ws = currentProjectPath || process.cwd();
  return gitService.getBranches(ws);
});

ipcMain.handle(IPC_CHANNELS.GIT_CHECKOUT_BRANCH, (_, branch: string, createNew?: boolean) => {
  const ws = currentProjectPath || process.cwd();
  return gitService.checkoutBranch(ws, branch, createNew);
});

ipcMain.handle(IPC_CHANNELS.GIT_GET_DIFF, (_, filePath: string, staged?: boolean) => {
  const ws = currentProjectPath || process.cwd();
  return gitService.getDiff(ws, filePath, staged);
});

ipcMain.handle(IPC_CHANNELS.GIT_PULL, () => {
  const ws = currentProjectPath || process.cwd();
  return gitService.pull(ws);
});

ipcMain.handle(IPC_CHANNELS.GIT_PUSH, (_, userConfirmed: boolean) => {
  const ws = currentProjectPath || process.cwd();
  return gitService.push(ws, userConfirmed);
});

// Database & Persistent Storage IPC
ipcMain.handle(IPC_CHANNELS.DB_GET_RECENT_PROJECTS, () => {
  return dbManager.getRecentProjects();
});

ipcMain.handle(IPC_CHANNELS.DB_ADD_RECENT_PROJECT, (_, name: string, projPath: string) => {
  return dbManager.addRecentProject(name, projPath);
});

ipcMain.handle(IPC_CHANNELS.DB_GET_SETTINGS, () => {
  return dbManager.getSettings();
});

ipcMain.handle(IPC_CHANNELS.DB_SAVE_SETTINGS, (_, settings: Partial<IDESettings>) => {
  return dbManager.saveSettings(settings);
});

ipcMain.handle(IPC_CHANNELS.DB_GET_CHAT_SESSIONS, () => {
  return dbManager.getChatSessions();
});

ipcMain.handle(IPC_CHANNELS.DB_CREATE_CHAT_SESSION, (_, title: string, model: string) => {
  return dbManager.createChatSession(title, model);
});

ipcMain.handle(IPC_CHANNELS.DB_DELETE_CHAT_SESSION, (_, sessionId: string) => {
  return dbManager.deleteChatSession(sessionId);
});

ipcMain.handle(IPC_CHANNELS.DB_GET_CHAT_MESSAGES, (_, sessionId: string) => {
  return dbManager.getChatMessages(sessionId);
});

ipcMain.handle(IPC_CHANNELS.DB_SAVE_CHAT_MESSAGE, (_, sessionId: string, message: any) => {
  return dbManager.saveChatMessage(sessionId, message);
});

ipcMain.handle(IPC_CHANNELS.DB_CLEAR_CHAT_SESSION, (_, sessionId: string) => {
  return dbManager.clearChatSession(sessionId);
});

ipcMain.handle(IPC_CHANNELS.FS_WATCH_START, (_, dirPath: string) => {
  fileWatcher.startWatching(dirPath, mainWindow);
});

ipcMain.handle(IPC_CHANNELS.FS_WATCH_STOP, () => {
  fileWatcher.stopWatching();
});

app.whenReady().then(async () => {
  aiServiceManager.startService();
  await createWindow();
});

app.on('will-quit', () => {
  aiServiceManager.stopService();
  fileWatcher.stopWatching();
  terminalManager.closeAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
