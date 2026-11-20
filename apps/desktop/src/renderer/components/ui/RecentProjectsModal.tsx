import React, { useState } from 'react';
import { Folder, Clock, X, Search } from 'lucide-react';
import { useProjectStore } from '../../stores/useProjectStore';

interface RecentProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecentProjectsModal: React.FC<RecentProjectsModalProps> = ({ isOpen, onClose }) => {
  const { recentProjects, loadProjectDirectory } = useProjectStore();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = recentProjects.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.path.toLowerCase().includes(query.toLowerCase())
  );

  const handleOpen = (projectPath: string) => {
    loadProjectDirectory(projectPath);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-nexcode-900 border border-nexcode-750 rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs max-h-[70vh]"
      >
        <div className="h-11 px-4 border-b border-nexcode-800 bg-nexcode-950 flex items-center justify-between">
          <div className="flex items-center space-x-2 font-bold text-slate-100 text-sm">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Recent Workspaces</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-nexcode-850 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 border-b border-nexcode-800 bg-nexcode-950/40">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recent projects..."
              className="w-full bg-nexcode-950 border border-nexcode-750 rounded-md pl-8 pr-2 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpen(item.path)}
                className="flex items-center justify-between p-2.5 rounded-lg border border-transparent hover:border-nexcode-750 hover:bg-nexcode-850 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Folder className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-200 text-xs">{item.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate max-w-sm">
                      {item.path}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                  {new Date(item.lastOpenedAt).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-500">
              No recent projects recorded yet. Open a folder to start tracking.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
