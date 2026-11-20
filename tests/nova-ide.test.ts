import { describe, it, expect } from 'vitest';
import { NOVA_DARK_THEME, NOVA_LIGHT_THEME } from '../packages/editor/src/index';
import { DEFAULT_SETTINGS, ThemeId } from '../packages/shared/src/index';

describe('NOVA IDE – Design System & Architecture Tests', () => {
  it('should have DEFAULT_SETTINGS set to nova-dark', () => {
    expect(DEFAULT_SETTINGS.theme).toBe('nova-dark');
  });

  it('should validate NOVA_DARK_THEME structure and neon accents', () => {
    expect(NOVA_DARK_THEME.base).toBe('vs-dark');
    expect(NOVA_DARK_THEME.colors['editor.background']).toBe('#0b0f19');
    expect(NOVA_DARK_THEME.colors['editorCursor.foreground']).toBe('#a855f7');
    expect(NOVA_DARK_THEME.colors['editorLineNumber.activeForeground']).toBe('#22d3ee');

    const keywordRule = NOVA_DARK_THEME.rules.find((r) => r.token === 'keyword');
    expect(keywordRule?.foreground).toBe('c084fc');

    const typeRule = NOVA_DARK_THEME.rules.find((r) => r.token === 'type');
    expect(typeRule?.foreground).toBe('22d3ee');
  });

  it('should validate NOVA_LIGHT_THEME structure and clear contrast', () => {
    expect(NOVA_LIGHT_THEME.base).toBe('vs');
    expect(NOVA_LIGHT_THEME.colors['editor.background']).toBe('#f8fafc');
    expect(NOVA_LIGHT_THEME.colors['editorCursor.foreground']).toBe('#7c3aed');

    const keywordRule = NOVA_LIGHT_THEME.rules.find((r) => r.token === 'keyword');
    expect(keywordRule?.foreground).toBe('7c3aed');
  });

  it('should allow valid ThemeIds including nova-dark and nova-light', () => {
    const validThemes: ThemeId[] = [
      'nova-dark',
      'nova-light',
      'nexcode-dark',
      'nexcode-black',
      'nexcode-nord'
    ];
    validThemes.forEach((t) => {
      expect(typeof t).toBe('string');
    });
  });
});