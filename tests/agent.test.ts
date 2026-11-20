import { describe, it, expect } from 'vitest';
import { useAgentStore } from '../apps/desktop/src/renderer/stores/useAgentStore';

describe('AI Agent & Safety Guardrails (PHASE 7)', () => {
  it('initializes with clean agent state', () => {
    const store = useAgentStore.getState();
    expect(store.currentTask).toBeNull();
    expect(store.isPlanning).toBe(false);
  });

  it('decomposes user goal into multi-stage steps', async () => {
    const store = useAgentStore.getState();
    await store.startTask('Implement secure JWT authentication flow');

    const updated = useAgentStore.getState().currentTask;
    expect(updated).not.toBeNull();
    expect(updated?.goal).toBe('Implement secure JWT authentication flow');
    expect(updated?.steps.length).toBeGreaterThanOrEqual(3);

    // Verify approval required for sensitive actions
    const approvalStep = updated?.steps.find((s) => s.status === 'requires_approval');
    expect(approvalStep).toBeDefined();
    expect(approvalStep?.diffPreview).toBeDefined();
  });

  it('supports explicit approval and marks step completed', async () => {
    const store = useAgentStore.getState();
    const task = store.currentTask;
    expect(task).not.toBeNull();

    const approvalStep = task?.steps.find((s) => s.status === 'requires_approval');
    if (approvalStep) {
      await store.approveStepAction(approvalStep.id, {
        actionType: 'modify_file',
        targetPath: 'src/auth.ts',
        newContent: 'export const auth = true;',
        diff: approvalStep.diffPreview
      });

      const stepAfter = useAgentStore
        .getState()
        .currentTask?.steps.find((s) => s.id === approvalStep.id);
      expect(stepAfter?.status).toBe('completed');
    }
  });

  it('supports explicit rejection of agent actions', () => {
    const store = useAgentStore.getState();
    const step = store.currentTask?.steps[2];
    if (step) {
      store.rejectStepAction(step.id);
      const updatedStep = useAgentStore
        .getState()
        .currentTask?.steps.find((s) => s.id === step.id);
      expect(updatedStep?.status).toBe('failed');
    }
  });

  it('clears active task cleanly', () => {
    const store = useAgentStore.getState();
    store.clearTask();
    expect(useAgentStore.getState().currentTask).toBeNull();
    expect(useAgentStore.getState().selectedStepId).toBeNull();
  });
});
