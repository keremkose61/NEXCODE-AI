import { describe, it, expect } from 'vitest';
import { sortFileNodes } from './index';
import { FileNode } from '@nexcode/shared';

describe('File Explorer Sorter', () => {
  it('places directories before files', () => {
    const nodes: FileNode[] = [
      { name: 'README.md', path: '/README.md', isDirectory: false },
      { name: 'src', path: '/src', isDirectory: true },
      { name: 'package.json', path: '/package.json', isDirectory: false }
    ];

    const sorted = sortFileNodes(nodes);
    expect(sorted[0].name).toBe('src');
    expect(sorted[0].isDirectory).toBe(true);
  });

  it('sorts alphabetically within same type', () => {
    const nodes: FileNode[] = [
      { name: 'zebra.ts', path: '/zebra.ts', isDirectory: false },
      { name: 'alpha.ts', path: '/alpha.ts', isDirectory: false }
    ];

    const sorted = sortFileNodes(nodes);
    expect(sorted[0].name).toBe('alpha.ts');
    expect(sorted[1].name).toBe('zebra.ts');
  });
});
