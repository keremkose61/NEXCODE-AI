export type AIMessageRole = 'user' | 'assistant' | 'system';

export type AIAssistantMode =
  | 'chat'
  | 'explain'
  | 'generate'
  | 'fix'
  | 'optimize'
  | 'convert'
  | 'error_analysis'
  | 'docgen'
  | 'testgen'
  | 'analyze_file'
  | 'analyze_selection'
  | 'project_context';

export interface AIChatSession {
  id: string;
  title: string;
  model: string;
  createdAt: number;
  updatedAt: number;
}

export interface AIChatMessage {
  id: string;
  sessionId?: string;
  role: AIMessageRole;
  content: string;
  timestamp: number;
  model?: string;
  mode?: AIAssistantMode;
  isStreaming?: boolean;
  contextFiles?: string[];
  tokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  latencyMs?: number;
}

export interface AIModel {
  name: string;
  displayName: string;
  size?: string;
  quantization?: string;
  family?: string;
  isAvailableLocally: boolean;
  description?: string;
  recommendedHardware?: string;
}

export interface OllamaStatusInfo {
  isInstalled: boolean;
  isRunning: boolean;
  version?: string;
  endpoint: string;
  modelsCount: number;
  hardwareDetected: {
    gpu: string | null;
    isAmd: boolean;
    isNvidia: boolean;
    cpuCores: number;
    ramGb: number;
    accelerationMode: 'CUDA' | 'ROCm' | 'CPU';
  };
}

export interface AgentTaskStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'requires_approval';
  targetFiles?: string[];
  commandPreview?: string;
  diffPreview?: string;
}

export interface AgentTask {
  id: string;
  goal: string;
  steps: AgentTaskStep[];
  status: 'planning' | 'running' | 'paused' | 'completed' | 'cancelled';
  createdAt: number;
}
