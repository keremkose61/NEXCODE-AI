import { GitStatusResult } from '@nexcode/shared';

export function createEmptyGitStatus(): GitStatusResult {
  return {
    isRepo: false,
    branch: '',
    files: [],
    ahead: 0,
    behind: 0
  };
}
