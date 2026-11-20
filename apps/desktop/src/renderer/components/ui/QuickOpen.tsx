import React, { useState, useEffect, useRef } from 'react';
import { Search, FileCode, FileText, File } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { useEditorStore } from '../../stores/useEditorStore';
import { FileNode } from '@nexcode/shared';

export const QuickOpen: React.FC = () => {
  const { isQuickOpenOpen, closeQuickOpen } = useUIStore();
  const { files } = useProjectStore();
  const { openFile } = useEditorStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten file tree to list of searchable files
  const flatFiles = React.useMemo(() => {
    const list: { name: string; path: string; extension?: string }[] = [];
    function traverse(nodes: FileNode[]) {
      for (const node of nodes) {
        if (!node.isDirectory) {
          list.push({ name: node.name, path: node.path, extension: node.extension });
        }
        if (node.children) {
          traverse(node.children);
        }
      }
    }
    traverse(files);
    return list;
  }, [files]);

  const filtered = flatFiles.filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.path.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isQuickOpenOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isQuickOpenOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isQuickOpenOpen) return null;

  const handleSelectFile = async (item: { name: string; path: string }) => {
    if (window.nexcode) {
      const res = await window.nexcode.fs.readFile(item.path);
      if (res.success && res.content !== undefined) {
        openFile({ path: item.path, name: item.name, content: res.content });
      }
    } else {
      openFile({ path: item.path, name: item.name, content: `// File ${item.name}` });
    }
    closeQuickOpen();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeQuickOpen();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelectFile(filtered[selectedIndex]);
      }
    }
  };

  const getFileIcon = (ext?: string) => {
    if (['ts', 'tsx', 'js', 'jsx', 'py', 'rs', 'go', 'java', 'c', 'cpp'].includes(ext || '')) {
      return <FileCode className="w-4 h-4 text-indigo-400" />;
    }
    if (['json', 'yaml', 'yml', 'md', 'html', 'css'].includes(ext || '')) {
      return <FileText className="w-4 h-4 text-emerald-400" />;
    }
    return <File className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div
      onClick={closeQuickOpen}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-nexcode-900 border border-nexcode-750 rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs"
      >
        <div className="flex items-center px-3 py-2.5 border-b border-nexcode-800 bg-nexcode-950">
          <Search className="w-4 h-4 text-indigo-400 mr-2 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search files by name in workspace..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-xs"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-nexcode-850 text-slate-400 text-[10px] border border-nexcode-750">
            Esc
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.path}
                  onClick={() => handleSelectFile(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'text-slate-300 hover:bg-nexcode-850'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    {getFileIcon(item.extension)}
                    <span className="truncate">{item.name}</span>
                  </div>
                  <span
                    className={`text-[10px] truncate max-w-[200px] font-mono ${
                      isSelected ? 'text-indigo-200' : 'text-slate-500'
                    }`}
                  >
                    {item.path}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-slate-500 text-xs">
              {flatFiles.length === 0
                ? 'No project folder opened.'
                : 'No matching files found.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
