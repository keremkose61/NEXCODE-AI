export type ThemeId = 'nova-dark' | 'nova-light' | 'nexcode-dark' | 'nexcode-black' | 'nexcode-nord';

export interface IDESettings {
  theme: ThemeId;
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: 'on' | 'off' | 'wordWrapColumn';
  minimap: boolean;
  formatOnSave: boolean;
  selectedModel: string;
  ollamaEndpoint: string;
  telemetryEnabled: boolean;
}

export const DEFAULT_SETTINGS: IDESettings = {
  theme: 'nova-dark',
  fontSize: 14,
  fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', Consolas, monospace",
  tabSize: 2,
  wordWrap: 'on',
  minimap: true,
  formatOnSave: true,
  selectedModel: 'qwen2.5-coder:7b',
  ollamaEndpoint: 'http://localhost:11434',
  telemetryEnabled: false
};
