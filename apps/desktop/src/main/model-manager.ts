import http from 'http';
import { ModelPullProgress } from '@nexcode/shared';
import { BrowserWindow } from 'electron';

export interface CatalogModel {
  name: string;
  displayName: string;
  size: string;
  parameterSize: string;
  description: string;
  recommendedHardware: string;
  category: 'fast' | 'balanced' | 'powerful' | 'instruct';
}

export const MODEL_CATALOG: CatalogModel[] = [
  {
    name: 'qwen2.5-coder:1.5b',
    displayName: 'Qwen 2.5 Coder 1.5B (Ultra-Fast)',
    size: '1.1 GB',
    parameterSize: '1.5B',
    description: 'Lightning-fast autocomplete and inline editing. Runs comfortably even on 4GB RAM CPUs.',
    recommendedHardware: '4GB+ RAM / Any CPU',
    category: 'fast'
  },
  {
    name: 'qwen2.5-coder:7b',
    displayName: 'Qwen 2.5 Coder 7B (Recommended)',
    size: '4.7 GB',
    parameterSize: '7B',
    description: 'State-of-the-art coding accuracy, multi-language reasoning, refactoring, and test generation.',
    recommendedHardware: '8GB - 16GB RAM / CPU or 6GB VRAM GPU',
    category: 'balanced'
  },
  {
    name: 'deepseek-coder:6.7b',
    displayName: 'DeepSeek Coder 6.7B',
    size: '3.8 GB',
    parameterSize: '6.7B',
    description: 'Renowned open coding model trained on 2T tokens. Excellent architectural and algorithmic comprehension.',
    recommendedHardware: '8GB - 16GB RAM / CPU or GPU',
    category: 'powerful'
  },
  {
    name: 'llama3.2:3b',
    displayName: 'Llama 3.2 3B',
    size: '2.0 GB',
    parameterSize: '3B',
    description: 'Meta’s latest edge model. Optimized for low-latency reasoning and general conversational intelligence.',
    recommendedHardware: '6GB+ RAM / CPU or GPU',
    category: 'fast'
  },
  {
    name: 'codellama:7b',
    displayName: 'CodeLlama 7B',
    size: '3.8 GB',
    parameterSize: '7B',
    description: 'Specialized code completion model with support for fill-in-the-middle (FIM) operations.',
    recommendedHardware: '8GB - 16GB RAM / CPU or GPU',
    category: 'balanced'
  }
];

export class ModelManager {
  private activeDownloads = new Map<string, boolean>();

  public getCatalog(): CatalogModel[] {
    return MODEL_CATALOG;
  }

  public pullModelStream(
    modelName: string,
    window: BrowserWindow | null,
    onProgress?: (p: ModelPullProgress) => void
  ): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.activeDownloads.set(modelName, true);

      const postData = JSON.stringify({ name: modelName, stream: true });
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: 11434,
          path: '/api/pull',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        },
        (res) => {
          let buffer = '';

          res.on('data', (chunk) => {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const data = JSON.parse(line);
                const progress: ModelPullProgress = {
                  model: modelName,
                  status: data.status || 'downloading',
                  completed: data.completed,
                  total: data.total,
                  percentage:
                    data.total && data.completed
                      ? Math.round((data.completed / data.total) * 100)
                      : undefined
                };

                if (onProgress) onProgress(progress);
                if (window && !window.isDestroyed()) {
                  window.webContents.send('ai:pull-progress', progress);
                }
              } catch {
                // partial line
              }
            }
          });

          res.on('end', () => {
            this.activeDownloads.delete(modelName);
            resolve({ success: res.statusCode === 200 });
          });
        }
      );

      req.on('error', (err) => {
        this.activeDownloads.delete(modelName);
        resolve({ success: false, error: err.message });
      });

      req.write(postData);
      req.end();
    });
  }

  public deleteModel(modelName: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const postData = JSON.stringify({ name: modelName });
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: 11434,
          path: '/api/delete',
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        },
        (res) => {
          resolve({ success: res.statusCode === 200 });
        }
      );

      req.on('error', (err) => resolve({ success: false, error: err.message }));
      req.write(postData);
      req.end();
    });
  }
}

export const modelManager = new ModelManager();
