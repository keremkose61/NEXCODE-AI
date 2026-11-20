import React, { useState } from 'react';
import {
  Play,
  Settings,
  Minus,
  Square,
  X,
  ChevronDown,
  Cpu,
  Search,
  Bug,
  Sun,
  Moon,
  FolderOpen,
  Save,
  Clock,
  Terminal as TermIcon,
  GitBranch,
  Layers,
  Sparkles,
  HelpCircle,
  Code2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAIStore } from '../../stores/useAIStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { useUIStore } from '../../stores/useUIStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useEditorStore } from '../../stores/useEditorStore';
import { useTerminalStore } from '../../stores/useTerminalStore';
import { useDebuggerStore } from '../../stores/useDebuggerStore';
import { useGitStore } from '../../stores/useGitStore';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { NovaLogo } from '../ui/NovaLogo';

export const TopBar: React.FC = () => {
  const { selectedModel, availableModels, setSelectedModel, isOllamaRunning } = useAIStore();
  const { projectName, openFolderDialog } = useProjectStore();
  const {
    openCommandPalette,
    openQuickOpen,
    openInlineAI,
    openModelManager,
    openPRReview,
    toggleLeftSidebar,
    toggleBottomPanel,
    toggleRightSidebar,
    setBottomTab
  } = useUIStore();
  const { settings, updateSettings, openSettingsModal } = useSettingsStore();
  const { activeTabId, openTabs, saveCurrentFile, openFile } = useEditorStore();
  const { sendCommand, addTab, clearTerminal } = useTerminalStore();
  const { isDebugging, startDebugging, stopDebugging } = useDebuggerStore();
  const { pull, push, stageAll, fetchStatus } = useGitStore();
  const { addNotification } = useNotificationStore();

  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const activeTab = openTabs.find((t) => t.id === activeTabId);
  const isLight = settings.theme === 'nova-light';

  const handleMinimize = () => window.nexcode?.window.minimize();
  const handleMaximize = () => window.nexcode?.window.maximize();
  const handleClose = () => window.nexcode?.window.close();

  const toggleTheme = () => {
    const nextTheme = isLight ? 'nova-dark' : 'nova-light';
    updateSettings({ theme: nextTheme });
    addNotification({
      type: 'info',
      title: 'Tema Değiştirildi',
      message: nextTheme === 'nova-light' ? 'NOVA Light tema etkinleştirildi.' : 'NOVA Dark tema etkinleştirildi.'
    });
  };

  const handleRunActiveFile = () => {
    if (!activeTab) {
      addNotification({ type: 'warning', message: 'Çalıştırılacak açık bir dosya bulunamadı.' });
      return;
    }
    useUIStore.getState().setBottomTab('terminal');
    if (!useUIStore.getState().bottomPanelOpen) {
      toggleBottomPanel();
    }
    const ext = activeTab.fileName.split('.').pop()?.toLowerCase();
    let cmd = `node "${activeTab.filePath || activeTab.fileName}"`;
    if (ext === 'py') cmd = `python "${activeTab.filePath || activeTab.fileName}"`;
    if (ext === 'ps1') cmd = `powershell -File "${activeTab.filePath || activeTab.fileName}"`;
    if (ext === 'ts' || ext === 'tsx') cmd = `npx tsx "${activeTab.filePath || activeTab.fileName}"`;

    const termId = useTerminalStore.getState().activeTabId || 'term-default';
    sendCommand(termId, cmd);
    addNotification({
      type: 'info',
      title: 'Çalıştırılıyor',
      message: `${activeTab.fileName} terminalde yürütülüyor...`
    });
  };

  const handleToggleDebug = () => {
    if (isDebugging) {
      stopDebugging();
      addNotification({ type: 'info', message: 'Hata ayıklama oturumu sonlandırıldı.' });
    } else {
      const fileName = activeTab?.fileName || 'index.ts';
      startDebugging(fileName);
      setBottomTab('debug');
      if (!useUIStore.getState().bottomPanelOpen) {
        toggleBottomPanel();
      }
      addNotification({
        type: 'success',
        title: 'Hata Ayıklayıcı Başlatıldı',
        message: `${fileName} için simüle hata ayıklama aktif.`
      });
    }
  };

  return (
    <header
      className={`h-9 border-b flex items-center justify-between px-3 select-none drag-region text-xs z-50 transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-700'
          : 'bg-[#080a10] border-[#1c2438] text-slate-200'
      }`}
    >
      {/* Sol Bölüm: Logo ve Üst Menüler */}
      <div className="flex items-center space-x-3 no-drag-region">
        {/* NOVA IDE Geometrik Logo Markası */}
        <NovaLogo size={22} appName="NOVA IDE" badge="AI" />

        {/* Masaüstü Menü Çubuğu (Dosya, Düzenle, Görünüm, Git, Çalıştır, Terminal, Yardım) */}
        <div className="hidden lg:flex items-center space-x-1 font-medium ml-3 relative">
          {/* DOSYA MENÜSÜ */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'dosya' ? null : 'dosya')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeMenu === 'dosya'
                  ? 'bg-purple-600/20 text-purple-400 font-semibold'
                  : 'hover:bg-purple-500/10 hover:text-purple-300 text-slate-300'
              }`}
            >
              Dosya
            </button>
            {activeMenu === 'dosya' && (
              <div
                onMouseLeave={() => setActiveMenu(null)}
                className={`absolute left-0 top-7 w-52 rounded-lg shadow-2xl p-1 z-50 text-[11px] border ${
                  isLight ? 'bg-white border-slate-200 shadow-slate-300' : 'bg-[#0e1322] border-[#222c44] shadow-black/80'
                }`}
              >
                <button
                  onClick={() => {
                    const fname = `untitled-${Date.now().toString().slice(-4)}.ts`;
                    openFile({ path: fname, name: fname, content: '// Yeni NOVA IDE dosyası\n' });
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 flex items-center justify-between"
                >
                  <span>Yeni Dosya</span>
                  <span className="text-slate-500 font-mono">Ctrl+N</span>
                </button>
                <button
                  onClick={() => {
                    openFolderDialog();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 flex items-center justify-between"
                >
                  <span>Klasör Aç...</span>
                  <span className="text-slate-500 font-mono">Ctrl+O</span>
                </button>
                <button
                  onClick={() => {
                    saveCurrentFile().then(() => addNotification({ type: 'success', message: 'Dosya kaydedildi.' }));
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 flex items-center justify-between"
                >
                  <span>Kaydet</span>
                  <span className="text-slate-500 font-mono">Ctrl+S</span>
                </button>
                <div className="my-1 border-t border-slate-700/40" />
                <button
                  onClick={() => {
                    openSettingsModal();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 flex items-center justify-between"
                >
                  <span>Ayarlar & Tercihler</span>
                  <span className="text-slate-500 font-mono">Ctrl+,</span>
                </button>
                <button
                  onClick={handleClose}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-rose-500/20 text-rose-400 flex items-center justify-between"
                >
                  <span>Çıkış</span>
                  <span className="text-slate-500 font-mono">Alt+F4</span>
                </button>
              </div>
            )}
          </div>

          {/* DÜZENLE MENÜSÜ */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'duzenle' ? null : 'duzenle')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeMenu === 'duzenle'
                  ? 'bg-purple-600/20 text-purple-400 font-semibold'
                  : 'hover:bg-purple-500/10 hover:text-purple-300 text-slate-300'
              }`}
            >
              Düzenle
            </button>
            {activeMenu === 'duzenle' && (
              <div
                onMouseLeave={() => setActiveMenu(null)}
                className={`absolute left-0 top-7 w-52 rounded-lg shadow-2xl p-1 z-50 text-[11px] border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#0e1322] border-[#222c44]'
                }`}
              >
                <button
                  onClick={() => {
                    openInlineAI();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 text-purple-300 flex items-center justify-between font-semibold"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    Satır İçi AI Düzenle
                  </span>
                  <span className="text-slate-500 font-mono">Ctrl+K</span>
                </button>
                <div className="my-1 border-t border-slate-700/40" />
                <button
                  onClick={() => {
                    openQuickOpen();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 flex items-center justify-between"
                >
                  <span>Hızlı Dosya Bul</span>
                  <span className="text-slate-500 font-mono">Ctrl+P</span>
                </button>
                <button
                  onClick={() => {
                    openCommandPalette();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 flex items-center justify-between"
                >
                  <span>Komut Paleti</span>
                  <span className="text-slate-500 font-mono">Ctrl+Shift+P</span>
                </button>
              </div>
            )}
          </div>

          {/* GÖRÜNÜM MENÜSÜ */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'gorunum' ? null : 'gorunum')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeMenu === 'gorunum'
                  ? 'bg-purple-600/20 text-purple-400 font-semibold'
                  : 'hover:bg-purple-500/10 hover:text-purple-300 text-slate-300'
              }`}
            >
              Görünüm
            </button>
            {activeMenu === 'gorunum' && (
              <div
                onMouseLeave={() => setActiveMenu(null)}
                className={`absolute left-0 top-7 w-52 rounded-lg shadow-2xl p-1 z-50 text-[11px] border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#0e1322] border-[#222c44]'
                }`}
              >
                <button
                  onClick={() => {
                    toggleLeftSidebar();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 flex items-center justify-between"
                >
                  <span>Proje Gezgini</span>
                  <span className="text-slate-500 font-mono">Ctrl+B</span>
                </button>
                <button
                  onClick={() => {
                    toggleBottomPanel();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 flex items-center justify-between"
                >
                  <span>Entegre Terminal</span>
                  <span className="text-slate-500 font-mono">Ctrl+J</span>
                </button>
                <button
                  onClick={() => {
                    toggleRightSidebar();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 flex items-center justify-between"
                >
                  <span>AI Asistanı Paneli</span>
                  <span className="text-slate-500 font-mono">Ctrl+L</span>
                </button>
                <div className="my-1 border-t border-slate-700/40" />
                <button
                  onClick={() => {
                    openModelManager();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 text-cyan-300 flex items-center justify-between"
                >
                  <span>Model Yöneticisi</span>
                  <span className="text-[10px] text-cyan-500 font-mono">Ollama</span>
                </button>
              </div>
            )}
          </div>

          {/* GIT MENÜSÜ */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'git' ? null : 'git')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeMenu === 'git'
                  ? 'bg-purple-600/20 text-purple-400 font-semibold'
                  : 'hover:bg-purple-500/10 hover:text-purple-300 text-slate-300'
              }`}
            >
              Git
            </button>
            {activeMenu === 'git' && (
              <div
                onMouseLeave={() => setActiveMenu(null)}
                className={`absolute left-0 top-7 w-56 rounded-lg shadow-2xl p-1 z-50 text-[11px] border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#0e1322] border-[#222c44]'
                }`}
              >
                <button
                  onClick={() => {
                    fetchStatus();
                    addNotification({ type: 'info', message: 'Git durumu yenilendi.' });
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 flex items-center justify-between"
                >
                  <span>Durumu Yenile</span>
                  <span className="text-slate-500 font-mono">fetch</span>
                </button>
                <button
                  onClick={async () => {
                    addNotification({ type: 'info', message: 'Değişiklikler çekiliyor (pull)...' });
                    const res = await pull();
                    if (res.success) addNotification({ type: 'success', message: 'Pull başarılı.' });
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 flex items-center justify-between"
                >
                  <span>Değişiklikleri Getir (Pull)</span>
                  <span className="text-slate-500 font-mono">git pull</span>
                </button>
                <button
                  onClick={async () => {
                    addNotification({ type: 'info', message: 'Değişiklikler gönderiliyor (push)...' });
                    const res = await push(true);
                    if (res.success) addNotification({ type: 'success', message: 'Push başarılı.' });
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 flex items-center justify-between"
                >
                  <span>Değişiklikleri Gönder (Push)</span>
                  <span className="text-slate-500 font-mono">git push</span>
                </button>
                <div className="my-1 border-t border-slate-700/40" />
                <button
                  onClick={() => {
                    openPRReview();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 text-cyan-300 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    PR & Güvenlik Denetimi
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono">AI Scan</span>
                </button>
              </div>
            )}
          </div>

          {/* ÇALIŞTIR MENÜSÜ */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'calistir' ? null : 'calistir')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeMenu === 'calistir'
                  ? 'bg-purple-600/20 text-purple-400 font-semibold'
                  : 'hover:bg-purple-500/10 hover:text-purple-300 text-slate-300'
              }`}
            >
              Çalıştır
            </button>
            {activeMenu === 'calistir' && (
              <div
                onMouseLeave={() => setActiveMenu(null)}
                className={`absolute left-0 top-7 w-52 rounded-lg shadow-2xl p-1 z-50 text-[11px] border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#0e1322] border-[#222c44]'
                }`}
              >
                <button
                  onClick={() => {
                    handleRunActiveFile();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 text-blue-400 font-semibold flex items-center justify-between"
                >
                  <span>Aktif Dosyayı Çalıştır</span>
                  <span className="text-slate-500 font-mono">F5</span>
                </button>
                <button
                  onClick={() => {
                    handleToggleDebug();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 text-amber-300 flex items-center justify-between"
                >
                  <span>{isDebugging ? 'Hata Ayıklamayı Durdur' : 'Hata Ayıklamayı Başlat'}</span>
                  <span className="text-slate-500 font-mono">F9</span>
                </button>
              </div>
            )}
          </div>

          {/* TERMINAL MENÜSÜ */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'terminal' ? null : 'terminal')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeMenu === 'terminal'
                  ? 'bg-purple-600/20 text-purple-400 font-semibold'
                  : 'hover:bg-purple-500/10 hover:text-purple-300 text-slate-300'
              }`}
            >
              Terminal
            </button>
            {activeMenu === 'terminal' && (
              <div
                onMouseLeave={() => setActiveMenu(null)}
                className={`absolute left-0 top-7 w-52 rounded-lg shadow-2xl p-1 z-50 text-[11px] border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#0e1322] border-[#222c44]'
                }`}
              >
                <button
                  onClick={() => {
                    addTab('powershell');
                    setBottomTab('terminal');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 flex items-center justify-between"
                >
                  <span>Yeni PowerShell Terminali</span>
                  <span className="text-slate-500 font-mono">pwsh</span>
                </button>
                <button
                  onClick={() => {
                    addTab('cmd');
                    setBottomTab('terminal');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 flex items-center justify-between"
                >
                  <span>Yeni Komut İstemi (CMD)</span>
                  <span className="text-slate-500 font-mono">cmd</span>
                </button>
                <div className="my-1 border-t border-slate-700/40" />
                <button
                  onClick={() => {
                    const termId = useTerminalStore.getState().activeTabId || 'term-default';
                    clearTerminal(termId);
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 flex items-center justify-between"
                >
                  <span>Terminal Çıktısını Temizle</span>
                  <span className="text-slate-500 font-mono">cls</span>
                </button>
              </div>
            )}
          </div>

          {/* YARDIM MENÜSÜ */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'yardim' ? null : 'yardim')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeMenu === 'yardim'
                  ? 'bg-purple-600/20 text-purple-400 font-semibold'
                  : 'hover:bg-purple-500/10 hover:text-purple-300 text-slate-300'
              }`}
            >
              Yardım
            </button>
            {activeMenu === 'yardim' && (
              <div
                onMouseLeave={() => setActiveMenu(null)}
                className={`absolute left-0 top-7 w-56 rounded-lg shadow-2xl p-1 z-50 text-[11px] border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#0e1322] border-[#222c44]'
                }`}
              >
                <div className="px-2.5 py-1.5 border-b border-slate-700/40">
                  <span className="font-bold text-slate-100 block">NOVA IDE v0.1.0</span>
                  <span className="text-[10px] text-slate-400">Professional Local AI IDE</span>
                </div>
                <button
                  onClick={() => {
                    openCommandPalette();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 flex items-center justify-between mt-1"
                >
                  <span>Klavye Kısayolları</span>
                  <span className="text-slate-500 font-mono">F1</span>
                </button>
                <button
                  onClick={() => {
                    openModelManager();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/20 flex items-center justify-between"
                >
                  <span>Yapay Zekâ Motoru Kurulumu</span>
                  <span className="text-cyan-400 font-mono">Ollama</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orta Bölüm: Hızlı Dosya Arama & Komut Merkezi */}
      <div className="flex items-center space-x-2 text-slate-400 text-[11px] no-drag-region">
        <button
          onClick={openQuickOpen}
          className={`flex items-center space-x-2 px-3 py-1 rounded-lg border transition-all cursor-pointer min-w-[240px] justify-between ${
            isLight
              ? 'bg-slate-100 border-slate-300 hover:border-purple-500 text-slate-700'
              : 'bg-[#101422]/90 border-[#1f283e] hover:border-cyan-500/50 hover:shadow-[0_0_10px_rgba(6,182,212,0.15)] text-slate-300'
          }`}
          title="Dosya Bul veya Aç (Ctrl+P)"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium truncate max-w-[150px]">{projectName}</span>
          </div>
          <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-black/30 text-slate-400 font-mono border border-slate-700/50">
            Ctrl+P
          </kbd>
        </button>
      </div>

      {/* Sağ Bölüm: Çalıştır, Debug, Tema, Ayarlar, Model Seçici ve Pencere Kontrolleri */}
      <div className="flex items-center space-x-2 no-drag-region">
        {/* Yerel AI Model Seçici Dropdown */}
        <div className="relative">
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:border-purple-400'
                : 'bg-[#101422] border-[#1f283e] hover:border-purple-500/60 text-slate-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOllamaRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px] font-medium">{selectedModel}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {modelDropdownOpen && (
            <div
              className={`absolute right-0 mt-1 w-64 rounded-xl shadow-2xl p-2 z-50 border ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0e1322] border-[#222c44]'
              }`}
            >
              <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-700/40">
                Yerel AI Modelleri (Ollama)
              </div>
              <div className="py-1 max-h-48 overflow-y-auto">
                {availableModels.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => {
                      setSelectedModel(m.name);
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex flex-col transition-colors ${
                      selectedModel === m.name
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                        : 'text-slate-300 hover:bg-purple-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-[11px] font-semibold">{m.name}</span>
                      {m.size && <span className="text-[10px] text-slate-500">{m.size}</span>}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  openModelManager();
                  setModelDropdownOpen(false);
                }}
                className="w-full mt-1.5 py-1 rounded bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-semibold text-[10px] border border-purple-500/30 transition-colors"
              >
                + Yeni Model İndir
              </button>
            </div>
          )}
        </div>

        {/* 1. Çalıştır Butonu (Run) */}
        <button
          onClick={handleRunActiveFile}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition-all shadow-[0_0_12px_rgba(59,130,246,0.35)] cursor-pointer"
          title="Aktif Dosyayı Çalıştır (F5)"
        >
          <Play className="w-3 h-3 fill-current" />
          <span className="text-[11px]">Çalıştır</span>
        </button>

        {/* 2. Hata Ayıklama Butonu (Debug) */}
        <button
          onClick={handleToggleDebug}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
            isDebugging
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-pulse'
              : isLight
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600'
              : 'bg-[#101422] hover:bg-[#161c2e] border-[#1f283e] text-slate-400 hover:text-amber-300'
          }`}
          title="Hata Ayıklamayı Aç / Kapat"
        >
          <Bug className="w-3.5 h-3.5" />
          <span className="text-[11px] hidden sm:inline">Debug</span>
        </button>

        {/* 3. Tema Değiştirme Butonu (Dark / Light) */}
        <button
          onClick={toggleTheme}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            isLight
              ? 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200'
              : 'bg-[#101422] border-[#1f283e] text-cyan-300 hover:border-cyan-500/50 hover:shadow-[0_0_8px_rgba(6,182,212,0.25)]'
          }`}
          title={isLight ? 'Dark Temaya Geç' : 'Light Temaya Geç'}
        >
          {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </button>

        {/* 4. Ayarlar Butonu */}
        <button
          onClick={openSettingsModal}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600'
              : 'bg-[#101422] border-[#1f283e] text-slate-400 hover:text-white hover:border-purple-500/50'
          }`}
          title="Ayarlar (Ctrl+,)"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Windows Pencere Kontrolleri */}
        <div className="flex items-center ml-1 border-l border-slate-700/50 pl-1">
          <button
            onClick={handleMinimize}
            className="w-7 h-7 flex items-center justify-center hover:bg-slate-800/60 rounded text-slate-400 hover:text-white transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleMaximize}
            className="w-7 h-7 flex items-center justify-center hover:bg-slate-800/60 rounded text-slate-400 hover:text-white transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center hover:bg-rose-600 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};