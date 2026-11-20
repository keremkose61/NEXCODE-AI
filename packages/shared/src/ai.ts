export type AIMessageRole = 'user' | 'assistant' | 'system';

export interface AIChatMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  timestamp: number;
  model?: string;
  isStreaming?: boolean;
  contextFiles?: string[];
  tokens?: number;
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
