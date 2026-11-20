import React, { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useNotificationStore } from '../../stores/useNotificationStore';

export const RenameModal: React.FC = () => {
  const { isRenameOpen, itemToRename, confirmRename, cancelRename } = useProjectStore();
  const { addNotification } = useNotificationStore();
  const [name, setName] = useState('');

  useEffect(() => {
    if (itemToRename) {
      setName(itemToRename.name);
    }
  }, [itemToRename]);

  if (!isRenameOpen || !itemToRename) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name === itemToRename.name) {
      cancelRename();
      return;
    }

    const success = await confirmRename(name.trim());
    if (success) {
      addNotification({
        type: 'success',
        message: `Renamed to ${name.trim()}`
      });
    } else {
      addNotification({
        type: 'error',
        message: `Failed to rename ${itemToRename.name}`
      });
    }
  };

  return (
    <div
      onClick={cancelRename}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-nexcode-900 border border-nexcode-750 rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs"
      >
        <div className="p-3.5 border-b border-nexcode-800 bg-nexcode-950 flex items-center space-x-2 text-indigo-400 font-bold text-sm">
          <Edit2 className="w-4 h-4" />
          <span>Rename Item</span>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <label className="block text-slate-300 font-medium">New Name:</label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-nexcode-950 border border-indigo-500 rounded-md p-2 text-slate-100 text-xs focus:outline-none"
          />

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={cancelRename}
              className="px-3 py-1.5 rounded text-slate-300 hover:text-white hover:bg-nexcode-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
            >
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
