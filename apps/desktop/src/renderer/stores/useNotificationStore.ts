import { create } from 'zustand';

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
}

interface NotificationState {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (n) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newItem: NotificationItem = { ...n, id };

    set((state) => ({ notifications: [...state.notifications, newItem] }));

    const duration = n.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((item) => item.id !== id)
        }));
      }, duration);
    }
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }))
}));
