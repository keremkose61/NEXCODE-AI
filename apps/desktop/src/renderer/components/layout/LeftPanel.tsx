import React, { useState, useEffect } from 'react';
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
  FileText,
  GitBranch,
  UploadCloud,
  DownloadCloud,
  Eye,
  Plus,
  Minus,
  Check,
  ShieldAlert,
  ChevronDown,
  GitPullRequest
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { useEditorStore } from '../../stores/useEditorStore';
import { useGitStore } from '../../stores/useGitStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { FileTreeItem } from '../explorer/FileTreeItem';

export const LeftPanel: React.FC = () => {
  const { leftSidebarOpen, activeLeftTab, leftPanelWidth, openPRReview } = useUIStore();
  const { projectName, rootPath, files, openFolderDialog, refreshFiles, createFile, createFolder, isLoading } =
    useProjectStore();
  const { openFile, openTabs } = useEditorStore();
  const { settings } = useSettingsStore();
  const isLight = settings.theme === 'nova-light';
  const {
    isRepo,
    branch,
    branches,
    files: gitFiles,
    fetchStatus,
    stageFile,
    stageAll,
    unstageFile,
    commit,
    checkoutBranch,
    openDiff,
    pull,
    push,
    isLoading: isGitLoading
  } = useGitStore();
  const { addNotification } = useNotificationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [fileFilter, setFileFilter] = useState('');
  const [newFileInputOpen, setNewFileInputOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderInputOpen, setNewFolderInputOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [newBranchInput, setNewBranchInput] = useState('');
  const [showPushConfirmModal, setShowPushConfirmModal] = useState(false);

  useEffect(() => {
    if (activeLeftTab === 'git') {
      fetchStatus();
    }
  }, [activeLeftTab, fetchStatus]);

  if (!leftSidebarOpen) return null;

  const stagedFiles = gitFiles.filter((f) => f.staged);
  const unstagedFiles = gitFiles.filter((f) => !f.staged);

  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      addNotification({ type: 'warning', message: 'Please enter a commit message.' });
      return;
    }
    const res = await commit(commitMessage);
    if (res.success) {
      addNotification({
        type: 'success',
        title: 'Commit Created',
        message: `Committed as [${res.hash}]: ${commitMessage}`
      });
      setCommitMessage('');
    } else {
      addNotification({
        type: 'error',
        title: 'Commit Failed',
        message: res.error || 'Failed to create commit.'
      });
    }
  };

  const handlePull = async () => {
    addNotification({ type: 'info', message: 'Pulling latest changes from remote...' });
    const res = await pull();
    if (res.success) {
      addNotification({ type: 'success', message: 'Repository updated from remote.' });
    } else {
      addNotification({ type: 'warning', message: res.output || 'Pull completed.' });
    }
  };

  const handlePushConfirmed = async () => {
    setShowPushConfirmModal(false);
    addNotification({ type: 'info', message: 'Pushing changes to remote...' });
    const res = await push(true);
    if (res.success) {
      addNotification({ type: 'success', message: 'Changes successfully pushed to remote.' });
    } else {
      addNotification({
        type: 'error',
        title: 'Push Failed',
        message: res.error || 'Failed to push to remote repository.'
      });
    }
  };

  const handleCreateBranch = async () => {
    if (!newBranchInput.trim()) return;
    const res = await checkoutBranch(newBranchInput.trim(), true);
    if (res.success) {
      addNotification({
        type: 'success',
        message: `Created and switched to branch '${newBranchInput.trim()}'.`
      });
      setNewBranchInput('');
      setShowBranchDropdown(false);
    } else {
      addNotification({ type: 'error', message: res.error || 'Failed to create branch.' });
    }
  };

  return (
    <aside
      style={{ width: `${leftPanelWidth}px` }}
      className={`border-r flex flex-col select-none text-xs h-full overflow-hidden z-20 flex-shrink-0 transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-[#0b0e17] border-[#1c2438] text-slate-200'
      }`}
    >
      {/* Tab: Proje Gezgini / Explorer */}
      {activeLeftTab === 'explorer' && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div
            className={`h-9 px-3 border-b flex items-center justify-between font-semibold ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-700'
                : 'bg-[#080a10] border-[#1c2438] text-slate-300'
            }`}
          >
            <div className="flex items-center space-x-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="uppercase tracking-wider text-[11px] font-bold truncate">
                {projectName || 'Workspace'}
              </span>
            </div>
            <div className="flex items-center space-x-0.5 text-slate-400">
              <button
                onClick={() => {
                  setNewFileInputOpen(!newFileInputOpen);
                  setNewFolderInputOpen(false);
                }}
                title="Yeni Dosya"
                className="p-1 hover:text-cyan-400 hover:bg-slate-700/20 rounded transition-colors"
              >
                <FilePlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setNewFolderInputOpen(!newFolderInputOpen);
                  setNewFileInputOpen(false);
                }}
                title="Yeni Klasör"
                className="p-1 hover:text-amber-400 hover:bg-slate-700/20 rounded transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={openFolderDialog}
                title="Klasör Aç..."
                className="p-1 hover:text-purple-400 hover:bg-slate-700/20 rounded transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={refreshFiles}
                title="Gezgini Yenile"
                className={`p-1 hover:text-cyan-400 hover:bg-slate-700/20 rounded transition-colors ${
                  isLoading ? 'animate-spin text-cyan-400' : ''
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Dosya Filtreleme / Arama Çubuğu */}
          <div
            className={`px-2 py-1.5 border-b ${
              isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-[#0d111b] border-[#1c2438]'
            }`}
          >
            <div className="relative flex items-center">
              <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
              <input
                type="text"
                value={fileFilter}
                onChange={(e) => setFileFilter(e.target.value)}
                placeholder="Dosya filtrele..."
                className={`w-full pl-7 pr-5 py-1 rounded-md text-[11px] focus:outline-none transition-colors border ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-purple-500'
                    : 'bg-[#121727] border-[#1f283e] text-slate-200 placeholder-slate-500 focus:border-cyan-500'
                }`}
              />
              {fileFilter && (
                <button
                  onClick={() => setFileFilter('')}
                  className="absolute right-1.5 text-slate-400 hover:text-white text-[10px]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Yeni Dosya Oluşturma Giriş Alanı */}
          {newFileInputOpen && (
            <div
              className={`p-2 border-b ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080a10] border-[#1c2438]'
              }`}
            >
              <input
                type="text"
                autoFocus
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newFileName.trim()) {
                    createFile(newFileName.trim());
                    openFile({
                      path: newFileName.trim(),
                      name: newFileName.trim(),
                      content: ''
                    });
                    setNewFileName('');
                    setNewFileInputOpen(false);
                  } else if (e.key === 'Escape') {
                    setNewFileInputOpen(false);
                  }
                }}
                placeholder="Yeni dosya adı (ör. app.ts)..."
                className={`w-full px-2 py-1 rounded border text-xs focus:outline-none ${
                  isLight
                    ? 'bg-white border-purple-400 text-slate-800'
                    : 'bg-[#121727] border-cyan-500/60 text-slate-100'
                }`}
              />
            </div>
          )}

          {/* Yeni Klasör Oluşturma Giriş Alanı */}
          {newFolderInputOpen && (
            <div
              className={`p-2 border-b ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080a10] border-[#1c2438]'
              }`}
            >
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newFolderName.trim()) {
                    createFolder(newFolderName.trim());
                    setNewFolderName('');
                    setNewFolderInputOpen(false);
                  } else if (e.key === 'Escape') {
                    setNewFolderInputOpen(false);
                  }
                }}
                placeholder="Yeni klasör adı (ör. components)..."
                className={`w-full px-2 py-1 rounded border text-xs focus:outline-none ${
                  isLight
                    ? 'bg-white border-amber-400 text-slate-800'
                    : 'bg-[#121727] border-amber-500/60 text-slate-100'
                }`}
              />
            </div>
          )}

          {/* Dosya Ağacı Listesi */}
          <div className="flex-1 overflow-y-auto py-1">
            {files.length > 0 ? (
              files.map((node) => (
                <FileTreeItem key={node.path} node={node} level={0} filter={fileFilter} />
              ))
            ) : (
              <div className="p-4 text-center text-slate-500">
                <p>Çalışma klasörü açılmadı.</p>
                <button
                  onClick={openFolderDialog}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium transition-colors shadow-sm"
                >
                  Klasör Aç
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
            Projede Ara
          </span>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Dosyalar içinde ara..."
              className={`w-full border rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none transition-colors ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-purple-500'
                  : 'bg-[#080a10] border-[#1c2438] text-slate-100 placeholder-slate-500 focus:border-cyan-500'
              }`}
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <div className="flex-1 overflow-y-auto">
            {searchQuery ? (
              openTabs
                .filter((tab) => tab.content.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((tab) => (
                  <div
                    key={tab.id}
                    onClick={() =>
                      openFile({ path: tab.filePath, name: tab.fileName, content: tab.content })
                    }
                    className={`p-2.5 rounded-lg border cursor-pointer space-y-1 mb-2 transition-all ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 hover:border-purple-400'
                        : 'bg-[#101422] border-[#1c2438] hover:border-cyan-500/50 hover:shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                    }`}
                  >
                    <div className="font-semibold text-cyan-400 flex items-center space-x-1">
                      <FileCode className="w-3.5 h-3.5" />
                      <span>{tab.fileName}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-2 font-mono">
                      {tab.content}
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-[11px] text-slate-500 italic text-center py-4">
                Açık dosyalar arasında aramak için bir kelime yazın.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Git / Source Control */}
      {activeLeftTab === 'git' && (
        <div
          className={`flex flex-col h-full overflow-hidden ${
            isLight ? 'bg-white' : 'bg-[#080a10]'
          }`}
        >
          {/* Header & Branch Management */}
          <div
            className={`h-9 px-3 border-b flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d111b] border-[#1c2438]'
            }`}
          >
            <div className="relative">
              <button
                onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-md border font-mono text-[11px] transition-colors ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-700'
                    : 'bg-[#131826] border-[#1c2438] text-slate-200 hover:bg-[#1a2133]'
                }`}
                title="Git Dalı Değiştir"
              >
                <GitBranch className="w-3 h-3 text-cyan-400" />
                <span>{branch || 'master'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Branch Dropdown */}
              {showBranchDropdown && (
                <div className="absolute top-7 left-0 z-50 w-52 bg-nexcode-900 border border-nexcode-750 rounded-lg shadow-xl p-2 space-y-2">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">
                    Switch Branch
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {branches.map((b) => (
                      <div
                        key={b}
                        onClick={() => {
                          checkoutBranch(b);
                          setShowBranchDropdown(false);
                        }}
                        className={`px-2 py-1 rounded cursor-pointer text-xs font-mono flex items-center justify-between ${
                          b === branch ? 'bg-indigo-600/30 text-indigo-200' : 'hover:bg-nexcode-800 text-slate-300'
                        }`}
                      >
                        <span>{b}</span>
                        {b === branch && <Check className="w-3 h-3 text-indigo-400" />}
                      </div>
                    ))}
                  </div>

                  {/* Create Branch Input */}
                  <div className="border-t border-nexcode-800 pt-2 space-y-1">
                    <span className="text-[10px] text-slate-400">New Branch:</span>
                    <input
                      type="text"
                      value={newBranchInput}
                      onChange={(e) => setNewBranchInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateBranch()}
                      placeholder="branch-name..."
                      className="w-full bg-nexcode-950 px-2 py-1 rounded border border-nexcode-750 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={openPRReview}
                title="Generate AI Pull Request & Code Review"
                className="px-1.5 py-0.5 rounded bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 text-[10px] flex items-center space-x-1 font-medium transition-colors"
              >
                <GitPullRequest className="w-3 h-3" />
                <span>PR Review</span>
              </button>
              <button
                onClick={handlePull}
                title="Pull from Remote"
                className="p-1 hover:text-white hover:bg-nexcode-800 rounded text-slate-400 transition-colors"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowPushConfirmModal(true)}
                title="Push to Remote (Safety Gated)"
                className="p-1 hover:text-white hover:bg-nexcode-800 rounded text-slate-400 transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={fetchStatus}
                title="Refresh Status"
                className={`p-1 hover:text-white hover:bg-nexcode-800 rounded text-slate-400 transition-colors ${
                  isGitLoading ? 'animate-spin text-indigo-400' : ''
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Commit Box */}
          <div className="p-3 border-b border-nexcode-800 bg-nexcode-900/30 space-y-2">
            <textarea
              rows={2}
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleCommit();
                }
              }}
              placeholder="Commit message (Ctrl+Enter to commit)..."
              className="w-full bg-nexcode-950 border border-nexcode-750 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs resize-none"
            />
            <button
              onClick={handleCommit}
              disabled={!commitMessage.trim()}
              className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Commit Changes</span>
            </button>
          </div>

          {/* Staged & Unstaged File Lists */}
          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            {/* Staged Files Section */}
            {stagedFiles.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-slate-400 px-1">
                  <span>Staged Changes ({stagedFiles.length})</span>
                </div>
                <div className="space-y-0.5">
                  {stagedFiles.map((file) => (
                    <div
                      key={file.path}
                      className="group flex items-center justify-between px-2 py-1 rounded bg-nexcode-900/60 hover:bg-nexcode-850 text-slate-300 text-xs transition-colors"
                    >
                      <span className="font-mono truncate text-[11px]">{file.path}</span>
                      <div className="flex items-center space-x-1">
                        <span className="font-mono text-[10px] text-emerald-400 font-bold px-1">
                          {file.status[0].toUpperCase()}
                        </span>
                        <button
                          onClick={() => openDiff(file.path, true)}
                          title="View Diff"
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-indigo-300 text-slate-400"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => unstageFile(file.path)}
                          title="Unstage File"
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-400 text-slate-400"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unstaged Changes Section */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-slate-400 px-1">
                <span>Changes ({unstagedFiles.length})</span>
                {unstagedFiles.length > 0 && (
                  <button
                    onClick={stageAll}
                    title="Stage All Changes"
                    className="text-indigo-400 hover:text-indigo-300 text-[10px] flex items-center space-x-0.5"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Stage All</span>
                  </button>
                )}
              </div>

              {unstagedFiles.length === 0 && stagedFiles.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs">
                  Working tree is clean. No uncommitted changes.
                </div>
              ) : (
                <div className="space-y-0.5">
                  {unstagedFiles.map((file) => (
                    <div
                      key={file.path}
                      className="group flex items-center justify-between px-2 py-1 rounded bg-nexcode-900/40 hover:bg-nexcode-850 text-slate-300 text-xs transition-colors"
                    >
                      <span className="font-mono truncate text-[11px]">{file.path}</span>
                      <div className="flex items-center space-x-1">
                        <span
                          className={`font-mono text-[10px] font-bold px-1 ${
                            file.status === 'untracked' ? 'text-blue-400' : 'text-amber-400'
                          }`}
                        >
                          {file.status === 'untracked' ? 'U' : file.status[0].toUpperCase()}
                        </span>
                        <button
                          onClick={() => openDiff(file.path, false)}
                          title="View Diff"
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-indigo-300 text-slate-400"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => stageFile(file.path)}
                          title="Stage File"
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-emerald-400 text-slate-400"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Remote Push Safety Confirmation Modal */}
          {showPushConfirmModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-nexcode-900 border border-amber-500/40 rounded-xl p-4 max-w-sm w-full space-y-3 shadow-2xl">
                <div className="flex items-center space-x-2 text-amber-400">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                  <span className="font-bold text-sm">Confirm Remote Push</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You are about to push commits on branch <code className="text-indigo-300 font-mono">{branch}</code> to the remote repository.
                </p>
                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-nexcode-800">
                  <button
                    onClick={() => setShowPushConfirmModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-nexcode-800 hover:bg-nexcode-750 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePushConfirmed}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-md"
                  >
                    Confirm Push
                  </button>
                </div>
              </div>
            </div>
          )}
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
    </aside>
  );
};
