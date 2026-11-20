import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import http from 'http';

export class LocalAIServiceManager {
  private process: ChildProcess | null = null;
  private isStarting = false;
  private port = 8765;

  public async startService(): Promise<boolean> {
    if (this.process) return true;
    if (this.isStarting) return false;

    // Check if already running on 8765
    const isRunning = await this.pingService();
    if (isRunning) {
      console.log('[NEXCODE AI Service] Already running on port', this.port);
      return true;
    }

    const pythonCandidates = [
      'C:\\Users\\Kose\\AppData\\Local\\Python\\bin\\python.exe',
      'python.exe',
      'python3.exe'
    ];

    let validPython: string | null = null;
    for (const cand of pythonCandidates) {
      if (fs.existsSync(cand)) {
        validPython = cand;
        break;
      }
    }

    if (!validPython) {
      console.log('[NEXCODE AI Service] Standalone python path not directly located, running via fallback.');
      return false;
    }

    try {
      this.isStarting = true;
      const rootDir = path.resolve(__dirname, '../../..');
      const aiEngineDir = path.join(rootDir, 'ai-engine');
      const scriptPath = path.join(aiEngineDir, 'app', 'main.py');

      if (!fs.existsSync(scriptPath)) {
        this.isStarting = false;
        return false;
      }

      this.process = spawn(validPython, ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', String(this.port)], {
        cwd: aiEngineDir,
        env: {
          ...process.env,
          PYTHONPATH: aiEngineDir,
          NEXCODE_ENGINE_PORT: String(this.port)
        },
        stdio: 'ignore',
        detached: false
      });

      this.process.on('error', (err) => {
        console.warn('[NEXCODE AI Service] Process error:', err);
        this.process = null;
      });

      this.process.on('exit', () => {
        this.process = null;
      });

      this.isStarting = false;
      return true;
    } catch (err) {
      console.warn('[NEXCODE AI Service] Failed to spawn local python AI backend:', err);
      this.isStarting = false;
      return false;
    }
  }

  public stopService() {
    if (this.process) {
      try {
        this.process.kill();
      } catch {}
      this.process = null;
    }
  }

  public pingService(): Promise<boolean> {
    return new Promise((resolve) => {
      const req = http.get(`http://127.0.0.1:${this.port}/api/v1/health`, { timeout: 1000 }, (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    });
  }
}

export const aiServiceManager = new LocalAIServiceManager();
