import React, { useState } from 'react';
import {
  FolderPlus,
  FilePlus,
  RefreshCw,
  FolderOpen,
  Search,
  GitCommit,
  Sparkles,
  Layers,
  Database,
  FileCode,
  FileText
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { useEditorStore } from '../../stores/useEditorStore';
import { FileTreeItem } from '../explorer/FileTreeItem';

export const LeftPanel: React.FC = () => {
  const { leftSidebarOpen, activeLeftTab, leftPanelWidth } = useUIStore();
  const { projectName, rootPath, files, openFolderDialog, refreshFiles, isLoading } =
    useProjectStore();
  const { openFile, openTabs } = useEditorStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [newFileInputOpen, setNewFileInputOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  if (!leftSidebarOpen) return null;

  // Real-time search across open project files / tabs
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: { fileName: string; filePath: string; line: number; preview: string }[] = [];

    for (const tab of openTabs) {
      const lines = tab.content.split('\n');
      lines.forEach((lineText, idx) => {
        if (lineText.toLowerCase().includes(q)) {
          results.push({
            fileName: tab.fileName,
            filePath: tab.filePath,
            line: idx + 1,
            preview: lineText.trim()
          });
        }
      });
    }
    return results;
  }, [searchQuery, openTabs]);

  const handleCreateNewFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const fullPath = rootPath ? `${rootPath}\\${newFileName.trim()}` : newFileName.trim();

    if (window.nexcode && rootPath) {
      await window.nexcode.fs.createFile(fullPath);
      await refreshFiles();
    }

    openFile({
      path: fullPath,
      name: newFileName.trim(),
      content: '// New file\n'
    });

    setNewFileName('');
    setNewFileInputOpen(false);
  };

  return (
    <div
      style={{ width: `${leftPanelWidth}px` }}
      className="bg-nexcode-900 border-r border-nexcode-800 flex flex-col select-none text-xs h-full overflow-hidden flex-shrink-0"
    >
      {/* Tab: Explorer */}
      {activeLeftTab === 'explorer' && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-8 px-3 border-b border-nexcode-800 flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <span>Explorer</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={refreshFiles}
                title="Refresh Files"
                className="p-1 hover:text-white hover:bg-nexcode-800 rounded"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setNewFileInputOpen(!newFileInputOpen)}
                title="New File"
                className="p-1 hover:text-white hover:bg-nexcode-800 rounded"
              >
                <FilePlus className="w-3.5 h-3.5" />
              </button>
              <button
                title="Open Folder"
                onClick={openFolderDialog}
                className="p-1 hover:text-white hover:bg-nexcode-800 rounded"
              >
                <FolderOpen className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* New file input form */}
          {newFileInputOpen && (
            <form onSubmit={handleCreateNewFile} className="p-2 border-b border-nexcode-800 bg-nexcode-950">
              <input
                autoFocus
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="filename.ts (Press Enter)"
                className="w-full bg-nexcode-900 border border-indigo-500 rounded px-2 py-1 text-slate-100 text-xs focus:outline-none"
              />
            </form>
          )}

          {/* Project Directory Section */}
          <div className="p-2 border-b border-nexcode-800/60 bg-nexcode-950/40 flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span className="truncate">{projectName}</span>
            <span className="text-[10px] text-slate-500 font-mono">
              {files.length > 0 ? `${files.length} items` : ''}
            </span>
          </div>

          {/* Files List or Empty Workspace State */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
            {rootPath && files.length > 0 ? (
              files.map((node) => <FileTreeItem key={node.path} node={node} level={0} />)
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 mt-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">No Folder Opened</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Open a project workspace to begin editing and local AI context indexing.
                  </p>
                </div>
                <button
                  onClick={openFolderDialog}
                  className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-sm text-xs cursor-pointer"
                >
                  Open Project Folder
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Search */}
      {activeLeftTab === 'search' && (
        <div className="flex flex-col h-full p-3 space-y-3">
          <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
            Search Workspace
          </span>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in open files..."
              className="w-full bg-nexcode-950 border border-nexcode-750 rounded-md pl-8 pr-2 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5">
            {searchResults.length > 0 ? (
              searchResults.map((res, i) => (
                <div
                  key={i}
                  onClick={() => {
                    const existing = openTabs.find((t) => t.filePath === res.filePath);
                    if (existing) {
                      openFile({ path: res.filePath, name: res.fileName, content: existing.content });
                    }
                  }}
                  className="p-2 rounded bg-nexcode-950 border border-nexcode-800 hover:border-indigo-500/40 cursor-pointer space-y-1 transition-colors"
                >
                  <div className="flex items-center justify-between text-indigo-300 font-medium">
                    <span className="truncate">{res.fileName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Ln {res.line}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate font-mono bg-nexcode-900/60 p-1 rounded">
                    {res.preview}
                  </div>
                </div>
              ))
            ) : searchQuery ? (
              <div className="text-[11px] text-slate-500 italic text-center py-4">
                No matching text found.
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 italic text-center py-4">
                Type a query to search across all open project files.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Git / Source Control */}
      {activeLeftTab === 'git' && (
        <div className="flex flex-col h-full p-3 space-y-3">
          <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
            Source Control: Git
          </span>
          <textarea
            rows={3}
            placeholder="Commit message (Enter to commit, Shift+Enter for newline)"
            className="w-full bg-nexcode-950 border border-nexcode-750 rounded-md p-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs resize-none"
          />
          <button className="w-full py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center justify-center space-x-1.5 transition-colors cursor-pointer">
            <GitCommit className="w-3.5 h-3.5" />
            <span>Commit to Branch</span>
          </button>
          <div className="border-t border-nexcode-800 pt-2 text-[11px] text-slate-400">
            <div className="flex items-center justify-between py-1">
              <span>Branch:</span>
              <span className="font-mono text-indigo-400">main</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Working Tree:</span>
              <span className="text-emerald-400">Clean</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Extensions */}
      {activeLeftTab === 'extensions' && (
        <div className="flex flex-col h-full p-3 space-y-2">
          <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
            Language Servers & Tools
          </span>
          <div className="space-y-1.5">
            {[
              { name: 'TypeScript / JS LSP', desc: 'Syntax, AST & IntelliSense', status: 'Active' },
              { name: 'Python LSP (Pyright)', desc: 'Type inference & diagnostics', status: 'Ready' },
              { name: 'Rust Analyzer', desc: 'Rust syntax & cargo check', status: 'Ready' },
              { name: 'SQLite DB Inspector', desc: 'Local schema & tables viewer', status: 'Installed' }
            ].map((ext) => (
              <div
                key={ext.name}
                className="p-2 rounded bg-nexcode-950 border border-nexcode-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-slate-200 text-[11px]">{ext.name}</div>
                  <div className="text-[10px] text-slate-400">{ext.desc}</div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  {ext.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: AI Projects */}
      {activeLeftTab === 'ai-projects' && (
        <div className="flex flex-col h-full p-3 space-y-3">
          <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            AI Workspace Knowledge
          </span>
          <div className="p-2.5 rounded-lg bg-nexcode-950 border border-nexcode-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Local Vector Index:</span>
              <span className="text-emerald-400 font-mono">Ready</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Embeddings Engine:</span>
              <span className="text-slate-300 font-mono">bge-small-en (Local)</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Chunk Cache:</span>
              <span className="text-slate-300 font-mono">SQLite FTS5</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
