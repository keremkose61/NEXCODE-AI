import { create } from 'zustand';

export type LeftPanelTab = 'explorer' | 'search' | 'git' | 'extensions' | 'ai-projects';
export type RightPanelTab = 'chat' | 'agent' | 'context';
export type BottomPanelTab = 'terminal' | 'problems' | 'output' | 'debug';

interface UIState {
  leftSidebarOpen: boolean;
  activeLeftTab: LeftPanelTab;
  rightSidebarOpen: boolean;
  activeRightTab: RightPanelTab;
  bottomPanelOpen: boolean;
  activeBottomTab: BottomPanelTab;

  toggleLeftSidebar: () => void;
  setLeftTab: (tab: LeftPanelTab) => void;
  toggleRightSidebar: () => void;
  setRightTab: (tab: RightPanelTab) => void;
  toggleBottomPanel: () => void;
  setBottomTab: (tab: BottomPanelTab) => void;
}

export const useUIStore = create<UIState>((set) => ({
  leftSidebarOpen: true,
  activeLeftTab: 'explorer',
  rightSidebarOpen: true,
  activeRightTab: 'chat',
  bottomPanelOpen: true,
  activeBottomTab: 'terminal',

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
    }))
}));
