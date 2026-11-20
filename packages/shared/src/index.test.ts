import { describe, it, expect } from 'vitest';
import { IPC_CHANNELS, DEFAULT_SETTINGS } from './index';

describe('Shared Package Definitions', () => {
  it('defines valid IPC channels', () => {
    expect(IPC_CHANNELS.WINDOW_MINIMIZE).toBe('window:minimize');
    expect(IPC_CHANNELS.FS_READ_FILE).toBe('fs:read-file');
    expect(IPC_CHANNELS.AI_CHECK_STATUS).toBe('ai:check-status');
  });

  it('provides safe default IDE settings', () => {
    expect(DEFAULT_SETTINGS.telemetryEnabled).toBe(false);
    expect(DEFAULT_SETTINGS.ollamaEndpoint).toBe('http://localhost:11434');
    expect(DEFAULT_SETTINGS.minimap).toBe(true);
  });
});
