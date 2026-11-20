import { describe, it, expect } from 'vitest';
import { detectLanguageFromPath, COMMON_SNIPPETS } from '../packages/editor/src/index';
import { useProjectStore } from '../apps/desktop/src/renderer/stores/useProjectStore';

describe('File Management & Monaco Extensions (PHASE 3)', () => {
  it('detects all 18 primary target languages', () => {
    const testCases: [string, string][] = [
      ['main.py', 'python'],
      ['App.java', 'java'],
      ['index.js', 'javascript'],
      ['App.tsx', 'typescript'],
      ['main.c', 'c'],
      ['server.cpp', 'cpp'],
      ['Program.cs', 'csharp'],
      ['index.php', 'php'],
      ['index.html', 'html'],
      ['styles.css', 'css'],
      ['App.kt', 'kotlin'],
      ['schema.sql', 'sql'],
      ['main.rs', 'rust'],
      ['main.go', 'go'],
      ['package.json', 'json'],
      ['config.xml', 'xml'],
      ['deploy.yaml', 'yaml'],
      ['README.md', 'markdown']
    ];

    for (const [filename, expectedLang] of testCases) {
      expect(detectLanguageFromPath(filename)).toBe(expectedLang);
    }
  });

  it('provides rich snippets for key languages', () => {
    expect(COMMON_SNIPPETS.typescript.length).toBeGreaterThan(0);
    expect(COMMON_SNIPPETS.python.length).toBeGreaterThan(0);
    expect(COMMON_SNIPPETS.rust.length).toBeGreaterThan(0);

    const pyDef = COMMON_SNIPPETS.python.find((s) => s.label === 'def');
    expect(pyDef).toBeDefined();
    expect(pyDef?.snippet).toContain('def ');
  });

  it('manages delete prompt safety workflow', () => {
    const store = useProjectStore.getState();

    store.promptDelete({ path: 'C:\\test\\bad.ts', name: 'bad.ts', isDirectory: false });
    expect(useProjectStore.getState().isConfirmDeleteOpen).toBe(true);
    expect(useProjectStore.getState().itemToDelete?.name).toBe('bad.ts');

    store.cancelDelete();
    expect(useProjectStore.getState().isConfirmDeleteOpen).toBe(false);
    expect(useProjectStore.getState().itemToDelete).toBeNull();
  });

  it('manages rename prompt workflow', () => {
    const store = useProjectStore.getState();

    store.promptRename({ path: 'C:\\test\\old.ts', name: 'old.ts' });
    expect(useProjectStore.getState().isRenameOpen).toBe(true);
    expect(useProjectStore.getState().itemToRename?.name).toBe('old.ts');

    store.cancelRename();
    expect(useProjectStore.getState().isRenameOpen).toBe(false);
    expect(useProjectStore.getState().itemToRename).toBeNull();
  });
});
