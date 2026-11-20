import { create } from 'zustand';
import { AIChatMessage, AIModel, AIAssistantMode, AIChatSession } from '@nexcode/shared';
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

export const ASSISTANT_MODES: { mode: AIAssistantMode; label: string; description: string; icon: string }[] = [
  { mode: 'chat', label: 'Chat', description: 'General coding assistant & architecture discussion', icon: '💬' },
  { mode: 'explain', label: 'Explain', description: 'Step-by-step logic and complexity breakdown', icon: '💡' },
  { mode: 'generate', label: 'Generate', description: 'Create production-ready code with types', icon: '✨' },
  { mode: 'fix', label: 'Fix Bugs', description: 'Identify bugs and edge cases with corrected code', icon: '🐞' },
  { mode: 'optimize', label: 'Optimize', description: 'Enhance algorithmic efficiency and memory footprint', icon: '⚡' },
  { mode: 'convert', label: 'Convert', description: 'Translate code into target language conventions', icon: '🔄' },
  { mode: 'error_analysis', label: 'Error Analysis', description: 'Diagnose runtime errors and stack traces', icon: '🩺' },
  { mode: 'docgen', label: 'Documentation', description: 'Generate JSDoc/docstrings and usage guides', icon: '📝' },
  { mode: 'testgen', label: 'Unit Tests', description: 'High-coverage happy/edge/error case test suites', icon: '🧪' },
  { mode: 'analyze_file', label: 'Analyze File', description: 'SOLID principles and maintainability review', icon: '📄' },
  { mode: 'analyze_selection', label: 'Selection', description: 'Focused review of highlighted code fragment', icon: '🎯' },
  { mode: 'project_context', label: 'Project Context', description: 'Codebase-wide multi-file awareness and synthesis', icon: '🌐' }
];

const getAPI = () => (typeof window !== 'undefined' ? window.nexcode : undefined);

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
  sessions: AIChatSession[];
  currentSessionId: string | null;
  activeMode: AIAssistantMode;
  messages: AIChatMessage[];
  isThinking: boolean;
  isStreaming: boolean;
  streamingMessageId: string | null;

  setSelectedModel: (model: string) => void;
  setActiveMode: (mode: AIAssistantMode) => void;
  checkLocalAIStatus: () => Promise<void>;
  loadSessions: () => Promise<void>;
  createNewSession: (title?: string) => Promise<AIChatSession | null>;
  switchSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  sendMessage: (content: string, codeContext?: string, mode?: AIAssistantMode) => Promise<void>;
  pullModel: (modelName: string) => Promise<boolean>;
  clearHistory: () => Promise<void>;
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
  sessions: [],
  currentSessionId: null,
  activeMode: 'chat',
  messages: [
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Hello! I am your **NEXCODE AI Assistant**.

I run **100% locally on your machine** via Ollama. No code leaves your computer.
You have access to 12 specialized modes:
- **Explain**, **Fix**, **Optimize**, **Generate**, **Convert**
- **Test Generation**, **Documentation**, **Error Analysis**
- **File Analysis**, **Selection Analysis**, **Project Context Awareness**

*Tip: Press \`Ctrl+K\` in the editor for instant Inline AI code modifications.*`,
      timestamp: Date.now()
    }
  ],
  isThinking: false,
  isStreaming: false,
  streamingMessageId: null,

  setSelectedModel: (model) => set({ selectedModel: model }),
  setActiveMode: (mode) => set({ activeMode: mode }),

  loadSessions: async () => {
    const api = getAPI();
    if (!api) return;
    try {
      const sessions = await api.db.getChatSessions();
      if (sessions && sessions.length > 0) {
        const activeId = get().currentSessionId || sessions[0].id;
        set({ sessions, currentSessionId: activeId });
        const messages = await api.db.getChatMessages(activeId);
        if (messages && messages.length > 0) {
          set({ messages });
        }
      } else {
        const initial = await api.db.createChatSession('Welcome Session', get().selectedModel);
        set({ sessions: [initial], currentSessionId: initial.id });
        const welcome = get().messages[0];
        if (welcome) {
          await api.db.saveChatMessage(initial.id, welcome);
        }
      }
    } catch (err) {
      console.warn('Failed to load chat sessions:', err);
    }
  },

  createNewSession: async (title = 'New Conversation') => {
    const api = getAPI();
    if (!api) return null;
    try {
      const session = await api.db.createChatSession(title, get().selectedModel);
      const newWelcome: AIChatMessage = {
        id: `msg-${Date.now()}`,
        sessionId: session.id,
        role: 'assistant',
        content: `Started new session: **${title}**\n\nHow can I help you build with local AI today?`,
        timestamp: Date.now()
      };
      await api.db.saveChatMessage(session.id, newWelcome);

      set((state) => ({
        sessions: [session, ...state.sessions],
        currentSessionId: session.id,
        messages: [newWelcome]
      }));
      return session;
    } catch (err) {
      console.error('Failed to create new session:', err);
      return null;
    }
  },

  switchSession: async (sessionId: string) => {
    const api = getAPI();
    if (!api) return;
    try {
      const messages = await api.db.getChatMessages(sessionId);
      set({ currentSessionId: sessionId, messages: messages || [] });
    } catch (err) {
      console.warn('Failed to switch chat session:', err);
    }
  },

  deleteSession: async (sessionId: string) => {
    const api = getAPI();
    if (!api) return;
    try {
      await api.db.deleteChatSession(sessionId);
      const remaining = get().sessions.filter((s) => s.id !== sessionId);
      if (remaining.length > 0) {
        set({ sessions: remaining, currentSessionId: remaining[0].id });
        const msgs = await api.db.getChatMessages(remaining[0].id);
        set({ messages: msgs || [] });
      } else {
        await get().createNewSession('General Chat');
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  },

  checkLocalAIStatus: async () => {
    const api = getAPI();
    if (!api) return;
    try {
      const hw = await api.app.getHardwareInfo();
      set({ hardware: hw });

      const aiStatus = await api.ai.checkStatus();
      if (aiStatus) {
        set({
          isOllamaInstalled: aiStatus.isInstalled,
          isOllamaRunning: aiStatus.isRunning,
          isFastApiRunning: Boolean(aiStatus.engineOnline)
        });
      }

      const modelsList = await api.ai.listModels();
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

      await get().loadSessions();
    } catch (err) {
      console.warn('AI status probe error:', err);
    }
  },

  sendMessage: async (userText: string, codeContext?: string, mode?: AIAssistantMode) => {
    if (!userText.trim()) return;

    const currentMode = mode || get().activeMode;
    const api = getAPI();
    let sessionId = get().currentSessionId;
    if (!sessionId && api) {
      const newSession = await get().createNewSession();
      sessionId = newSession?.id || null;
    }

    const userMsg: AIChatMessage = {
      id: `msg-${Date.now()}`,
      sessionId: sessionId || undefined,
      role: 'user',
      content: codeContext ? `${userText}\n\n\`\`\`\n${codeContext}\n\`\`\`` : userText,
      timestamp: Date.now(),
      mode: currentMode
    };

    const assistantMsgId = `msg-${Date.now() + 1}`;
    const initialAssistantMsg: AIChatMessage = {
      id: assistantMsgId,
      sessionId: sessionId || undefined,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      model: get().selectedModel,
      mode: currentMode,
      isStreaming: true
    };

    if (api && sessionId) {
      api.db.saveChatMessage(sessionId, userMsg);
    }

    set((state) => ({
      messages: [...state.messages, userMsg, initialAssistantMsg],
      isThinking: true,
      isStreaming: true,
      streamingMessageId: assistantMsgId
    }));

    const { selectedModel, isOllamaRunning, hardware } = get();

    const openTabs = useEditorStore.getState().openTabs;
    const contextFiles = openTabs.map((t) => ({
      path: t.filePath,
      content: t.content
    }));

    try {
      if (api) {
        const response = await api.ai.sendChat({
          model: selectedModel,
          mode: currentMode,
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

          const finalizedAssistantMsg: AIChatMessage = {
            id: assistantMsgId,
            sessionId: sessionId || undefined,
            role: 'assistant',
            content,
            timestamp: Date.now(),
            model: selectedModel,
            mode: currentMode,
            isStreaming: false,
            tokens: usage.total_tokens,
            promptTokens: usage.prompt_tokens,
            completionTokens: usage.completion_tokens,
            latencyMs: response.latencyMs
          };

          if (api && sessionId) {
            api.db.saveChatMessage(sessionId, finalizedAssistantMsg);
          }

          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === assistantMsgId ? finalizedAssistantMsg : m
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

    const fallbackText = !isOllamaRunning
      ? `⚠️ **Local AI Engine Offline**

Ollama was not detected at \`http://localhost:11434\`.

**How to activate your local AI:**
1. Download and install Ollama from [https://ollama.com](https://ollama.com).
2. Open PowerShell and run:
   \`\`\`bash
   ollama run ${selectedModel}
   \`\`\`
3. Once running, click **Sync Status** above to start instant, private local coding assistance!

*Current Hardware Profile:*
- CPU: ${hardware.cpuModel} (${hardware.cpuCores} cores)
- RAM: ${hardware.ramGb} GB
- Accelerator: ${hardware.accelerationMode} (AMD/CPU Safe Mode)`
      : `Model \`${selectedModel}\` is ready and listening in your local workspace.`;

    const fallbackAssistantMsg: AIChatMessage = {
      id: assistantMsgId,
      sessionId: sessionId || undefined,
      role: 'assistant',
      content: fallbackText,
      timestamp: Date.now(),
      model: selectedModel,
      mode: currentMode,
      isStreaming: false
    };

    if (api && sessionId) {
      api.db.saveChatMessage(sessionId, fallbackAssistantMsg);
    }

    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === assistantMsgId ? fallbackAssistantMsg : m
      ),
      isThinking: false,
      isStreaming: false,
      streamingMessageId: null
    }));
  },

  pullModel: async (modelName: string) => {
    const api = getAPI();
    if (!api) return false;
    try {
      const res = await api.ai.pullModel(modelName);
      return res.success;
    } catch {
      return false;
    }
  },

  clearHistory: async () => {
    const api = getAPI();
    const { currentSessionId } = get();
    if (api && currentSessionId) {
      await api.db.clearChatSession(currentSessionId);
    }
    set({
      messages: [
        {
          id: `msg-${Date.now()}`,
          sessionId: currentSessionId || undefined,
          role: 'assistant',
          content: 'Chat session cleared. How can I assist you with your code today?',
          timestamp: Date.now()
        }
      ]
    });
  }
}));
