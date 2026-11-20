import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  File
} from 'lucide-react';
import { FileNode } from '@nexcode/shared';
import { useEditorStore } from '../../stores/useEditorStore';

interface FileTreeItemProps {
  node: FileNode;
  level: number;
}

export const FileTreeItem: React.FC<FileTreeItemProps> = ({ node, level }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { openFile, openTabs, activeTabId } = useEditorStore();

  const activeTab = openTabs.find((t) => t.id === activeTabId);
  const isSelected = activeTab?.filePath === node.path;

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
        }
      } else {
        openFile({
          path: node.path,
          name: node.name,
          content: `// Content of ${node.name}`
        });
      }
    }
  };

  const getFileIcon = () => {
    const ext = node.extension?.toLowerCase();
    if (['ts', 'tsx', 'js', 'jsx', 'py', 'rs', 'go', 'java', 'c', 'cpp'].includes(ext || '')) {
      return <FileCode className="w-4 h-4 text-indigo-400" />;
    }
    if (['json', 'yaml', 'yml', 'md', 'xml', 'html', 'css'].includes(ext || '')) {
      return <FileText className="w-4 h-4 text-emerald-400" />;
    }
    return <File className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div>
      <div
        onClick={handleClick}
        style={{ paddingLeft: `${level * 12 + 6}px` }}
        className={`flex items-center space-x-1.5 py-1 px-2 rounded cursor-pointer text-xs transition-colors select-none ${
          isSelected
            ? 'bg-indigo-600/20 text-indigo-300 font-medium'
            : 'text-slate-300 hover:bg-nexcode-800 hover:text-white'
        }`}
      >
        {node.isDirectory ? (
          <>
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            )}
            {isOpen ? (
              <FolderOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-amber-400 flex-shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5 flex-shrink-0" />
            {getFileIcon()}
          </>
        )}
        <span className="truncate">{node.name}</span>
      </div>

      {node.isDirectory && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem key={child.path} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
