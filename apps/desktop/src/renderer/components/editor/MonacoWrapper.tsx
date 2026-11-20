import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useEditorStore } from '../../stores/useEditorStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useNotificationStore } from '../../stores/useNotificationStore';
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
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const activeTab = openTabs.find((t) => t.id === activeTabId);

  // Sync theme changes with Monaco instance dynamically
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(settings.theme || 'nexcode-dark');
    }
  }, [settings.theme]);

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
          quickSuggestions: { other: true, comments: false, strings: true }
        }}
      />
    </div>
  );
};
