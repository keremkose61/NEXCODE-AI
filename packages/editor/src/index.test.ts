import { describe, it, expect } from 'vitest';
import { detectLanguageFromPath, LANGUAGE_MAP } from './index';

describe('Editor Language Detector', () => {
  it('detects typescript for .ts and .tsx files', () => {
    expect(detectLanguageFromPath('App.tsx')).toBe('typescript');
    expect(detectLanguageFromPath('index.ts')).toBe('typescript');
  });

  it('detects python for .py files', () => {
    expect(detectLanguageFromPath('main.py')).toBe('python');
  });

  it('detects rust for .rs files', () => {
    expect(detectLanguageFromPath('lib.rs')).toBe('rust');
  });

  it('detects markdown for .md files', () => {
    expect(detectLanguageFromPath('README.md')).toBe('markdown');
  });

  it('falls back to plaintext for unknown extensions', () => {
    expect(detectLanguageFromPath('unknown.xyz123')).toBe('plaintext');
  });
});
