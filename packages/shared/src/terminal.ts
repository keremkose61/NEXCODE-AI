export type ShellType = 'powershell' | 'cmd' | 'bash';

export interface TerminalTab {
  id: string;
  title: string;
  shell: ShellType;
  cwd: string;
  pid?: number;
  isActive: boolean;
}

export interface TerminalOutputChunk {
  tabId: string;
  data: string;
}
