export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
  size?: number;
  extension?: string;
  isModified?: boolean;
}

export interface OpenTab {
  id: string;
  filePath: string;
  fileName: string;
  content: string;
  originalContent: string;
  isDirty: boolean;
  language: string;
}

export interface ProjectState {
  rootPath: string | null;
  projectName: string;
  files: FileNode[];
  activeFileId: string | null;
  openTabs: OpenTab[];
}
