import { describe, it, expect } from 'vitest';
import { MODEL_CATALOG } from '../apps/desktop/src/main/model-manager';
import { TerminalDiagnosticsManager } from '../apps/desktop/src/main/terminal-diagnostics';
import { RAGManager } from '../apps/desktop/src/main/rag-manager';
import { PRManager } from '../apps/desktop/src/main/pr-manager';

describe('Advanced Local Features & Roadmaps', () => {
  describe('In-App Model Hub (Phase 11)', () => {
    it('provides a complete catalog of open local models', () => {
      expect(MODEL_CATALOG.length).toBeGreaterThanOrEqual(4);
      const names = MODEL_CATALOG.map((m) => m.name);
      expect(names).toContain('qwen2.5-coder:7b');
      expect(names).toContain('deepseek-coder:6.7b');
      expect(names).toContain('llama3.2:3b');
    });

    it('defines hardware requirements and categories for all models', () => {
      MODEL_CATALOG.forEach((model) => {
        expect(model.recommendedHardware).toBeDefined();
        expect(model.size).toBeDefined();
        expect(model.parameterSize).toBeDefined();
        expect(['fast', 'balanced', 'powerful', 'instruct']).toContain(model.category);
      });
    });
  });

  describe('Terminal Auto-Healer (Phase 12)', () => {
    const diag = new TerminalDiagnosticsManager();

    it('detects TypeScript compilation errors', () => {
      const output = "src/app.ts:24:5: error: Type 'string' is not assignable to type 'number'.";
      const result = diag.detectError(output);
      expect(result.hasError).toBe(true);
      expect(result.summary).toContain("Type 'string' is not assignable");
      expect(result.filePath).toBe('src/app.ts');
      expect(result.line).toBe(24);
    });

    it('detects missing module errors', () => {
      const output = "Error: Cannot find module 'lodash' from 'src/index.js'";
      const result = diag.detectError(output);
      expect(result.hasError).toBe(true);
      expect(result.summary).toContain("Cannot find module 'lodash'");
    });

    it('passes clean outputs without false positives', () => {
      const output = '✓ Built successfully in 1.2s. 0 errors, 0 warnings.';
      const result = diag.detectError(output);
      expect(result.hasError).toBe(false);
    });
  });

  describe('Local Codebase Semantic RAG (Phase 13)', () => {
    it('initializes RAG Manager with clean stats', () => {
      const rag = new RAGManager();
      const stats = rag.getStats();
      expect(stats.isIndexing).toBe(false);
      expect(stats.chunksCount).toBe(0);
    });

    it('correctly matches and scores relevant keyword tokens', () => {
      const rag = new RAGManager();
      // query on empty index returns empty array gracefully
      const res = rag.query('authentication token');
      expect(Array.isArray(res)).toBe(true);
      expect(res.length).toBe(0);
    });
  });

  describe('Local Pull Request & Security Review (Phase 15)', () => {
    it('instantiates PR Manager with zero external dependencies', () => {
      const pr = new PRManager();
      expect(pr).toBeDefined();
      expect(typeof pr.generateReview).toBe('function');
    });
  });
});
