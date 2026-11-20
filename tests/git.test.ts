import { describe, it, expect } from 'vitest';
import { useGitStore } from '../apps/desktop/src/renderer/stores/useGitStore';

describe('Git & GitHub Integration (PHASE 9)', () => {
  it('initializes with clean git state', () => {
    const store = useGitStore.getState();
    expect(store.branch).toBe('master');
    expect(store.diffModal.isOpen).toBe(false);
  });

  it('rejects push if user confirmation is false', async () => {
    const store = useGitStore.getState();
    const result = await store.push(false);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Safety Rule: Remote push rejected without user explicit approval.');
  });

  it('manages diff viewer modal opening and closing', async () => {
    const store = useGitStore.getState();
    await store.openDiff('src/app.ts');

    const stateOpened = useGitStore.getState();
    expect(stateOpened.diffModal.isOpen).toBe(true);
    expect(stateOpened.diffModal.filePath).toBe('src/app.ts');

    store.closeDiff();
    expect(useGitStore.getState().diffModal.isOpen).toBe(false);
  });

  it('validates empty commit messages', async () => {
    const store = useGitStore.getState();
    const res = await store.commit('');
    expect(res.success).toBe(false);
  });
});
