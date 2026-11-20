import { create } from 'zustand';
import { IDESettings, DEFAULT_SETTINGS } from '@nexcode/shared';

interface SettingsState {
  settings: IDESettings;
  isSettingsModalOpen: boolean;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  updateSettings: (partial: Partial<IDESettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: { ...DEFAULT_SETTINGS },
  isSettingsModalOpen: false,

  openSettingsModal: () => set({ isSettingsModalOpen: true }),
  closeSettingsModal: () => set({ isSettingsModalOpen: false }),

  updateSettings: (partial) =>
    set((state) => ({
      settings: { ...state.settings, ...partial }
    })),

  resetSettings: () => set({ settings: { ...DEFAULT_SETTINGS } })
}));
