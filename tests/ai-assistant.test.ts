import { describe, it, expect } from 'vitest';
import { useAIStore, ASSISTANT_MODES } from '../apps/desktop/src/renderer/stores/useAIStore';
import { useUIStore } from '../apps/desktop/src/renderer/stores/useUIStore';
import { useEditorStore } from '../apps/desktop/src/renderer/stores/useEditorStore';

describe('AI Assistant & 12 Modes (PHASE 6)', () => {
  it('defines all 12 required AI Assistant modes', () => {
    expect(ASSISTANT_MODES.length).toBe(12);
    const modeNames = ASSISTANT_MODES.map((m) => m.mode);
    expect(modeNames).toEqual([
      'chat',
      'explain',
      'generate',
      'fix',
      'optimize',
      'convert',
      'error_analysis',
      'docgen',
      'testgen',
      'analyze_file',
      'analyze_selection',
      'project_context'
    ]);
  });

  it('allows switching active assistant mode', () => {
    const aiStore = useAIStore.getState();
    expect(aiStore.activeMode).toBe('chat');

    aiStore.setActiveMode('testgen');
    expect(useAIStore.getState().activeMode).toBe('testgen');

    aiStore.setActiveMode('optimize');
    expect(useAIStore.getState().activeMode).toBe('optimize');

    aiStore.setActiveMode('chat');
  });

  it('controls Inline AI bar state and captures code selection', () => {
    const uiStore = useUIStore.getState();
    expect(uiStore.isInlineAIOpen).toBe(false);

    uiStore.openInlineAI({
      text: 'const x = 10;',
      range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 14 }
    });

    const openedState = useUIStore.getState();
    expect(openedState.isInlineAIOpen).toBe(true);
    expect(openedState.inlineAIContext?.text).toBe('const x = 10;');
    expect(openedState.inlineAIContext?.range?.startLineNumber).toBe(1);

    uiStore.closeInlineAI();
    expect(useUIStore.getState().isInlineAIOpen).toBe(false);
    expect(useUIStore.getState().inlineAIContext).toBeNull();
  });

  it('applies code replacement in editor store with range bounds', () => {
    const editorStore = useEditorStore.getState();
    const testContent = 'function hello() {\n  return 1;\n}';
    editorStore.openFile({ path: 'test.ts', name: 'test.ts', content: testContent });

    // Replace line 2
    editorStore.applyCodeReplacement('  return 42;', {
      startLineNumber: 2,
      startColumn: 1,
      endLineNumber: 2,
      endColumn: 12
    });

    const activeTab = useEditorStore.getState().openTabs.find((t) => t.filePath === 'test.ts');
    expect(activeTab?.content).toContain('return 42;');
    expect(activeTab?.isDirty).toBe(true);
  });
});
