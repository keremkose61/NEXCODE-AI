import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useEditorStore } from '../../stores/useEditorStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { useUIStore } from '../../stores/useUIStore';
import { useAIStore } from '../../stores/useAIStore';
import { useDebuggerStore } from '../../stores/useDebuggerStore';
import {
  NEXCODE_DARK_THEME,
  NEXCODE_BLACK_THEME,
  NEXCODE_NORD_THEME,
  COMMON_SNIPPETS
} from '@nexcode/editor';

export const MonacoWrapper: React.FC = () => {
  const { openTabs, activeTabId, updateContent, setCursorPosition, saveCurrentFile } =
    useEditorStore();
  const { settings } = useSettingsStore();
  const { addNotification } = useNotificationStore();
  const { openInlineAI, setRightTab, setBottomTab } = useUIStore();
  const { sendMessage } = useAIStore();
  const {
    breakpoints,
    toggleBreakpoint,
    currentLine,
    currentFile,
    isDebugging,
    isPaused,
    startDebugging,
    resumeDebugging
  } = useDebuggerStore();

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  const activeTab = openTabs.find((t) => t.id === activeTabId);

  // Sync theme changes with Monaco instance dynamically
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(settings.theme || 'nexcode-dark');
    }
  }, [settings.theme]);

  // Sync Breakpoint & Debugger Line Highlights
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !activeTab) return;
    const monaco = monacoRef.current;
    const editor = editorRef.current;

    const fileBreakpoints = breakpoints.filter((b) => b.file === activeTab.fileName);
    const newDecorations: any[] = [];

    // Red breakpoint circle in glyph margin
    fileBreakpoints.forEach((b) => {
      newDecorations.push({
        range: new monaco.Range(b.line, 1, b.line, 1),
        options: {
          isWholeLine: false,
          glyphMarginClassName: 'myBreakpointGlyph',
          glyphMarginHoverMessage: { value: `Breakpoint at line ${b.line}` }
        }
      });
    });

    // Amber highlight on active debug paused line
    if (isDebugging && currentLine && currentFile === activeTab.fileName) {
      newDecorations.push({
        range: new monaco.Range(currentLine, 1, currentLine, 1),
        options: {
          isWholeLine: true,
          className: 'debugCurrentLineHighlight'
        }
      });
    }

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  }, [breakpoints, currentLine, currentFile, isDebugging, activeTab]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define custom NEXCODE themes
    monaco.editor.defineTheme('nexcode-dark', NEXCODE_DARK_THEME as any);
    monaco.editor.defineTheme('nexcode-black', NEXCODE_BLACK_THEME as any);
    monaco.editor.defineTheme('nexcode-nord', NEXCODE_NORD_THEME as any);

    monaco.editor.setTheme(settings.theme || 'nexcode-dark');

    // Register snippet completion providers for TypeScript, Python, Rust
    Object.entries(COMMON_SNIPPETS).forEach(([lang, snippets]) => {
      monaco.languages.registerCompletionItemProvider(lang, {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          };

          const suggestions = snippets.map((s) => ({
            label: s.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: s.doc,
            insertText: s.snippet,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range
          }));

          return { suggestions };
        }
      });
    });

    // Track cursor movements for the status bar
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition(e.position.lineNumber, e.position.column);
    });

    // Toggle Breakpoint on Gutter / Margin Click
    editor.onMouseDown((e) => {
      if (
        e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN ||
        e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS
      ) {
        const line = e.target.position?.lineNumber;
        if (line && activeTab) {
          toggleBreakpoint(activeTab.fileName, line);
        }
      }
    });

    // Keyboard shortcut for saving (Ctrl+S)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
      await saveCurrentFile();
      addNotification({ type: 'success', message: 'File saved successfully.' });
    });

    // Format Document command (Shift+Alt+F)
    editor.addCommand(
      monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
      () => {
        editor.getAction('editor.action.formatDocument')?.run();
        addNotification({ type: 'info', message: 'Formatted document.' });
      }
    );

    // Find and Replace shortcut (Ctrl+H)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
      editor.getAction('editor.action.startFindReplaceAction')?.run();
    });

    // Inline AI Trigger Helper
    const triggerInlineAI = () => {
      const selection = editor.getSelection();
      let text = '';
      let range = undefined;
      if (selection && !selection.isEmpty()) {
        text = editor.getModel()?.getValueInRange(selection) || '';
        range = {
          startLineNumber: selection.startLineNumber,
          startColumn: selection.startColumn,
          endLineNumber: selection.endLineNumber,
          endColumn: selection.endColumn
        };
      } else {
        const pos = editor.getPosition();
        if (pos) {
          const lineContent = editor.getModel()?.getLineContent(pos.lineNumber) || '';
          text = lineContent;
          range = {
            startLineNumber: pos.lineNumber,
            startColumn: 1,
            endLineNumber: pos.lineNumber,
            endColumn: lineContent.length + 1
          };
        }
      }
      openInlineAI({ text, range });
    };

    // Keyboard shortcut: Ctrl+K for Inline AI Edit
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      triggerInlineAI();
    });

    // F5: Start / Continue Debugger
    editor.addCommand(monaco.KeyCode.F5, () => {
      const debugState = useDebuggerStore.getState();
      if (!debugState.isDebugging) {
        setBottomTab('debug');
        startDebugging(activeTab?.fileName || 'index.ts');
      } else if (debugState.isPaused) {
        resumeDebugging();
      }
    });

    // Context Menu AI Actions
    editor.addAction({
      id: 'nexcode.ai.inline',
      label: 'NEXCODE AI: Inline Edit (Ctrl+K)',
      contextMenuGroupId: '1_ai_assist',
      contextMenuOrder: 1,
      run: () => triggerInlineAI()
    });

    editor.addAction({
      id: 'nexcode.ai.explain',
      label: 'NEXCODE AI: Explain Code',
      contextMenuGroupId: '1_ai_assist',
      contextMenuOrder: 2,
      run: () => {
        const sel = editor.getSelection();
        const text = sel ? editor.getModel()?.getValueInRange(sel) : '';
        setRightTab('chat');
        sendMessage('Explain this code step-by-step with complexity analysis:', text, 'explain');
      }
    });

    editor.addAction({
      id: 'nexcode.ai.fix',
      label: 'NEXCODE AI: Fix Bugs & Issues',
      contextMenuGroupId: '1_ai_assist',
      contextMenuOrder: 3,
      run: () => {
        const sel = editor.getSelection();
        const text = sel ? editor.getModel()?.getValueInRange(sel) : '';
        setRightTab('chat');
        sendMessage('Find bugs, logic flaws and potential memory leaks in this code:', text, 'fix');
      }
    });

    editor.addAction({
      id: 'nexcode.ai.optimize',
      label: 'NEXCODE AI: Optimize Performance',
      contextMenuGroupId: '1_ai_assist',
      contextMenuOrder: 4,
      run: () => {
        const sel = editor.getSelection();
        const text = sel ? editor.getModel()?.getValueInRange(sel) : '';
        setRightTab('chat');
        sendMessage('Optimize this code for lower memory allocations and faster execution:', text, 'optimize');
      }
    });

    editor.addAction({
      id: 'nexcode.ai.generate-tests',
      label: 'NEXCODE AI: Generate Unit Tests',
      contextMenuGroupId: '1_ai_assist',
      contextMenuOrder: 5,
      run: () => {
        const sel = editor.getSelection();
        const text = sel ? editor.getModel()?.getValueInRange(sel) : '';
        setRightTab('chat');
        sendMessage('Generate high-coverage unit tests covering edge cases:', text, 'testgen');
      }
    });

    editor.addAction({
      id: 'nexcode.ai.docgen',
      label: 'NEXCODE AI: Add Documentation',
      contextMenuGroupId: '1_ai_assist',
      contextMenuOrder: 6,
      run: () => {
        const sel = editor.getSelection();
        const text = sel ? editor.getModel()?.getValueInRange(sel) : '';
        setRightTab('chat');
        sendMessage('Generate comprehensive documentation/docstrings for this code:', text, 'docgen');
      }
    });

    editor.addAction({
      id: 'nexcode.debug.toggle-bp',
      label: 'Toggle Breakpoint (F9)',
      contextMenuGroupId: '9_debug',
      contextMenuOrder: 1,
      run: () => {
        const pos = editor.getPosition();
        if (pos && activeTab) {
          toggleBreakpoint(activeTab.fileName, pos.lineNumber);
        }
      }
    });
  };

  if (!activeTab) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-nexcode-950 text-slate-500 text-xs">
        <p className="text-base font-semibold text-slate-400">NEXCODE AI Editor</p>
        <p className="mt-1">Select a file from the explorer or create a new tab to start coding.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full relative overflow-hidden bg-nexcode-950">
      <Editor
        key={activeTab.id}
        height="100%"
        width="100%"
        language={activeTab.language || 'typescript'}
        value={activeTab.content}
        theme={settings.theme || 'nexcode-dark'}
        onChange={(val) => updateContent(activeTab.id, val || '')}
        onMount={handleEditorDidMount}
        options={{
          fontSize: settings.fontSize,
          fontFamily: settings.fontFamily,
          fontLigatures: true,
          glyphMargin: true,
          minimap: { enabled: settings.minimap, side: 'right' },
          automaticLayout: true,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          renderLineHighlight: 'all',
          padding: { top: 12, bottom: 12 },
          scrollBeyondLastLine: false,
          tabSize: settings.tabSize,
          lineNumbers: 'on',
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true, indentation: true },
          wordWrap: settings.wordWrap,
          folding: true,
          foldingHighlight: true,
          multiCursorModifier: 'alt',
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          quickSuggestions: { other: true, comments: false, strings: true },
          contextmenu: true
        }}
      />
    </div>
  );
};
