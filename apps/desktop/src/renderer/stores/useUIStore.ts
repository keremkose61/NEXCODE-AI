import { create } from 'zustand';

export type LeftPanelTab = 'explorer' | 'search' | 'git' | 'extensions' | 'ai-projects';
export type RightPanelTab = 'chat' | 'agent' | 'context';
export type BottomPanelTab = 'terminal' | 'problems' | 'output' | 'debug';

interface UIState {
  // Panel visibilities
  leftSidebarOpen: boolean;
  activeLeftTab: LeftPanelTab;
  rightSidebarOpen: boolean;
  activeRightTab: RightPanelTab;
  bottomPanelOpen: boolean;
  activeBottomTab: BottomPanelTab;

  // Resizable panel dimensions
  leftPanelWidth: number;
  rightPanelWidth: number;
  bottomPanelHeight: number;

  // Modals & Palettes
  isCommandPaletteOpen: boolean;
  isQuickOpenOpen: boolean;

  // Actions
  toggleLeftSidebar: () => void;
  setLeftTab: (tab: LeftPanelTab) => void;
  toggleRightSidebar: () => void;
  setRightTab: (tab: RightPanelTab) => void;
  toggleBottomPanel: () => void;
  setBottomTab: (tab: BottomPanelTab) => void;

  setLeftPanelWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;
  setBottomPanelHeight: (height: number) => void;

  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openQuickOpen: () => void;
  closeQuickOpen: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  leftSidebarOpen: true,
  activeLeftTab: 'explorer',
  rightSidebarOpen: true,
  activeRightTab: 'chat',
  bottomPanelOpen: true,
  activeBottomTab: 'terminal',

  leftPanelWidth: 260,
  rightPanelWidth: 340,
  bottomPanelHeight: 220,

  isCommandPaletteOpen: false,
  isQuickOpenOpen: false,

  toggleLeftSidebar: () => set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),
  setLeftTab: (tab) =>
    set((state) => ({
      activeLeftTab: tab,
      leftSidebarOpen: state.activeLeftTab === tab && state.leftSidebarOpen ? false : true
    })),

  toggleRightSidebar: () => set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),
  setRightTab: (tab) =>
    set((state) => ({
      activeRightTab: tab,
      rightSidebarOpen: state.activeRightTab === tab && state.rightSidebarOpen ? false : true
    })),

  toggleBottomPanel: () => set((state) => ({ bottomPanelOpen: !state.bottomPanelOpen })),
  setBottomTab: (tab) =>
    set((state) => ({
      activeBottomTab: tab,
      bottomPanelOpen: state.activeBottomTab === tab && state.bottomPanelOpen ? false : true
    })),

  setLeftPanelWidth: (w) => set({ leftPanelWidth: Math.max(180, Math.min(500, w)) }),
  setRightPanelWidth: (w) => set({ rightPanelWidth: Math.max(260, Math.min(600, w)) }),
  setBottomPanelHeight: (h) => set({ bottomPanelHeight: Math.max(120, Math.min(600, h)) }),

  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),

  openQuickOpen: () => set({ isQuickOpenOpen: true }),
  closeQuickOpen: () => set({ isQuickOpenOpen: false })
}));
