import { FileNode } from '@nexcode/shared';

export function sortFileNodes(nodes: FileNode[]): FileNode[] {
  return [...nodes].sort((a, b) => {
    // Directories first
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    // Alphabetical
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}
