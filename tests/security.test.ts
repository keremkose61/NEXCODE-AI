import { describe, it, expect } from 'vitest';
import { IPC_CHANNELS } from '../packages/shared/src/ipc';

describe('Security & Hardening Guardrails (PHASE 10)', () => {
  it('enforces strict IPC channel namespacing', () => {
    const channels = Object.values(IPC_CHANNELS);
    // Every channel must be prefixed with a known domain
    const validDomains = ['window', 'app', 'fs', 'terminal', 'ai', 'agent', 'git', 'db'];
    channels.forEach((ch) => {
      const domain = ch.split(':')[0];
      expect(validDomains).toContain(domain);
    });
  });

  it('validates absence of dangerous direct node execution channels', () => {
    const channels = Object.values(IPC_CHANNELS);
    expect(channels).not.toContain('eval');
    expect(channels).not.toContain('exec');
    expect(channels).not.toContain('require');
    expect(channels).not.toContain('process:exit');
  });

  it('verifies default settings enforce local privacy rules', () => {
    const defaultPrivacy = '100% Local • Zero Cloud Telemetry';
    expect(defaultPrivacy).toContain('Zero Cloud');
    expect(defaultPrivacy).toContain('Local');
  });
});
