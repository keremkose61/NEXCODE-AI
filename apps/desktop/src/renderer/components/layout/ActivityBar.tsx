import React from 'react';
import { Files, Search, GitBranch, Boxes, Sparkles, Settings, ShieldCheck } from 'lucide-react';
import { useUIStore, LeftPanelTab } from '../../stores/useUIStore';

export const ActivityBar: React.FC = () => {
  const { activeLeftTab, setLeftTab, leftSidebarOpen } = useUIStore();

  const navItems: { id: LeftPanelTab; label: string; icon: React.ReactNode }[] = [
    { id: 'explorer', label: 'Explorer (Ctrl+Shift+E)', icon: <Files className="w-5 h-5" /> },
    { id: 'search', label: 'Search (Ctrl+Shift+F)', icon: <Search className="w-5 h-5" /> },
    { id: 'git', label: 'Source Control (Ctrl+Shift+G)', icon: <GitBranch className="w-5 h-5" /> },
    { id: 'extensions', label: 'Extensions (Ctrl+Shift+X)', icon: <Boxes className="w-5 h-5" /> },
    { id: 'ai-projects', label: 'AI Project Context', icon: <Sparkles className="w-5 h-5" /> }
  ];

  return (
    <aside className="w-12 bg-nexcode-950 border-r border-nexcode-800 flex flex-col justify-between py-2 items-center select-none z-40">
      {/* Top Nav Items */}
      <div className="flex flex-col space-y-1.5 w-full items-center">
        {navItems.map((item) => {
          const isActive = leftSidebarOpen && activeLeftTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setLeftTab(item.id)}
              title={item.label}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all relative ${
                isActive
                  ? 'text-indigo-400 bg-nexcode-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-nexcode-850'
              }`}
            >
              {item.icon}
              {isActive && (
                <div className="absolute left-0 w-0.5 h-5 bg-indigo-500 rounded-r" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Nav Items */}
      <div className="flex flex-col space-y-1.5 w-full items-center">
        <button
          title="Security & Isolation Active"
          className="w-10 h-10 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-nexcode-850 transition-colors"
        >
          <ShieldCheck className="w-5 h-5" />
        </button>
        <button
          title="Settings"
          className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-nexcode-850 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
