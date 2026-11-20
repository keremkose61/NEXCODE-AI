import fs from 'fs/promises';
import path from 'path';
import { RAGSearchResult } from '@nexcode/shared';

interface CodeChunk {
  filePath: string;
  lineStart: number;
  lineEnd: number;
  content: string;
  tokens: Set<string>;
}

export class RAGManager {
  private chunks: CodeChunk[] = [];
  private isIndexing = false;
  private indexedFilesCount = 0;
  private totalChunksCount = 0;
  private currentRoot: string | null = null;

  private ignoredDirs = new Set([
    'node_modules',
    '.git',
    'dist',
    'dist-electron',
    'out',
    'build',
    '.next',
    'target',
    '__pycache__',
    '.venv'
  ]);

  private allowedExtensions = new Set([
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.py',
    '.rs',
    '.go',
    '.java',
    '.c',
    '.cpp',
    '.h',
    '.cs',
    '.json',
    '.md',
    '.yaml',
    '.yml',
    '.toml',
    '.html',
    '.css',
    '.sql'
  ]);

  public async indexWorkspace(rootDir: string): Promise<{ filesCount: number; chunksCount: number }> {
    if (this.isIndexing) {
      return { filesCount: this.indexedFilesCount, chunksCount: this.totalChunksCount };
    }

    this.isIndexing = true;
    this.currentRoot = rootDir;
    this.chunks = [];
    this.indexedFilesCount = 0;

    try {
      await this.scanDirectory(rootDir);
      this.totalChunksCount = this.chunks.length;
    } catch (err) {
      console.error('[NEXCODE RAG] Indexing error:', err);
    } finally {
      this.isIndexing = false;
    }

    return {
      filesCount: this.indexedFilesCount,
      chunksCount: this.totalChunksCount
    };
  }

  private async scanDirectory(dirPath: string): Promise<void> {
    let entries: string[] = [];
    try {
      entries = await fs.readdir(dirPath);
    } catch {
      return;
    }

    for (const entry of entries) {
      if (this.ignoredDirs.has(entry) || entry.startsWith('.')) continue;

      const fullPath = path.join(dirPath, entry);
      let stat;
      try {
        stat = await fs.stat(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        await this.scanDirectory(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath).toLowerCase();
        if (this.allowedExtensions.has(ext) && stat.size < 500 * 1024) {
          await this.indexFile(fullPath);
        }
      }
    }
  }

  private async indexFile(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      const relativePath = this.currentRoot ? path.relative(this.currentRoot, filePath) : filePath;

      const chunkSize = 35;
      const overlap = 10;

      for (let i = 0; i < lines.length; i += chunkSize - overlap) {
        const slice = lines.slice(i, i + chunkSize);
        if (slice.length === 0) break;

        const chunkText = slice.join('\n');
        const tokens = this.tokenize(chunkText);

        if (tokens.size > 0) {
          this.chunks.push({
            filePath: relativePath,
            lineStart: i + 1,
            lineEnd: Math.min(i + chunkSize, lines.length),
            content: chunkText,
            tokens
          });
        }
      }

      this.indexedFilesCount++;
    } catch {
      // Ignore unreadable binary or permission issues
    }
  }

  private tokenize(text: string): Set<string> {
    const rawTokens = text
      .toLowerCase()
      .split(/[^a-zA-Z0-9_$]+/)
      .filter((t) => t.length > 2 && t.length < 35);
    return new Set(rawTokens);
  }

  public query(queryText: string, limit = 5): RAGSearchResult[] {
    if (this.chunks.length === 0) return [];

    const queryTokens = Array.from(this.tokenize(queryText));
    if (queryTokens.length === 0) return [];

    const scored = this.chunks.map((chunk) => {
      let matches = 0;
      for (const qt of queryTokens) {
        if (chunk.tokens.has(qt)) {
          matches++;
        }
      }

      // Keyword density score
      const score = matches / Math.sqrt(chunk.tokens.size + 1);
      return {
        filePath: chunk.filePath,
        lineStart: chunk.lineStart,
        lineEnd: chunk.lineEnd,
        content: chunk.content,
        score
      };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  public getStats() {
    return {
      isIndexing: this.isIndexing,
      filesCount: this.indexedFilesCount,
      chunksCount: this.chunks.length,
      currentRoot: this.currentRoot
    };
  }
}

export const ragManager = new RAGManager();
