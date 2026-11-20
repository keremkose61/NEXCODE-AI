import { spawn, ChildProcess } from 'child_process';
import { BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '@nexcode/shared';

export interface TerminalSession {
  tabId: string;
  shell: 'powershell' | 'cmd';
  cwd: string;
  process: ChildProcess;
}

export class TerminalManager {
  private sessions: Map<string, TerminalSession> = new Map();

  public spawn(
    tabId: string,
    shell: 'powershell' | 'cmd' = 'powershell',
    cwd: string,
    window?: BrowserWindow | null
  ): { success: boolean; pid?: number; error?: string } {
    try {
      this.close(tabId);

      const isWindows = process.platform === 'win32';
      let bin: string;
      let args: string[];

      if (shell === 'cmd') {
        bin = isWindows ? 'cmd.exe' : 'sh';
        args = isWindows ? [] : [];
      } else {
        bin = isWindows ? 'powershell.exe' : 'bash';
        args = isWindows ? ['-NoLogo'] : [];
      }

      const effectiveCwd = cwd && cwd.trim() ? cwd : process.cwd();

      const child = spawn(bin, args, {
        cwd: effectiveCwd,
        env: { ...process.env, TERM: 'xterm-256color' },
        shell: false
      });

      child.stdout?.on('data', (chunk) => {
        const text = chunk.toString('utf-8');
        window?.webContents.send(IPC_CHANNELS.TERMINAL_OUTPUT, { tabId, data: text });
      });

      child.stderr?.on('data', (chunk) => {
        const text = chunk.toString('utf-8');
        window?.webContents.send(IPC_CHANNELS.TERMINAL_OUTPUT, { tabId, data: text });
      });

      child.on('close', (code) => {
        window?.webContents.send(IPC_CHANNELS.TERMINAL_OUTPUT, {
          tabId,
          data: `\r\n[Process terminated with code ${code}]\r\n`
        });
        this.sessions.delete(tabId);
      });

      child.on('error', (err) => {
        window?.webContents.send(IPC_CHANNELS.TERMINAL_OUTPUT, {
          tabId,
          data: `\r\n[Failed to start shell: ${err.message}]\r\n`
        });
      });

      this.sessions.set(tabId, { tabId, shell, cwd: effectiveCwd, process: child });
      return { success: true, pid: child.pid };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public writeInput(tabId: string, data: string): boolean {
    const session = this.sessions.get(tabId);
    if (session && session.process.stdin && !session.process.stdin.destroyed) {
      session.process.stdin.write(data);
      return true;
    }
    return false;
  }

  public close(tabId: string): boolean {
    const session = this.sessions.get(tabId);
    if (session) {
      try {
        session.process.kill();
      } catch {}
      this.sessions.delete(tabId);
      return true;
    }
    return false;
  }

  public closeAll() {
    for (const [_, session] of this.sessions) {
      try {
        session.process.kill();
      } catch {}
    }
    this.sessions.clear();
  }
}

export const terminalManager = new TerminalManager();
