import React, { useState } from 'react';
import { X, Sliders, Cpu, Palette, Shield, RotateCcw } from 'lucide-react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useNotificationStore } from '../../stores/useNotificationStore';

export const SettingsModal: React.FC = () => {
  const { settings, isSettingsModalOpen, closeSettingsModal, updateSettings, resetSettings } =
    useSettingsStore();
  const { addNotification } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<'editor' | 'ai' | 'theme'>('editor');

  if (!isSettingsModalOpen) return null;

  const handleReset = () => {
    resetSettings();
    addNotification({ type: 'info', message: 'Settings reset to default values.' });
  };

  return (
    <div
      onClick={closeSettingsModal}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-nexcode-900 border border-nexcode-750 rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs max-h-[85vh]"
      >
        {/* Modal Header */}
        <div className="h-11 px-4 border-b border-nexcode-800 bg-nexcode-950 flex items-center justify-between">
          <div className="flex items-center space-x-2 font-bold text-slate-100 text-sm">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>NOVA IDE Ayarları & Tercihler</span>
          </div>
          <button
            onClick={closeSettingsModal}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-nexcode-850 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Settings Navigation Tabs */}
          <div className="w-44 bg-nexcode-950/60 border-r border-nexcode-800 p-2 space-y-1">
            <button
              onClick={() => setActiveTab('editor')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'editor'
                  ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-nexcode-850'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'ai'
                  ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-nexcode-850'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Local AI</span>
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'theme'
                  ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-nexcode-850'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Appearance</span>
            </button>
          </div>

          {/* Settings Content Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            {activeTab === 'editor' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Font Size ({settings.fontSize}px)
                  </label>
                  <input
                    type="range"
                    min={11}
                    max={22}
                    value={settings.fontSize}
                    onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Font Family</label>
                  <input
                    type="text"
                    value={settings.fontFamily}
                    onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                    className="w-full bg-nexcode-950 border border-nexcode-750 rounded-md p-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-slate-200 font-medium">Code Minimap</span>
                    <p className="text-[10px] text-slate-400">
                      Display high-level bird-eye overview on the right side of the editor.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.minimap}
                    onChange={(e) => updateSettings({ minimap: e.target.checked })}
                    className="w-4 h-4 accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-slate-200 font-medium">Word Wrap</span>
                    <p className="text-[10px] text-slate-400">
                      Automatically wrap long lines to fit the viewport width.
                    </p>
                  </div>
                  <select
                    value={settings.wordWrap}
                    onChange={(e) => updateSettings({ wordWrap: e.target.value as any })}
                    className="bg-nexcode-950 border border-nexcode-750 rounded px-2 py-1 text-slate-200 focus:outline-none"
                  >
                    <option value="on">On</option>
                    <option value="off">Off</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-slate-200 font-medium">Tab Size</span>
                    <p className="text-[10px] text-slate-400">Number of spaces per indentation level.</p>
                  </div>
                  <select
                    value={settings.tabSize}
                    onChange={(e) => updateSettings({ tabSize: parseInt(e.target.value) })}
                    className="bg-nexcode-950 border border-nexcode-750 rounded px-2 py-1 text-slate-200 focus:outline-none"
                  >
                    <option value={2}>2 Spaces</option>
                    <option value={4}>4 Spaces</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Local Ollama Endpoint
                  </label>
                  <input
                    type="text"
                    value={settings.ollamaEndpoint}
                    onChange={(e) => updateSettings({ ollamaEndpoint: e.target.value })}
                    className="w-full bg-nexcode-950 border border-nexcode-750 rounded-md p-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Default is <code className="text-indigo-400">http://localhost:11434</code>.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-start space-x-2.5">
                  <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-300 text-[11px]">
                      Zero Cloud Telemetry Guarantee
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                      NEXCODE AI will never upload your code or prompt data to external cloud services.
                      All inference runs entirely on your local CPU or GPU.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'theme' && (
              <div className="space-y-3">
                <span className="text-slate-300 font-medium block">Görünüm ve Renk Teması</span>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'nova-dark', name: 'NOVA Dark (Önerilen)', desc: 'Mor ve cyan neon vurgulu derin lacivert/siyah' },
                    { id: 'nova-light', name: 'NOVA Light', desc: 'Açık platin/beyaz paneller, mor ve mavi vurgular' },
                    { id: 'nexcode-dark', name: 'Classic Dark', desc: 'Dengeli arduvaz arka plan ve indigo vurgular' },
                    { id: 'nexcode-black', name: 'OLED Black', desc: 'Maksimum kontrastlı mutlak siyah tema' },
                    { id: 'nexcode-nord', name: 'Nord Frost', desc: 'Arktik soğuk mavi gece teması' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => updateSettings({ theme: t.id as any })}
                      className={`p-3 rounded-lg border text-left flex flex-col space-y-1 transition-all ${
                        settings.theme === t.id
                          ? 'border-purple-500 bg-purple-600/10 text-white shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                          : 'border-nexcode-800 bg-nexcode-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-semibold text-xs text-slate-200">{t.name}</span>
                      <span className="text-[10px] text-slate-400">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="h-10 px-4 border-t border-nexcode-800 bg-nexcode-950 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={closeSettingsModal}
            className="px-3.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
