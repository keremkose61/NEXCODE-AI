import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { GitStatusResult, GitBranchInfo, GitFileStatus, GitFileStatusType } from '@nexcode/shared';

function execGit(args: string[], cwd: string): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    execFile('git', args, { cwd }, (error, stdout, stderr) => {
      resolve({
        stdout: stdout || '',
        stderr: stderr || '',
        code: error ? (error as any).code || 1 : 0
      });
    });
  });
}

export class GitService {
  public async isGitRepo(workspaceDir: string): Promise<boolean> {
    if (!workspaceDir || !fs.existsSync(workspaceDir)) return false;
    const res = await execGit(['rev-parse', '--is-inside-work-tree'], workspaceDir);
    return res.code === 0 && res.stdout.trim() === 'true';
  }

  public async getStatus(workspaceDir: string): Promise<GitStatusResult> {
    const isRepo = await this.isGitRepo(workspaceDir);
    if (!isRepo) {
      return {
        isRepo: false,
        branch: '',
        files: [],
        ahead: 0,
        behind: 0
      };
    }

    const branchRes = await execGit(['branch', '--show-current'], workspaceDir);
    const branch = branchRes.stdout.trim() || 'HEAD';

    const statusRes = await execGit(['status', '--porcelain=v1'], workspaceDir);
    const files: GitFileStatus[] = [];

    const lines = statusRes.stdout.split('\n');
    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      if (!line || line.length < 3) continue;

      const indexStatus = line[0];
      const worktreeStatus = line[1];
      const filePath = line.substring(3).trim();

      let statusType: GitFileStatusType = 'modified';
      let isStaged = false;

      if (indexStatus !== ' ' && indexStatus !== '?') {
        isStaged = true;
        if (indexStatus === 'A') statusType = 'added';
        else if (indexStatus === 'D') statusType = 'deleted';
        else if (indexStatus === 'R') statusType = 'renamed';
        else statusType = 'modified';
      } else if (worktreeStatus === '?') {
        statusType = 'untracked';
      } else if (worktreeStatus === 'D') {
        statusType = 'deleted';
      } else if (worktreeStatus === 'M') {
        statusType = 'modified';
      }

      files.push({
        path: filePath,
        status: statusType,
        staged: isStaged
      });
    }

    return {
      isRepo: true,
      branch,
      files,
      ahead: 0,
      behind: 0
    };
  }

  public async stageFile(workspaceDir: string, filePath: string): Promise<boolean> {
    const res = await execGit(['add', filePath], workspaceDir);
    return res.code === 0;
  }

  public async stageAll(workspaceDir: string): Promise<boolean> {
    const res = await execGit(['add', '-A'], workspaceDir);
    return res.code === 0;
  }

  public async unstageFile(workspaceDir: string, filePath: string): Promise<boolean> {
    const res = await execGit(['restore', '--staged', filePath], workspaceDir);
    return res.code === 0;
  }

  public async commit(
    workspaceDir: string,
    message: string
  ): Promise<{ success: boolean; hash?: string; error?: string }> {
    if (!message.trim()) {
      return { success: false, error: 'Commit message cannot be empty' };
    }
    const res = await execGit(['commit', '-m', message], workspaceDir);
    if (res.code === 0) {
      const hashRes = await execGit(['rev-parse', '--short', 'HEAD'], workspaceDir);
      return { success: true, hash: hashRes.stdout.trim() };
    }
    return { success: false, error: res.stderr || 'Git commit failed' };
  }

  public async getBranches(workspaceDir: string): Promise<GitBranchInfo> {
    const isRepo = await this.isGitRepo(workspaceDir);
    if (!isRepo) return { current: '', all: [] };

    const currentRes = await execGit(['branch', '--show-current'], workspaceDir);
    const listRes = await execGit(['branch', '--list'], workspaceDir);

    const all = listRes.stdout
      .split('\n')
      .map((b) => b.replace('*', '').trim())
      .filter((b) => b.length > 0);

    return {
      current: currentRes.stdout.trim() || 'master',
      all
    };
  }

  public async checkoutBranch(
    workspaceDir: string,
    branch: string,
    createNew = false
  ): Promise<{ success: boolean; error?: string }> {
    const args = createNew ? ['checkout', '-b', branch] : ['checkout', branch];
    const res = await execGit(args, workspaceDir);
    if (res.code === 0) {
      return { success: true };
    }
    return { success: false, error: res.stderr || 'Failed to checkout branch' };
  }

  public async getDiff(
    workspaceDir: string,
    filePath: string,
    staged = false
  ): Promise<{ original: string; modified: string }> {
    let original = '';
    let modified = '';

    const safeFile = path.resolve(workspaceDir, filePath);
    if (fs.existsSync(safeFile)) {
      modified = fs.readFileSync(safeFile, 'utf-8');
    }

    const headRes = await execGit(['show', `HEAD:${filePath}`], workspaceDir);
    if (headRes.code === 0) {
      original = headRes.stdout;
    }

    return { original, modified };
  }

  public async pull(workspaceDir: string): Promise<{ success: boolean; output: string }> {
    const res = await execGit(['pull'], workspaceDir);
    return { success: res.code === 0, output: res.stdout || res.stderr };
  }

  public async push(
    workspaceDir: string,
    userConfirmed: boolean
  ): Promise<{ success: boolean; output: string; error?: string }> {
    if (!userConfirmed) {
      return {
        success: false,
        output: '',
        error: 'Safety Rule: Remote push rejected without explicit user confirmation.'
      };
    }
    const res = await execGit(['push'], workspaceDir);
    return {
      success: res.code === 0,
      output: res.stdout,
      error: res.code !== 0 ? res.stderr : undefined
    };
  }
}

export const gitService = new GitService();
