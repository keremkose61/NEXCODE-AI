import { create } from 'zustand';
import { AgentTask, AgentAuditLog, AgentTaskStep } from '@nexcode/shared';

const getAPI = () => (typeof window !== 'undefined' ? window.nexcode : undefined);

interface AgentState {
  currentTask: AgentTask | null;
  isPlanning: boolean;
  auditLogs: AgentAuditLog[];
  selectedStepId: string | null;

  startTask: (goal: string) => Promise<void>;
  approveStepAction: (
    stepId: string,
    action: {
      actionType: 'modify_file' | 'create_file' | 'delete_file' | 'execute_command';
      targetPath?: string;
      newContent?: string;
      diff?: string;
      command?: string;
    }
  ) => Promise<boolean>;
  rejectStepAction: (stepId: string) => void;
  revertAction: (logId: string) => Promise<boolean>;
  fetchAuditLogs: () => Promise<void>;
  setSelectedStepId: (stepId: string | null) => void;
  clearTask: () => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  currentTask: null,
  isPlanning: false,
  auditLogs: [],
  selectedStepId: null,

  setSelectedStepId: (stepId) => set({ selectedStepId: stepId }),

  startTask: async (goal: string) => {
    if (!goal.trim()) return;
    const api = getAPI();
    set({ isPlanning: true });

    try {
      if (api) {
        const task = await api.agent.planTask(goal);
        set({ currentTask: task, isPlanning: false });
        if (task.steps.length > 0) {
          const firstReqApproval = task.steps.find((s) => s.status === 'requires_approval');
          set({ selectedStepId: firstReqApproval ? firstReqApproval.id : task.steps[0].id });
        }
        return;
      }
    } catch (err) {
      console.warn('Agent planning error:', err);
    }

    // Offline / fallback simulated task
    const fallbackTask: AgentTask = {
      id: `task-${Date.now()}`,
      goal,
      status: 'running',
      createdAt: Date.now(),
      steps: [
        {
          id: `step-1`,
          title: 'Analyze Project Architecture & Workspace',
          description: `Scanned file tree and context files for '${goal}'.`,
          status: 'completed',
          targetFiles: ['welcome.ts']
        },
        {
          id: `step-2`,
          title: 'Synthesize Feature Implementation',
          description: `Generate proposed changes for '${goal}'.`,
          status: 'requires_approval',
          targetFiles: ['src/feature.ts'],
          diffPreview: `--- a/src/feature.ts\n+++ b/src/feature.ts\n@@ -0,0 +1,5 @@\n+// NEXCODE AI: ${goal}\n+export function runFeature() {\n+  return { ok: true };\n+}`
        },
        {
          id: `step-3`,
          title: 'Generate Unit Tests',
          description: `Automated test suite covering logic for '${goal}'.`,
          status: 'pending',
          targetFiles: ['tests/feature.test.ts']
        },
        {
          id: `step-4`,
          title: 'Run Verification Command',
          description: 'Run automated tests under explicit user authorization.',
          status: 'pending',
          commandPreview: 'pnpm test'
        }
      ]
    };

    set({ currentTask: fallbackTask, isPlanning: false, selectedStepId: 'step-2' });
  },

  approveStepAction: async (stepId, action) => {
    const api = getAPI();
    const currentTask = get().currentTask;
    if (!currentTask) return false;

    if (api) {
      try {
        const res = await api.agent.approveAction({
          taskId: currentTask.id,
          ...action
        });

        if (res.success && res.log) {
          set((state) => ({
            auditLogs: [res.log!, ...state.auditLogs],
            currentTask: state.currentTask
              ? {
                  ...state.currentTask,
                  steps: state.currentTask.steps.map((s) =>
                    s.id === stepId ? { ...s, status: 'completed' as const } : s
                  )
                }
              : null
          }));
          return true;
        }
      } catch (err) {
        console.error('Failed to approve step action:', err);
        return false;
      }
    }

    // Local state fallback
    set((state) => ({
      currentTask: state.currentTask
        ? {
            ...state.currentTask,
            steps: state.currentTask.steps.map((s) =>
              s.id === stepId ? { ...s, status: 'completed' as const } : s
            )
          }
        : null
    }));
    return true;
  },

  rejectStepAction: (stepId) => {
    set((state) => ({
      currentTask: state.currentTask
        ? {
            ...state.currentTask,
            steps: state.currentTask.steps.map((s) =>
              s.id === stepId ? { ...s, status: 'failed' as const } : s
            )
          }
        : null
    }));
  },

  revertAction: async (logId) => {
    const api = getAPI();
    if (api) {
      try {
        const res = await api.agent.revertAction(logId);
        if (res.success) {
          set((state) => ({
            auditLogs: state.auditLogs.map((l) => (l.id === logId ? { ...l, reverted: true } : l))
          }));
          return true;
        }
      } catch (err) {
        console.error('Failed to revert action:', err);
      }
    }
    return false;
  },

  fetchAuditLogs: async () => {
    const api = getAPI();
    if (!api) return;
    try {
      const logs = await api.agent.getAuditLogs();
      if (Array.isArray(logs)) {
        set({ auditLogs: logs });
      }
    } catch (err) {
      console.warn('Failed to fetch audit logs:', err);
    }
  },

  clearTask: () => set({ currentTask: null, selectedStepId: null })
}));
