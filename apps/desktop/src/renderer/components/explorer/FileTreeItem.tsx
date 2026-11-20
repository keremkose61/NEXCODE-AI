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
  FolderPlus
} from 'lucide-react';
import { FileNode } from '@nexcode/shared';
import { useEditorStore } from '../../stores/useEditorStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { useNotificationStore } from '../../stores/useNotificationStore';

interface FileTreeItemProps {
  node: FileNode;
  level: number;
}

export const FileTreeItem: React.FC<FileTreeItemProps> = ({ node, level }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { openFile, openTabs, activeTabId } = useEditorStore();
  const { promptDelete, promptRename, createFile, createFolder } = useProjectStore();

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
        } else {
          useNotificationStore.getState().addNotification({
            type: 'error',
            title: 'File Read Error',
            message: res.error || `Unable to read file: ${node.name}`
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
    if (['ts', 'tsx', 'js', 'jsx', 'py', 'rs', 'go', 'java', 'c', 'cpp', 'cs', 'php', 'kt', 'sql'].includes(ext || '')) {
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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ paddingLeft: `${level * 12 + 6}px` }}
        className={`flex items-center justify-between py-1 px-2 rounded cursor-pointer text-xs transition-colors select-none group ${
          isSelected
            ? 'bg-indigo-600/20 text-indigo-300 font-medium'
            : 'text-slate-300 hover:bg-nexcode-800 hover:text-white'
        }`}
      >
        <div className="flex items-center space-x-1.5 truncate flex-1">
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

        {/* Action icons on hover */}
        {isHovered && (
          <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 flex-shrink-0 ml-1">
            {node.isDirectory && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const fname = prompt('Enter new file name:');
                    if (fname) createFile(`${node.path}\\${fname}`);
                  }}
                  title="New File Inside"
                  className="p-0.5 hover:text-white hover:bg-nexcode-700 rounded"
                >
                  <FilePlus className="w-3 h-3 text-slate-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const dname = prompt('Enter new folder name:');
                    if (dname) createFolder(`${node.path}\\${dname}`);
                  }}
                  title="New Folder Inside"
                  className="p-0.5 hover:text-white hover:bg-nexcode-700 rounded"
                >
                  <FolderPlus className="w-3 h-3 text-slate-400" />
                </button>
              </>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                promptRename({ path: node.path, name: node.name });
              }}
              title="Rename Item"
              className="p-0.5 hover:text-white hover:bg-nexcode-700 rounded"
            >
              <Edit2 className="w-3 h-3 text-slate-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                promptDelete({ path: node.path, name: node.name, isDirectory: node.isDirectory });
              }}
              title="Delete Item"
              className="p-0.5 hover:text-rose-400 hover:bg-nexcode-700 rounded"
            >
              <Trash2 className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        )}
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
