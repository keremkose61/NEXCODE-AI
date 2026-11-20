import { describe, it, expect } from 'vitest';
import { useTerminalStore } from '../apps/desktop/src/renderer/stores/useTerminalStore';
import { useDebuggerStore } from '../apps/desktop/src/renderer/stores/useDebuggerStore';

describe('Terminal & Debugger Subsystems (PHASE 8)', () => {
  describe('Terminal Store', () => {
    it('initializes with default PowerShell tab', () => {
      const store = useTerminalStore.getState();
      expect(store.tabs.length).toBeGreaterThanOrEqual(1);
      expect(store.tabs[0].shell).toBe('powershell');
    });

    it('adds and switches terminal tabs (PowerShell & CMD)', () => {
      const store = useTerminalStore.getState();
      const initialCount = store.tabs.length;

      store.addTab('cmd', 'C:\\test');
      const stateAfterAdd = useTerminalStore.getState();
      expect(stateAfterAdd.tabs.length).toBe(initialCount + 1);

      const added = stateAfterAdd.tabs[stateAfterAdd.tabs.length - 1];
      expect(added.shell).toBe('cmd');
      expect(stateAfterAdd.activeTabId).toBe(added.id);
    });

    it('records command input and updates terminal output', () => {
      const store = useTerminalStore.getState();
      const activeId = store.activeTabId;

      store.sendCommand(activeId, 'npm --version');
      expect(useTerminalStore.getState().history).toContain('npm --version');

      store.appendOutput(activeId, '10.8.2');
      const activeTab = useTerminalStore.getState().tabs.find((t) => t.id === activeId);
      expect(activeTab?.output).toContain('10.8.2');

      store.clearTerminal(activeId);
      const clearedTab = useTerminalStore.getState().tabs.find((t) => t.id === activeId);
      expect(clearedTab?.output.length).toBe(0);
    });
  });

  describe('Debugger Store', () => {
    it('toggles breakpoints on line numbers', () => {
      const store = useDebuggerStore.getState();
      store.toggleBreakpoint('index.ts', 15);

      expect(useDebuggerStore.getState().breakpoints).toContainEqual({
        file: 'index.ts',
        line: 15,
        enabled: true
      });

      // Toggle off
      store.toggleBreakpoint('index.ts', 15);
      expect(useDebuggerStore.getState().breakpoints).not.toContainEqual({
        file: 'index.ts',
        line: 15,
        enabled: true
      });
    });

    it('manages debug session lifecycle: start, step, pause, stop', () => {
      const store = useDebuggerStore.getState();
      store.toggleBreakpoint('test.ts', 10);
      store.startDebugging('test.ts');

      const debugActive = useDebuggerStore.getState();
      expect(debugActive.isDebugging).toBe(true);
      expect(debugActive.isPaused).toBe(true);
      expect(debugActive.currentLine).toBe(10);
      expect(debugActive.variables.length).toBeGreaterThan(0);
      expect(debugActive.callStack.length).toBeGreaterThan(0);

      // Step over
      store.stepOver();
      expect(useDebuggerStore.getState().currentLine).toBe(11);

      // Stop
      store.stopDebugging();
      expect(useDebuggerStore.getState().isDebugging).toBe(false);
      expect(useDebuggerStore.getState().currentLine).toBeNull();
    });

    it('evaluates expressions in debug console REPL', () => {
      const store = useDebuggerStore.getState();
      store.evaluateExpression('5 * 20');

      const logs = useDebuggerStore.getState().consoleLogs;
      const lastOutput = logs[logs.length - 1];
      expect(lastOutput.text).toBe('100');
      expect(lastOutput.type).toBe('result');
    });
  });
});
