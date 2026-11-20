import React from 'react';
import {
  GitBranch,
  XCircle,
  AlertTriangle,
  Cpu,
  Sparkles,
  Terminal,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';
import { useAIStore } from '../../stores/useAIStore';
import { useUIStore } from '../../stores/useUIStore';
import { useGitStore } from '../../stores/useGitStore';
import { useSettingsStore } from '../../stores/useSettingsStore';

export const StatusBar: React.FC = () => {
  const { cursorPosition, openTabs, activeTabId } = useEditorStore();
  const { selectedModel, isOllamaRunning, hardware } = useAIStore();
  const { toggleBottomPanel, toggleRightSidebar, rightSidebarOpen, bottomPanelOpen } =
    useUIStore();
  const { branch } = useGitStore();
  const { settings } = useSettingsStore();

  const isLight = settings.theme === 'nova-light';
  const activeTab = openTabs.find((t) => t.id === activeTabId);

  return (
    <footer
      className={`h-6 border-t flex items-center justify-between px-3 select-none text-[11px] font-sans z-40 transition-colors ${
        isLight
          ? 'bg-slate-100 border-slate-200 text-slate-700'
          : 'bg-[#06080e] border-[#1c2438] text-slate-300'
      }`}
    >
      {/* Sol Öğeler: Git Dalı & Hata Tanılama */}
      <div className="flex items-center space-x-3">
        <div
          className={`flex items-center space-x-1 cursor-pointer transition-colors ${
            isLight ? 'hover:text-purple-700' : 'hover:text-cyan-300'
          }`}
        >
          <GitBranch className="w-3 h-3 text-cyan-400" />
          <span className="font-mono">{branch || 'master'}</span>
        </div>

        <div className="flex items-center space-x-2 text-slate-400">
          <div className="flex items-center space-x-0.5 hover:text-white cursor-pointer">
            <XCircle className="w-3 h-3 text-slate-500" />
            <span>0</span>
          </div>
          <div className="flex items-center space-x-0.5 hover:text-white cursor-pointer">
            <AlertTriangle className="w-3 h-3 text-slate-500" />
            <span>0</span>
          </div>
        </div>
      </div>

      {/* Orta Öğeler: AI Durumu ve Donanım Hızlandırma */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleRightSidebar}
          className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
            rightSidebarOpen
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'hover:bg-slate-800/40 text-slate-400 hover:text-white'
          }`}
          title="AI Asistanını Aç / Kapat"
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span className="font-medium">
            {isOllamaRunning ? `NOVA AI: ${selectedModel}` : 'NOVA AI: Yerel Hazır (Ollama)'}
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOllamaRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
        </button>

        <div className="hidden sm:flex items-center space-x-1 text-slate-400 text-[10px]">
          <Cpu className="w-3 h-3 text-purple-400" />
          <span>{hardware.accelerationMode} (AMD/CPU Safe)</span>
        </div>
      </div>

      {/* Sağ Öğeler: Terminal Tuşu, İmleç Konumu, Dil */}
      <div className="flex items-center space-x-3 text-slate-400">
        <button
          onClick={toggleBottomPanel}
          className={`flex items-center space-x-1 px-1.5 py-0.5 rounded hover:text-white transition-colors cursor-pointer ${
            bottomPanelOpen ? 'text-cyan-400 font-semibold' : ''
          }`}
          title="Terminal Panelini Aç / Kapat"
        >
          <Terminal className="w-3 h-3" />
        </button>

        <div className="hover:text-white cursor-pointer font-mono">
          Satır {cursorPosition.line}, Sütun {cursorPosition.column}
        </div>

        <div className="hidden md:block hover:text-white cursor-pointer">UTF-8</div>

        <div className="hover:text-white font-medium cursor-pointer text-cyan-400 uppercase font-mono">
          {activeTab?.language ? activeTab.language : 'TYPESCRIPT'}
        </div>
      </div>
    </footer>
  );
};