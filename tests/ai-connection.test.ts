import { describe, it, expect } from 'vitest';
import { useAIStore, DEFAULT_MODELS } from '../apps/desktop/src/renderer/stores/useAIStore';

describe('Local AI & Ollama Live Integration (PHASE 5)', () => {
  it('provides default open-weight coding models catalog', () => {
    expect(DEFAULT_MODELS.length).toBeGreaterThanOrEqual(3);
    const names = DEFAULT_MODELS.map((m) => m.name);
    expect(names).toContain('qwen2.5-coder:7b');
    expect(names).toContain('deepseek-coder:6.7b');
    expect(names).toContain('llama3.2:3b');
  });

  it('allows model selection updates', () => {
    const store = useAIStore.getState();
    store.setSelectedModel('deepseek-coder:6.7b');
    expect(useAIStore.getState().selectedModel).toBe('deepseek-coder:6.7b');

    store.setSelectedModel('qwen2.5-coder:7b');
    expect(useAIStore.getState().selectedModel).toBe('qwen2.5-coder:7b');
  });

  it('manages chat history and clear history', () => {
    const store = useAIStore.getState();
    expect(store.messages.length).toBeGreaterThan(0);

    store.clearHistory();
    const updated = useAIStore.getState().messages;
    expect(updated.length).toBe(1);
    expect(updated[0].role).toBe('assistant');
  });
});
