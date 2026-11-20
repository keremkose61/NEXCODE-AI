import React from 'react';
import { Files, Search, GitBranch, Boxes, Sparkles, Settings, ShieldCheck } from 'lucide-react';
import { useUIStore, LeftPanelTab } from '../../stores/useUIStore';
import { useSettingsStore } from '../../stores/useSettingsStore';

export const ActivityBar: React.FC = () => {
  const { activeLeftTab, setLeftTab, leftSidebarOpen, toggleLeftSidebar } = useUIStore();
  const { settings, openSettingsModal } = useSettingsStore();

  const isLight = settings.theme === 'nova-light';

  const navItems: { id: LeftPanelTab; label: string; icon: React.ReactNode }[] = [
    { id: 'explorer', label: 'Proje Gezgini (Ctrl+Shift+E)', icon: <Files className="w-5 h-5" /> },
    { id: 'search', label: 'Projede Ara (Ctrl+Shift+F)', icon: <Search className="w-5 h-5" /> },
    { id: 'git', label: 'Kaynak Kontrolü - Git (Ctrl+Shift+G)', icon: <GitBranch className="w-5 h-5" /> },
    { id: 'extensions', label: 'Eklentiler (Ctrl+Shift+X)', icon: <Boxes className="w-5 h-5" /> },
    { id: 'ai-projects', label: 'AI Proje Bağlamı & RAG', icon: <Sparkles className="w-5 h-5" /> }
  ];

  const handleNavClick = (id: LeftPanelTab) => {
    if (activeLeftTab === id && leftSidebarOpen) {
      toggleLeftSidebar();
    } else {
      if (!leftSidebarOpen) toggleLeftSidebar();
      setLeftTab(id);
    }
  };

  return (
    <aside
      className={`w-12 border-r flex flex-col justify-between py-2 items-center select-none z-40 transition-colors ${
        isLight
          ? 'bg-slate-100 border-slate-200 text-slate-600'
          : 'bg-[#080a10] border-[#1c2438] text-slate-400'
      }`}
    >
      {/* Üst Navigasyon Butonları */}
      <div className="flex flex-col space-y-1.5 w-full items-center">
        {navItems.map((item) => {
          const isActive = leftSidebarOpen && activeLeftTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={item.label}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
                isActive
                  ? isLight
                    ? 'text-purple-600 bg-white shadow-sm border border-purple-200'
                    : 'text-cyan-300 bg-[#121727] shadow-[0_0_12px_rgba(6,182,212,0.25)] border border-cyan-500/30'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/70'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#121727]'
              }`}
            >
              {item.icon}
              {isActive && (
                <div className="absolute left-0 w-0.5 h-5 bg-gradient-to-b from-purple-500 to-cyan-400 rounded-r shadow-[0_0_6px_#06b6d4]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Alt Güvenlik ve Ayarlar */}
      <div className="flex flex-col space-y-1.5 w-full items-center">
        <button
          title="Yerel ve Güvenli AI İzolasyonu: Sıfır Bulut Telemetrisi"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-5 h-5 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
        </button>
        <button
          onClick={openSettingsModal}
          title="Ayarlar (Ctrl+,)"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
            isLight
              ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/70'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#121727]'
          }`}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};