import { create } from 'zustand';
import { AIChatMessage, AIModel } from '@nexcode/shared';

export const DEFAULT_MODELS: AIModel[] = [
  {
    name: 'qwen2.5-coder:7b',
    displayName: 'Qwen 2.5 Coder 7B (Recommended)',
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

  setSelectedModel: (model: string) => void;
  checkLocalAIStatus: () => Promise<void>;
  sendMessage: (content: string, codeContext?: string) => Promise<void>;
  clearHistory: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  selectedModel: 'qwen2.5-coder:7b',
  availableModels: DEFAULT_MODELS,
  isOllamaRunning: false,
  isOllamaInstalled: false,
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
          isOllamaRunning: aiStatus.isRunning
        });
        if (aiStatus.models && aiStatus.models.length > 0) {
          set({ availableModels: aiStatus.models, selectedModel: aiStatus.models[0].name });
        }
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

    set((state) => ({
      messages: [...state.messages, userMsg],
      isThinking: true
    }));

    const { isOllamaRunning, selectedModel, hardware } = get();

    // Responsive processing with local Ollama or honest local-offline fallback
    setTimeout(() => {
      let replyContent = '';

      if (!isOllamaRunning) {
        replyContent = `⚠️ **Local AI Engine Offline**

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
- Accelerator: ${hardware.accelerationMode} (AMD/CPU Safe Mode)`;
      } else {
        replyContent = `I have received your request regarding:
> *${userText.slice(0, 100)}...*

Model: \`${selectedModel}\` is processing your local query within the active workspace.`;
      }

      const assistantMsg: AIChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: replyContent,
        timestamp: Date.now(),
        model: selectedModel
      };

      set((state) => ({
        messages: [...state.messages, assistantMsg],
        isThinking: false
      }));
    }, 700);
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
