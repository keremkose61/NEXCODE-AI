import React, { useState, useEffect } from 'react';
import {
  X,
  Cpu,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HardDrive,
  Zap,
  Sparkles,
  Server
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useAIStore } from '../../stores/useAIStore';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { ModelPullProgress } from '@nexcode/shared';

interface CatalogItem {
  name: string;
  displayName: string;
  size: string;
  parameterSize: string;
  description: string;
  recommendedHardware: string;
  category: 'fast' | 'balanced' | 'powerful' | 'instruct';
}

const DEFAULT_CATALOG: CatalogItem[] = [
  {
    name: 'qwen2.5-coder:1.5b',
    displayName: 'Qwen 2.5 Coder 1.5B (Ultra-Fast)',
    size: '1.1 GB',
    parameterSize: '1.5B',
    description: 'Ultra-lightweight model ideal for real-time autocomplete and prompt editing on standard laptops.',
    recommendedHardware: '4GB+ RAM / Any CPU',
    category: 'fast'
  },
  {
    name: 'qwen2.5-coder:7b',
    displayName: 'Qwen 2.5 Coder 7B (Default & Recommended)',
    size: '4.7 GB',
    parameterSize: '7B',
    description: 'High-precision coding, multi-file reasoning, full refactoring, and test suite generation.',
    recommendedHardware: '8GB - 16GB RAM / CPU or 6GB VRAM GPU',
    category: 'balanced'
  },
  {
    name: 'deepseek-coder:6.7b',
    displayName: 'DeepSeek Coder 6.7B',
    size: '3.8 GB',
    parameterSize: '6.7B',
    description: 'State of the art open code model with 2T token pretraining. Outstanding algorithmic reasoning.',
    recommendedHardware: '8GB - 16GB RAM / CPU or GPU',
    category: 'powerful'
  },
  {
    name: 'llama3.2:3b',
    displayName: 'Llama 3.2 3B',
    size: '2.0 GB',
    parameterSize: '3B',
    description: 'Meta’s cutting-edge edge model. Ultra-low latency conversational assistant and code helper.',
    recommendedHardware: '6GB+ RAM / CPU or GPU',
    category: 'fast'
  },
  {
    name: 'codellama:7b',
    displayName: 'CodeLlama 7B',
    size: '3.8 GB',
    parameterSize: '7B',
    description: 'Specialized Meta code model supporting Fill-In-the-Middle (FIM) and multi-turn refactoring.',
    recommendedHardware: '8GB - 16GB RAM / CPU or GPU',
    category: 'balanced'
  }
];

export const ModelManagerModal: React.FC = () => {
  const { isModelManagerOpen, closeModelManager } = useUIStore();
  const {
    availableModels,
    selectedModel,
    setSelectedModel,
    isOllamaRunning,
    hardware,
    checkLocalAIStatus
  } = useAIStore();
  const { addNotification } = useNotificationStore();

  const [catalog, setCatalog] = useState<CatalogItem[]>(DEFAULT_CATALOG);
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<ModelPullProgress | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'installed' | 'fast'>('all');

  useEffect(() => {
    if (isModelManagerOpen && window.nexcode) {
      window.nexcode.ai.getCatalog().then((cat: any) => {
        if (Array.isArray(cat) && cat.length > 0) {
          setCatalog(cat);
        }
      });
      checkLocalAIStatus();

      const unsubscribe = window.nexcode.ai.onPullProgress((prog: ModelPullProgress) => {
        setDownloadProgress(prog);
      });
      return () => {
        unsubscribe();
      };
    }
  }, [isModelManagerOpen, checkLocalAIStatus]);

  if (!isModelManagerOpen) return null;

  const handlePull = async (modelName: string) => {
    if (!window.nexcode) return;
    setDownloadingModel(modelName);
    setDownloadProgress({ model: modelName, status: 'Starting download...' });

    addNotification({
      type: 'info',
      title: 'Downloading Local Model',
      message: `Starting download of ${modelName}...`
    });

    const res = await window.nexcode.ai.pullModel(modelName);
    setDownloadingModel(null);
    setDownloadProgress(null);

    if (res.success) {
      addNotification({
        type: 'success',
        title: 'Model Ready',
        message: `${modelName} has been downloaded and is ready for offline coding!`
      });
      await checkLocalAIStatus();
      setSelectedModel(modelName);
    } else {
      addNotification({
        type: 'error',
        title: 'Download Failed',
        message: res.error || 'Failed to download model. Ensure Ollama is running.'
      });
    }
  };

  const handleDelete = async (modelName: string) => {
    if (!window.nexcode) return;
    if (!confirm(`Are you sure you want to delete ${modelName} from your disk?`)) return;

    const res = await window.nexcode.ai.deleteModel(modelName);
    if (res.success) {
      addNotification({
        type: 'info',
        title: 'Model Deleted',
        message: `Removed ${modelName} to free local disk space.`
      });
      await checkLocalAIStatus();
    }
  };

  const isModelInstalled = (name: string) => {
    return availableModels.some((m) => m.name === name || m.name.startsWith(name.split(':')[0]));
  };

  const filteredCatalog = catalog.filter((item) => {
    if (activeFilter === 'installed') return isModelInstalled(item.name);
    if (activeFilter === 'fast') return item.category === 'fast';
    return true;
  });

  return (
    <div
      onClick={closeModelManager}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-nexcode-900 border border-nexcode-750 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-xs text-slate-200"
      >
        {/* Header */}
        <div className="p-4 bg-nexcode-950 border-b border-nexcode-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                NEXCODE Local Model Hub
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-normal bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  100% Offline & Private
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Browse, download, and manage open weights hosted directly on your machine via Ollama.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => checkLocalAIStatus()}
              title="Refresh Models"
              className="p-1.5 rounded hover:bg-nexcode-800 text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={closeModelManager}
              className="p-1.5 rounded hover:bg-nexcode-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hardware Status Strip */}
        <div className="px-4 py-2 bg-nexcode-925 border-b border-nexcode-800/80 flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-3 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>{hardware.cpuModel}</span>
            </span>
            <span className="text-slate-600">•</span>
            <span>{hardware.ramGb} GB RAM</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-medium">Mode: {hardware.accelerationMode}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isOllamaRunning ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className={isOllamaRunning ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
              {isOllamaRunning ? 'Ollama Online (127.0.0.1:11434)' : 'Ollama Offline'}
            </span>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="px-4 pt-3 flex items-center space-x-2">
          {(['all', 'installed', 'fast'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded text-xs font-medium capitalize transition-colors ${
                activeFilter === filter
                  ? 'bg-indigo-600 text-white'
                  : 'bg-nexcode-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {filter === 'all'
                ? 'All Models'
                : filter === 'installed'
                ? `Installed (${availableModels.length})`
                : 'Lightweight (CPU / 4GB+)'}
            </button>
          ))}
        </div>

        {/* Active Download Progress Bar */}
        {downloadingModel && (
          <div className="mx-4 my-3 p-3 rounded-lg bg-indigo-950/60 border border-indigo-500/40">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 animate-bounce" />
                Pulling {downloadingModel}...
              </span>
              <span className="font-mono text-indigo-400">
                {downloadProgress?.percentage ? `${downloadProgress.percentage}%` : downloadProgress?.status}
              </span>
            </div>
            <div className="w-full bg-nexcode-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full transition-all duration-200"
                style={{ width: `${downloadProgress?.percentage || 15}%` }}
              />
            </div>
          </div>
        )}

        {/* Model Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredCatalog.map((item) => {
            const installed = isModelInstalled(item.name);
            const isCurrent = selectedModel === item.name;
            const isPulling = downloadingModel === item.name;

            return (
              <div
                key={item.name}
                className={`p-3.5 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-indigo-950/30 border-indigo-500/60 shadow-xs'
                    : 'bg-nexcode-950/70 border-nexcode-800 hover:border-nexcode-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-white">{item.displayName}</span>
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-slate-300">
                        {item.size}
                      </span>
                      {installed && (
                        <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Installed
                        </span>
                      )}
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs">{item.description}</p>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 pt-1">
                      <span>Requirement: {item.recommendedHardware}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {installed ? (
                      <>
                        {!isCurrent && (
                          <button
                            onClick={() => {
                              setSelectedModel(item.name);
                              addNotification({
                                type: 'info',
                                message: `Switched active AI model to ${item.name}`
                              });
                            }}
                            className="px-3 py-1.5 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 font-medium transition-colors"
                          >
                            Use Model
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.name)}
                          title="Delete model from disk"
                          className="p-2 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        disabled={isPulling || !!downloadingModel || !isOllamaRunning}
                        onClick={() => handlePull(item.name)}
                        className={`px-3 py-1.5 rounded font-medium flex items-center space-x-1.5 transition-colors ${
                          !isOllamaRunning
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isPulling ? 'Downloading...' : 'Install Model'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-nexcode-950 border-t border-nexcode-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Models are stored at standard Ollama directory (`~/.ollama/models`). No telemetry sent.
          </span>
          <button
            onClick={closeModelManager}
            className="px-4 py-1.5 rounded bg-nexcode-800 hover:bg-nexcode-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
