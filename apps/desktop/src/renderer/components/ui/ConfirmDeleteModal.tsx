import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useNotificationStore } from '../../stores/useNotificationStore';

export const ConfirmDeleteModal: React.FC = () => {
  const { isConfirmDeleteOpen, itemToDelete, confirmDelete, cancelDelete } = useProjectStore();
  const { addNotification } = useNotificationStore();

  if (!isConfirmDeleteOpen || !itemToDelete) return null;

  const handleDelete = async () => {
    const success = await confirmDelete();
    if (success) {
      addNotification({
        type: 'warning',
        title: 'Deleted Item',
        message: `Permanently removed ${itemToDelete.name}`
      });
    } else {
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: `Could not delete ${itemToDelete.name}`
      });
    }
  };

  return (
    <div
      onClick={cancelDelete}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-nexcode-900 border border-rose-500/30 rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs"
      >
        <div className="p-4 border-b border-nexcode-800 bg-nexcode-950 flex items-center space-x-2 text-rose-400 font-bold text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>Confirm Permanent Deletion</span>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-slate-200 leading-relaxed text-xs">
            Are you sure you want to permanently delete{' '}
            <strong className="text-white font-mono bg-nexcode-950 px-1.5 py-0.5 rounded border border-nexcode-800">
              {itemToDelete.name}
            </strong>
            {itemToDelete.isDirectory ? ' and all its contents' : ''}?
          </p>
          <p className="text-[11px] text-slate-400">
            This action cannot be undone. The item will be deleted directly from your file system.
          </p>
        </div>

        <div className="h-12 px-4 border-t border-nexcode-800 bg-nexcode-950 flex items-center justify-end space-x-2">
          <button
            onClick={cancelDelete}
            className="px-3 py-1.5 rounded text-slate-300 hover:text-white hover:bg-nexcode-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-3.5 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium flex items-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
};
