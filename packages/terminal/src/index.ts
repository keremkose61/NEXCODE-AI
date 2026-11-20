import { ShellType, TerminalTab } from '@nexcode/shared';

export function createDefaultTerminalTab(cwd: string = ''): TerminalTab {
  return {
    id: `term-${Date.now()}`,
    title: 'PowerShell',
    shell: 'powershell',
    cwd,
    isActive: true
  };
}
