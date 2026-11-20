import { describe, it, expect } from 'vitest';
import { useUIStore } from '../apps/desktop/src/renderer/stores/useUIStore';
import { useSettingsStore } from '../apps/desktop/src/renderer/stores/useSettingsStore';
import { useNotificationStore } from '../apps/desktop/src/renderer/stores/useNotificationStore';

describe('UI & Layout Stores (PHASE 2)', () => {
  it('toggles sidebars and panels correctly', () => {
    const { leftSidebarOpen, toggleLeftSidebar } = useUIStore.getState();
    toggleLeftSidebar();
    expect(useUIStore.getState().leftSidebarOpen).toBe(!leftSidebarOpen);
  });

  it('clamps resizable panel dimensions within safe boundaries', () => {
    const { setLeftPanelWidth, setRightPanelWidth, setBottomPanelHeight } = useUIStore.getState();

    // Left panel min 180, max 500
    setLeftPanelWidth(50);
    expect(useUIStore.getState().leftPanelWidth).toBe(180);
    setLeftPanelWidth(1000);
    expect(useUIStore.getState().leftPanelWidth).toBe(500);

    // Right panel min 260, max 600
    setRightPanelWidth(100);
    expect(useUIStore.getState().rightPanelWidth).toBe(260);

    // Bottom panel min 120, max 600
    setBottomPanelHeight(50);
    expect(useUIStore.getState().bottomPanelHeight).toBe(120);
  });

  it('manages settings and resets to defaults', () => {
    const { updateSettings, resetSettings } = useSettingsStore.getState();
    updateSettings({ fontSize: 18, tabSize: 4 });
    expect(useSettingsStore.getState().settings.fontSize).toBe(18);
    expect(useSettingsStore.getState().settings.tabSize).toBe(4);

    resetSettings();
    expect(useSettingsStore.getState().settings.fontSize).toBe(14);
    expect(useSettingsStore.getState().settings.tabSize).toBe(2);
  });

  it('adds and removes toast notifications', () => {
    const { addNotification, removeNotification } = useNotificationStore.getState();
    addNotification({ type: 'success', message: 'Test notification', duration: 0 });

    const notifications = useNotificationStore.getState().notifications;
    expect(notifications.length).toBeGreaterThan(0);
    const id = notifications[notifications.length - 1].id;

    removeNotification(id);
    expect(useNotificationStore.getState().notifications.find((n) => n.id === id)).toBeUndefined();
  });
});
