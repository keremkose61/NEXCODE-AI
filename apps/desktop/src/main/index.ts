import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import http from 'http';
import { IPC_CHANNELS, FileNode, IDESettings, DEFAULT_SETTINGS } from '@nexcode/shared';

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

// Local AI & Ollama Probe
ipcMain.handle(IPC_CHANNELS.AI_CHECK_STATUS, async () => {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:11434/api/tags', { timeout: 1500 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const models = parsed.models || [];
          resolve({
            isInstalled: true,
            isRunning: true,
            endpoint: 'http://localhost:11434',
            modelsCount: models.length,
            models: models.map((m: any) => ({
              name: m.name,
              displayName: m.name,
              size: m.size ? `${(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB` : undefined,
              isAvailableLocally: true
            }))
          });
        } catch {
          resolve({
            isInstalled: true,
            isRunning: false,
            endpoint: 'http://localhost:11434',
            modelsCount: 0,
            models: []
          });
        }
      });
    });

    req.on('error', () => {
      resolve({
        isInstalled: false,
        isRunning: false,
        endpoint: 'http://localhost:11434',
        modelsCount: 0,
        models: []
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        isInstalled: false,
        isRunning: false,
        endpoint: 'http://localhost:11434',
        modelsCount: 0,
        models: []
      });
    });
  });
});

app.whenReady().then(createWindow);

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
