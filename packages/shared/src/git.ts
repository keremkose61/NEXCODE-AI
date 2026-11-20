export type GitFileStatusType = 'modified' | 'added' | 'deleted' | 'untracked' | 'renamed' | 'conflict';

export interface GitFileStatus {
  path: string;
  status: GitFileStatusType;
  staged: boolean;
}

export interface GitBranchInfo {
  current: string;
  all: string[];
}

export interface GitStatusResult {
  isRepo: boolean;
  branch: string;
  files: GitFileStatus[];
  ahead: number;
  behind: number;
}
