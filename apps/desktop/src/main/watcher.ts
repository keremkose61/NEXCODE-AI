import { BrowserWindow } from 'electron';
import fs from 'fs';
import { IPC_CHANNELS } from '@nexcode/shared';

export class FileWatcher {
  private watcher: fs.FSWatcher | null = null;
  private currentPath: string | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;

  public startWatching(dirPath: string, window: BrowserWindow | null) {
    this.stopWatching();

    try {
      this.currentPath = dirPath;
      this.watcher = fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
        if (!filename) return;

        // Ignore build directories and git
        if (
          filename.includes('.git') ||
          filename.includes('node_modules') ||
          filename.includes('dist') ||
          filename.includes('out') ||
          filename.includes('.venv')
        ) {
          return;
        }

        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
          if (window && !window.isDestroyed()) {
            window.webContents.send(IPC_CHANNELS.FS_FILE_CHANGED, {
              eventType,
              filename,
              rootPath: dirPath
            });
          }
        }, 300);
      });
    } catch (err) {
      console.warn('Failed to start file watcher for path:', dirPath, err);
    }
  }

  public stopWatching() {
    if (this.watcher) {
      try {
        this.watcher.close();
      } catch {}
      this.watcher = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.currentPath = null;
  }
}

export const fileWatcher = new FileWatcher();
