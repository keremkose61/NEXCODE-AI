import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  File,
  Trash2,
  Edit2,
  FilePlus,
  FolderPlus,
  Database,
  Terminal,
  Palette
} from 'lucide-react';
import { FileNode } from '@nexcode/shared';
import { useEditorStore } from '../../stores/useEditorStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { useGitStore } from '../../stores/useGitStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useNotificationStore } from '../../stores/useNotificationStore';

interface FileTreeItemProps {
  node: FileNode;
  level: number;
  filter?: string;
}

export const FileTreeItem: React.FC<FileTreeItemProps> = ({ node, level, filter = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { openFile, openTabs, activeTabId } = useEditorStore();
  const { promptDelete, promptRename, createFile, createFolder } = useProjectStore();
  const { files: gitFiles } = useGitStore();
  const { settings } = useSettingsStore();

  const isLight = settings.theme === 'nova-light';
  const activeTab = openTabs.find((t) => t.id === activeTabId);
  const isSelected = activeTab?.filePath === node.path;

  // Filter check: if filter is set, show if this node or any child matches
  const matchesFilter = (n: FileNode, q: string): boolean => {
    if (!q) return true;
    if (n.name.toLowerCase().includes(q.toLowerCase())) return true;
    if (n.children) {
      return n.children.some((child) => matchesFilter(child, q));
    }
    return false;
  };

  if (filter && !matchesFilter(node, filter)) {
    return null;
  }

  // Git status for this file
  const gitStatus = React.useMemo(() => {
    if (node.isDirectory) return null;
    const found = gitFiles.find(
      (f) =>
        f.path === node.path ||
        node.path.endsWith(f.path) ||
        f.path.endsWith(node.name)
    );
    return found ? found.status : null;
  }, [gitFiles, node.path, node.isDirectory, node.name]);

  const handleClick = async () => {
    if (node.isDirectory) {
      setIsOpen(!isOpen);
    } else {
      if (window.nexcode) {
        const res = await window.nexcode.fs.readFile(node.path);
        if (res.success && res.content !== undefined) {
          openFile({
            path: node.path,
            name: node.name,
            content: res.content
          });
        } else {
          useNotificationStore.getState().addNotification({
            type: 'error',
            title: 'Dosya Okuma Hatası',
            message: res.error || `Dosya okunamadı: ${node.name}`
          });
        }
      } else {
        openFile({
          path: node.path,
          name: node.name,
          content: `// ${node.name} içeriği`
        });
      }
    }
  };

  const getFileIcon = () => {
    const ext = node.extension?.toLowerCase() || node.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return <FileCode className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_4px_rgba(6,182,212,0.4)]" />;
      case 'js':
      case 'jsx':
        return <FileCode className="w-4 h-4 text-amber-300" />;
      case 'py':
        return <FileCode className="w-4 h-4 text-yellow-400" />;
      case 'rs':
        return <FileCode className="w-4 h-4 text-orange-400" />;
      case 'go':
        return <FileCode className="w-4 h-4 text-cyan-300" />;
      case 'css':
      case 'scss':
        return <Palette className="w-4 h-4 text-pink-400" />;
      case 'html':
        return <FileCode className="w-4 h-4 text-orange-500" />;
      case 'json':
      case 'yaml':
      case 'yml':
      case 'toml':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'sql':
      case 'db':
      case 'sqlite':
        return <Database className="w-4 h-4 text-purple-400" />;
      case 'sh':
      case 'bash':
      case 'ps1':
      case 'bat':
        return <Terminal className="w-4 h-4 text-teal-400" />;
      case 'md':
      case 'txt':
        return <FileText className="w-4 h-4 text-slate-400" />;
      default:
        return <File className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ paddingLeft: `${level * 14 + 8}px` }}
        className={`flex items-center justify-between py-1 px-2 rounded-lg cursor-pointer text-xs transition-all select-none group ${
          isSelected
            ? isLight
              ? 'bg-purple-100 text-purple-700 font-semibold border-l-2 border-purple-600'
              : 'bg-[#151c2e] text-cyan-300 font-medium border-l-2 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
            : isLight
            ? 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
            : 'text-slate-300 hover:bg-[#121727] hover:text-white'
        }`}
      >
        <div className="flex items-center space-x-1.5 truncate flex-1">
          {node.isDirectory ? (
            <>
              {isOpen || filter ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              )}
              {isOpen || filter ? (
                <FolderOpen className="w-4 h-4 text-amber-400 flex-shrink-0 drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]" />
              ) : (
                <Folder className="w-4 h-4 text-amber-400/90 flex-shrink-0" />
              )}
            </>
          ) : (
            <>
              <span className="w-3.5 flex-shrink-0" />
              {getFileIcon()}
            </>
          )}
          <span className="truncate">{node.name}</span>

          {/* Git Durum Göstergesi (M, U, D) */}
          {gitStatus && (
            <span
              className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold leading-none ${
                gitStatus === 'modified'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : gitStatus === 'untracked'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
              title={`Git: ${gitStatus}`}
            >
              {gitStatus === 'modified' ? 'M' : gitStatus === 'untracked' ? 'U' : 'D'}
            </span>
          )}
        </div>

        {/* Hover İşlem Butonları */}
        {isHovered && (
          <div className="flex items-center space-x-1 opacity-90 group-hover:opacity-100 flex-shrink-0 ml-1">
            {node.isDirectory && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const fname = prompt('Yeni dosya adı:');
                    if (fname) createFile(`${node.path}\\${fname}`);
                  }}
                  title="Klasör İçinde Yeni Dosya"
                  className="p-1 hover:text-cyan-300 hover:bg-slate-700/40 rounded transition-colors"
                >
                  <FilePlus className="w-3 h-3 text-slate-400 hover:text-cyan-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const dname = prompt('Yeni klasör adı:');
                    if (dname) createFolder(`${node.path}\\${dname}`);
                  }}
                  title="Klasör İçinde Yeni Klasör"
                  className="p-1 hover:text-amber-300 hover:bg-slate-700/40 rounded transition-colors"
                >
                  <FolderPlus className="w-3 h-3 text-slate-400 hover:text-amber-400" />
                </button>
              </>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                promptRename({ path: node.path, name: node.name });
              }}
              title="Yeniden Adlandır"
              className="p-1 hover:text-purple-300 hover:bg-slate-700/40 rounded transition-colors"
            >
              <Edit2 className="w-3 h-3 text-slate-400 hover:text-purple-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                promptDelete({ path: node.path, name: node.name, isDirectory: node.isDirectory });
              }}
              title="Sil"
              className="p-1 hover:text-rose-400 hover:bg-rose-500/20 rounded transition-colors"
            >
              <Trash2 className="w-3 h-3 text-slate-400 hover:text-rose-400" />
            </button>
          </div>
        )}
      </div>

      {node.isDirectory && (isOpen || !!filter) && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem key={child.path} node={child} level={level + 1} filter={filter} />
          ))}
        </div>
      )}
    </div>
  );
};