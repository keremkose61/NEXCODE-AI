import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useNotificationStore, NotificationItem } from '../../stores/useNotificationStore';

export const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  if (notifications.length === 0) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />;
    }
  };

  const getBorderColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 bg-emerald-950/40';
      case 'warning':
        return 'border-amber-500/30 bg-amber-950/40';
      case 'error':
        return 'border-rose-500/30 bg-rose-950/40';
      default:
        return 'border-indigo-500/30 bg-indigo-950/40';
    }
  };

  return (
    <div className="fixed bottom-8 right-6 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
      {notifications.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto flex items-start space-x-2.5 p-3 rounded-lg border shadow-xl backdrop-blur-md transition-all text-xs text-slate-200 ${getBorderColor(
            item.type
          )}`}
        >
          {getIcon(item.type)}
          <div className="flex-1 pr-1">
            {item.title && <div className="font-semibold text-slate-100 text-[11px] mb-0.5">{item.title}</div>}
            <div className="text-[11px] leading-relaxed text-slate-300">{item.message}</div>
          </div>
          <button
            onClick={() => removeNotification(item.id)}
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
