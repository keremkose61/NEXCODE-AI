import { create } from 'zustand';

export interface Breakpoint {
  file: string;
  line: number;
  enabled: boolean;
}

export interface StackFrame {
  id: string;
  name: string;
  file: string;
  line: number;
}

export interface VariableItem {
  name: string;
  value: string;
  type: string;
}

export interface DebugConsoleLog {
  id: string;
  type: 'info' | 'warn' | 'error' | 'input' | 'result';
  text: string;
  timestamp: number;
}

interface DebuggerState {
  isDebugging: boolean;
  isPaused: boolean;
  currentLine: number | null;
  currentFile: string | null;
  breakpoints: Breakpoint[];
  callStack: StackFrame[];
  variables: VariableItem[];
  consoleLogs: DebugConsoleLog[];

  toggleBreakpoint: (file: string, line: number) => void;
  startDebugging: (file: string) => void;
  stopDebugging: () => void;
  pauseDebugging: () => void;
  resumeDebugging: () => void;
  stepOver: () => void;
  stepInto: () => void;
  stepOut: () => void;
  evaluateExpression: (expr: string) => void;
  clearConsole: () => void;
}

export const useDebuggerStore = create<DebuggerState>((set, get) => ({
  isDebugging: false,
  isPaused: false,
  currentLine: null,
  currentFile: null,
  breakpoints: [],
  callStack: [],
  variables: [],
  consoleLogs: [
    {
      id: 'log-welcome',
      type: 'info',
      text: 'NEXCODE AI Debugger Console ready. Press F5 to start session.',
      timestamp: Date.now()
    }
  ],

  toggleBreakpoint: (file, line) => {
    set((state) => {
      const existingIdx = state.breakpoints.findIndex(
        (b) => b.file === file && b.line === line
      );
      if (existingIdx >= 0) {
        return {
          breakpoints: state.breakpoints.filter((_, idx) => idx !== existingIdx)
        };
      } else {
        return {
          breakpoints: [...state.breakpoints, { file, line, enabled: true }]
        };
      }
    });
  },

  startDebugging: (file) => {
    const bps = get().breakpoints.filter((b) => b.file === file);
    const startLine = bps.length > 0 ? bps[0].line : 1;

    set({
      isDebugging: true,
      isPaused: true,
      currentFile: file,
      currentLine: startLine,
      callStack: [
        { id: 'frame-1', name: 'main()', file, line: startLine },
        { id: 'frame-2', name: '<anonymous>', file: 'bootstrap.js', line: 12 }
      ],
      variables: [
        { name: 'process.env.NODE_ENV', value: '"development"', type: 'string' },
        { name: 'currentFile', value: `"${file}"`, type: 'string' },
        { name: 'activeLine', value: String(startLine), type: 'number' },
        { name: 'status', value: '"paused_at_breakpoint"', type: 'string' }
      ],
      consoleLogs: [
        ...get().consoleLogs,
        {
          id: `log-${Date.now()}`,
          type: 'info',
          text: `[Debugger] Attached to runtime for ${file}. Breakpoint reached at line ${startLine}.`,
          timestamp: Date.now()
        }
      ]
    });
  },

  stopDebugging: () => {
    set({
      isDebugging: false,
      isPaused: false,
      currentLine: null,
      currentFile: null,
      callStack: [],
      variables: [],
      consoleLogs: [
        ...get().consoleLogs,
        {
          id: `log-${Date.now()}`,
          type: 'info',
          text: '[Debugger] Debug session terminated.',
          timestamp: Date.now()
        }
      ]
    });
  },

  pauseDebugging: () => {
    set({ isPaused: true });
  },

  resumeDebugging: () => {
    const { breakpoints, currentFile, currentLine } = get();
    const nextBp = breakpoints.find(
      (b) => b.file === currentFile && b.line > (currentLine || 0)
    );

    if (nextBp) {
      set((state) => ({
        isPaused: true,
        currentLine: nextBp.line,
        variables: state.variables.map((v) =>
          v.name === 'activeLine' ? { ...v, value: String(nextBp.line) } : v
        ),
        consoleLogs: [
          ...state.consoleLogs,
          {
            id: `log-${Date.now()}`,
            type: 'info',
            text: `Hit breakpoint at line ${nextBp.line}`,
            timestamp: Date.now()
          }
        ]
      }));
    } else {
      set((state) => ({
        isDebugging: false,
        isPaused: false,
        currentLine: null,
        consoleLogs: [
          ...state.consoleLogs,
          {
            id: `log-${Date.now()}`,
            type: 'info',
            text: 'Execution finished successfully.',
            timestamp: Date.now()
          }
        ]
      }));
    }
  },

  stepOver: () => {
    const { currentLine } = get();
    const next = (currentLine || 1) + 1;
    set((state) => ({
      currentLine: next,
      variables: state.variables.map((v) =>
        v.name === 'activeLine' ? { ...v, value: String(next) } : v
      ),
      callStack: state.callStack.map((f, i) =>
        i === 0 ? { ...f, line: next } : f
      )
    }));
  },

  stepInto: () => {
    const { currentLine } = get();
    const next = (currentLine || 1) + 1;
    set((state) => ({
      currentLine: next,
      callStack: [
        { id: `frame-${Date.now()}`, name: 'innerFunction()', file: state.currentFile || '', line: next },
        ...state.callStack
      ]
    }));
  },

  stepOut: () => {
    set((state) => ({
      callStack: state.callStack.length > 1 ? state.callStack.slice(1) : state.callStack,
      currentLine: (state.currentLine || 1) + 2
    }));
  },

  evaluateExpression: (expr) => {
    if (!expr.trim()) return;
    const inputLog: DebugConsoleLog = {
      id: `in-${Date.now()}`,
      type: 'input',
      text: expr,
      timestamp: Date.now()
    };

    let result = '';
    let resultType: 'result' | 'error' = 'result';

    try {
      // Evaluate within sandbox expression context
      const evaluated = eval(expr);
      result = typeof evaluated === 'object' ? JSON.stringify(evaluated) : String(evaluated);
    } catch (err: any) {
      result = `EvaluationError: ${err.message}`;
      resultType = 'error';
    }

    const outputLog: DebugConsoleLog = {
      id: `out-${Date.now()}`,
      type: resultType,
      text: result,
      timestamp: Date.now()
    };

    set((state) => ({
      consoleLogs: [...state.consoleLogs, inputLog, outputLog]
    }));
  },

  clearConsole: () => set({ consoleLogs: [] })
}));
