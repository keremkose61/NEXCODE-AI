import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Check,
  X,
  Terminal,
  FileCode,
  Shield,
  Layers,
  ChevronRight,
  ListTodo,
  History
} from 'lucide-react';
import { useAgentStore } from '../../stores/useAgentStore';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { useEditorStore } from '../../stores/useEditorStore';

export const AgentPanel: React.FC = () => {
  const {
    currentTask,
    isPlanning,
    auditLogs,
    selectedStepId,
    startTask,
    approveStepAction,
    rejectStepAction,
    revertAction,
    fetchAuditLogs,
    setSelectedStepId,
    clearTask
  } = useAgentStore();
  const { activeTabId, openTabs } = useEditorStore();
  const { addNotification } = useNotificationStore();

  const [goalInput, setGoalInput] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'plan' | 'audit'>('plan');

  const activeTab = openTabs.find((t) => t.id === activeTabId);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleStart = () => {
    if (!goalInput.trim() || isPlanning) return;
    startTask(goalInput);
    setGoalInput('');
  };

  const handleApprove = async (stepId: string) => {
    const step = currentTask?.steps.find((s) => s.id === stepId);
    if (!step) return;

    let actionType: 'modify_file' | 'create_file' | 'execute_command' = 'modify_file';
    let targetPath = step.targetFiles?.[0] || 'src/feature.ts';
    let newContent = `// NEXCODE AI Agent Implementation\nexport function executedFeature() {\n  return { success: true, timestamp: ${Date.now()} };\n}\n`;

    if (step.commandPreview) {
      actionType = 'execute_command';
      targetPath = undefined as any;
    }

    const success = await approveStepAction(stepId, {
      actionType,
      targetPath,
      newContent,
      diff: step.diffPreview,
      command: step.commandPreview
    });

    if (success) {
      addNotification({
        type: 'success',
        title: 'Action Approved',
        message: `Successfully executed: ${step.title}`
      });
    } else {
      addNotification({
        type: 'error',
        title: 'Action Failed',
        message: 'Could not apply change. Check safety constraints.'
      });
    }
  };

  const handleReject = (stepId: string) => {
    rejectStepAction(stepId);
    addNotification({
      type: 'info',
      title: 'Action Rejected',
      message: 'Agent step rejected by user.'
    });
  };

  const handleRevert = async (logId: string) => {
    const success = await revertAction(logId);
    if (success) {
      addNotification({
        type: 'success',
        title: 'Action Reverted',
        message: 'Reverted file changes to previous state.'
      });
    } else {
      addNotification({
        type: 'error',
        title: 'Revert Failed',
        message: 'Failed to rollback changes.'
      });
    }
  };

  const sampleGoals = [
    `Create unit tests for ${activeTab?.fileName || 'active file'}`,
    'Refactor error handling with structured diagnostics',
    'Add SQLite query cache service'
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-nexcode-950 text-xs text-slate-300">
      {/* Sub Tabs: Active Plan vs Audit History */}
      <div className="px-3 py-1.5 border-b border-nexcode-800 bg-nexcode-900/60 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveSubTab('plan')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center space-x-1 transition-colors ${
              activeSubTab === 'plan'
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListTodo className="w-3 h-3" />
            <span>Plan & Steps</span>
          </button>
          <button
            onClick={() => {
              setActiveSubTab('audit');
              fetchAuditLogs();
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center space-x-1 transition-colors ${
              activeSubTab === 'audit'
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3 h-3" />
            <span>Audit & Undo ({auditLogs.length})</span>
          </button>
        </div>

        {currentTask && (
          <button
            onClick={clearTask}
            className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear Task
          </button>
        )}
      </div>

      {activeSubTab === 'plan' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Goal Input Card */}
          <div className="p-3 border-b border-nexcode-800 bg-nexcode-900/30 space-y-2">
            <div className="relative rounded-lg border border-nexcode-750 bg-nexcode-900 focus-within:border-indigo-500 transition-colors">
              <textarea
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleStart();
                  }
                }}
                rows={2}
                placeholder="Give autonomous goal to Agent (e.g. 'Generate tests and fix boundary checks')..."
                className="w-full bg-transparent p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
              />
              <div className="px-2 py-1 border-t border-nexcode-800/50 flex items-center justify-between text-[10px]">
                <div className="flex items-center space-x-1 text-slate-500">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span>Strict User Approval Gated</span>
                </div>
                <button
                  onClick={handleStart}
                  disabled={!goalInput.trim() || isPlanning}
                  className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium flex items-center space-x-1 transition-colors"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>{isPlanning ? 'Planning...' : 'Run Agent'}</span>
                </button>
              </div>
            </div>

            {/* Suggested Goals */}
            {!currentTask && (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500">Quick Start:</span>
                <div className="space-y-1">
                  {sampleGoals.map((g, idx) => (
                    <button
                      key={idx}
                      onClick={() => setGoalInput(g)}
                      className="w-full text-left px-2 py-1 rounded bg-nexcode-850 hover:bg-nexcode-800 text-[10px] text-slate-300 truncate transition-colors border border-nexcode-800"
                    >
                      ⚡ {g}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Task Steps Visualizer */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {currentTask ? (
              <div className="space-y-3">
                <div className="p-2.5 rounded-lg bg-nexcode-900 border border-nexcode-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-300 flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Active Goal</span>
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                      {currentTask.status}
                    </span>
                  </div>
                  <p className="text-slate-200 text-xs font-medium">{currentTask.goal}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                    Execution Plan ({currentTask.steps.length} Steps)
                  </span>

                  {currentTask.steps.map((step, idx) => {
                    const isSelected = selectedStepId === step.id;
                    return (
                      <div
                        key={step.id}
                        onClick={() => setSelectedStepId(step.id)}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-nexcode-900 border-indigo-500/60 shadow-md ring-1 ring-indigo-500/20'
                            : 'bg-nexcode-950 border-nexcode-800 hover:border-nexcode-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-[10px] text-slate-500">{idx + 1}.</span>
                            <span className="font-medium text-slate-200 text-[11px]">{step.title}</span>
                          </div>

                          {step.status === 'completed' && (
                            <span className="flex items-center space-x-1 text-emerald-400 text-[10px]">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Done</span>
                            </span>
                          )}
                          {step.status === 'requires_approval' && (
                            <span className="flex items-center space-x-1 text-amber-400 text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded">
                              <AlertCircle className="w-3 h-3" />
                              <span>Approval Needed</span>
                            </span>
                          )}
                          {step.status === 'pending' && (
                            <span className="flex items-center space-x-1 text-slate-500 text-[10px]">
                              <Clock className="w-3 h-3" />
                              <span>Queued</span>
                            </span>
                          )}
                          {step.status === 'failed' && (
                            <span className="flex items-center space-x-1 text-rose-400 text-[10px]">
                              <X className="w-3 h-3" />
                              <span>Rejected</span>
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed">{step.description}</p>

                        {/* Approval Box for File Changes / Diff */}
                        {step.status === 'requires_approval' && (
                          <div className="mt-2.5 p-2 rounded bg-nexcode-950 border border-amber-500/30 space-y-2">
                            <div className="flex items-center justify-between text-[10px] text-amber-300">
                              <span className="font-semibold flex items-center space-x-1">
                                <FileCode className="w-3 h-3" />
                                <span>Target: {step.targetFiles?.join(', ') || 'Source File'}</span>
                              </span>
                              <span>Review Required</span>
                            </div>

                            {step.diffPreview && (
                              <pre className="p-2 rounded bg-nexcode-900 border border-nexcode-800 font-mono text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-36">
                                {step.diffPreview.split('\n').map((line, i) => {
                                  let color = 'text-slate-300';
                                  if (line.startsWith('+')) color = 'text-emerald-400 bg-emerald-950/30';
                                  if (line.startsWith('-')) color = 'text-rose-400 bg-rose-950/30';
                                  if (line.startsWith('@')) color = 'text-indigo-400';
                                  return (
                                    <div key={i} className={color}>
                                      {line}
                                    </div>
                                  );
                                })}
                              </pre>
                            )}

                            {step.commandPreview && (
                              <div className="p-2 rounded bg-nexcode-900 border border-nexcode-800 font-mono text-[11px] text-amber-300 flex items-center space-x-1.5">
                                <Terminal className="w-3.5 h-3.5" />
                                <span>{step.commandPreview}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-end space-x-2 pt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReject(step.id);
                                }}
                                className="px-2.5 py-1 rounded bg-nexcode-850 hover:bg-nexcode-800 text-slate-300 transition-colors text-[10px]"
                              >
                                Reject
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(step.id);
                                }}
                                className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center space-x-1 transition-colors text-[10px] shadow-sm"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve & Apply</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-2">
                <Zap className="w-8 h-8 text-slate-600" />
                <p className="font-semibold text-slate-400 text-xs">Autonomous Agent Idle</p>
                <p className="text-[11px] max-w-xs">
                  Enter a goal above. The Agent will inspect your project, break down the plan into steps, and request your approval before modifying files or running commands.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit History & Rollback / Undo Tab */}
      {activeSubTab === 'audit' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Safety Audit Trail</span>
            <span>{auditLogs.length} Actions Logged</span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-xs">
              No actions have been executed yet. Approved agent actions will appear here with rollback capabilities.
            </div>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-lg bg-nexcode-900 border border-nexcode-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-indigo-300 uppercase font-mono text-[10px]">
                    {log.actionType}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {log.targetPath && (
                  <div className="text-[11px] text-slate-300 font-mono truncate">
                    📄 {log.targetPath}
                  </div>
                )}

                {log.command && (
                  <div className="text-[11px] text-amber-300 font-mono truncate">
                    💻 {log.command}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-nexcode-800/60 text-[10px]">
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <Check className="w-2.5 h-2.5" />
                    <span>User Approved</span>
                  </span>

                  {log.actionType !== 'execute_command' && (
                    <button
                      onClick={() => handleRevert(log.id)}
                      disabled={log.reverted}
                      className={`flex items-center space-x-1 px-2 py-0.5 rounded transition-colors ${
                        log.reverted
                          ? 'bg-nexcode-800 text-slate-500 cursor-not-allowed'
                          : 'bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white'
                      }`}
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>{log.reverted ? 'Reverted' : 'Undo / Rollback'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
