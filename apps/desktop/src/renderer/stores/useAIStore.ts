import { create } from 'zustand';
import { AIChatMessage, AIModel } from '@nexcode/shared';
import { useEditorStore } from './useEditorStore';

export const DEFAULT_MODELS: AIModel[] = [
  {
    name: 'qwen2.5-coder:7b',
    displayName: 'Qwen 2.5 Coder 7B (Default)',
    size: '4.7 GB',
    isAvailableLocally: false,
    description: 'High-precision coding, multi-language reasoning, low RAM footprint.',
    recommendedHardware: '8GB+ RAM / CPU or 6GB VRAM'
  },
  {
    name: 'deepseek-coder:6.7b',
    displayName: 'DeepSeek Coder 6.7B',
    size: '3.8 GB',
    isAvailableLocally: false,
    description: 'State of the art open code model, excellent project context comprehension.',
    recommendedHardware: '8GB+ RAM / CPU or GPU'
  },
  {
    name: 'llama3.2:3b',
    displayName: 'Llama 3.2 3B (Fast / Lightweight)',
    size: '2.0 GB',
    isAvailableLocally: false,
    description: 'Ultra-fast inference on CPU and standard laptops.',
    recommendedHardware: '4GB+ RAM / CPU'
  }
];

interface AIState {
  selectedModel: string;
  availableModels: AIModel[];
  isOllamaRunning: boolean;
  isOllamaInstalled: boolean;
  isFastApiRunning: boolean;
  hardware: {
    cpuModel: string;
    cpuCores: number;
    ramGb: number;
    isAmd: boolean;
    gpu: string;
    accelerationMode: string;
  };
  messages: AIChatMessage[];
  isThinking: boolean;
  isStreaming: boolean;
  streamingMessageId: string | null;

  setSelectedModel: (model: string) => void;
  checkLocalAIStatus: () => Promise<void>;
  sendMessage: (content: string, codeContext?: string) => Promise<void>;
  pullModel: (modelName: string) => Promise<boolean>;
  clearHistory: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  selectedModel: 'qwen2.5-coder:7b',
  availableModels: DEFAULT_MODELS,
  isOllamaRunning: false,
  isOllamaInstalled: false,
  isFastApiRunning: false,
  hardware: {
    cpuModel: 'Detecting...',
    cpuCores: 8,
    ramGb: 16,
    isAmd: false,
    gpu: 'Detecting local accelerator...',
    accelerationMode: 'CPU'
  },
  messages: [
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Hello! I am your **NEXCODE AI Assistant**.

I run **100% locally on your machine** via Ollama. No code leaves your computer.
You can ask me to:
- Explain active files or highlighted code
- Generate tests or optimize logic
- Scan project directories and assist with architecture

*Tip: Check the model selector in the top bar to verify your local Ollama connection status.*`,
      timestamp: Date.now()
    }
  ],
  isThinking: false,
  isStreaming: false,
  streamingMessageId: null,

  setSelectedModel: (model) => set({ selectedModel: model }),

  checkLocalAIStatus: async () => {
    if (!window.nexcode) return;
    try {
      const hw = await window.nexcode.app.getHardwareInfo();
      set({ hardware: hw });

      const aiStatus = await window.nexcode.ai.checkStatus();
      if (aiStatus) {
        set({
          isOllamaInstalled: aiStatus.isInstalled,
          isOllamaRunning: aiStatus.isRunning,
          isFastApiRunning: Boolean(aiStatus.engineOnline)
        });
      }

      // Query full model catalog from local backend
      const modelsList = await window.nexcode.ai.listModels();
      if (Array.isArray(modelsList) && modelsList.length > 0) {
        set({
          availableModels: modelsList.map((m: any) => ({
            name: m.name,
            displayName: m.display_name || m.name,
            size: m.size,
            isAvailableLocally: Boolean(m.is_available_locally),
            description: m.description,
            recommendedHardware: m.recommended_hardware
          }))
        });
      }
    } catch (err) {
      console.warn('AI status probe error:', err);
    }
  },

  sendMessage: async (userText: string, codeContext?: string) => {
    if (!userText.trim()) return;

    const userMsg: AIChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: Date.now()
    };

    const assistantMsgId = `msg-${Date.now() + 1}`;
    const initialAssistantMsg: AIChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      model: get().selectedModel,
      isStreaming: true
    };

    set((state) => ({
      messages: [...state.messages, userMsg, initialAssistantMsg],
      isThinking: true,
      isStreaming: true,
      streamingMessageId: assistantMsgId
    }));

    const { selectedModel, isOllamaRunning, hardware } = get();

    // Prepare context files from open editor tabs
    const openTabs = useEditorStore.getState().openTabs;
    const contextFiles = openTabs.map((t) => ({
      path: t.filePath,
      content: t.content
    }));

    try {
      if (window.nexcode) {
        const response = await window.nexcode.ai.sendChat({
          model: selectedModel,
          messages: [
            ...get().messages.filter((m) => m.id !== assistantMsgId).map((m) => ({
              role: m.role,
              content: m.content
            }))
          ],
          context_files: contextFiles,
          temperature: 0.2
        });

        if (response.success && response.data?.message) {
          const content = response.data.message.content;
          const usage = response.data.usage || {};

          // Simulate fluid token streaming for developer feedback
          let displayed = '';
          const words = content.split(' ');
          for (let i = 0; i < words.length; i++) {
            displayed += (i === 0 ? '' : ' ') + words[i];
            if (i % 3 === 0 || i === words.length - 1) {
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === assistantMsgId ? { ...m, content: displayed } : m
                )
              }));
              await new Promise((r) => setTimeout(r, 15));
            }
          }

          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content,
                    isStreaming: false,
                    tokens: usage.total_tokens,
                    promptTokens: usage.prompt_tokens,
                    completionTokens: usage.completion_tokens,
                    latencyMs: response.latencyMs
                  }
                : m
            ),
            isThinking: false,
            isStreaming: false,
            streamingMessageId: null
          }));
          return;
        }
      }
    } catch (err) {
      console.warn('Live chat query error, using offline guidance fallback:', err);
    }

    // Offline guidance fallback
    const fallbackText = !isOllamaRunning
      ? `⚠️ **Local AI Engine Offline**

Ollama was not detected at \`http://localhost:11434\`.

**How to activate your local AI:**
1. Download and install Ollama from [https://ollama.com](https://ollama.com).
2. Open PowerShell and run:
   \`\`\`bash
   ollama run ${selectedModel}
   \`\`\`
3. Once running, click **Recheck Status** above to start instant, private local coding assistance!

*Current Hardware Profile:*
- CPU: ${hardware.cpuModel} (${hardware.cpuCores} cores)
- RAM: ${hardware.ramGb} GB
- Accelerator: ${hardware.accelerationMode} (AMD/CPU Safe Mode)`
      : `Model \`${selectedModel}\` is ready and listening in your local workspace.`;

    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === assistantMsgId
          ? {
              ...m,
              content: fallbackText,
              isStreaming: false
            }
          : m
      ),
      isThinking: false,
      isStreaming: false,
      streamingMessageId: null
    }));
  },

  pullModel: async (modelName: string) => {
    if (!window.nexcode) return false;
    try {
      const res = await window.nexcode.ai.pullModel(modelName);
      return res.success;
    } catch {
      return false;
    }
  },

  clearHistory: () => {
    set({
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: 'Chat session cleared. How can I assist you with your code today?',
          timestamp: Date.now()
        }
      ]
    });
  }
}));
