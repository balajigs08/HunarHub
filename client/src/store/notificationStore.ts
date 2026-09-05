import { create } from 'zustand';
import api from '../services/api';
import type { Notification } from '../types';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  reset: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    try {
      set({ isLoading: true });
      const res = await api.get('/notifications');
      set({
        notifications: res.data.data.notifications,
        unreadCount: res.data.data.unreadCount,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  markRead: async (id) => {
    await api.put(`/notifications/${id}/read`);
    set((state) => ({
      notifications: state.notifications.map((n) => n._id === id ? { ...n, isRead: true } : n),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await api.put('/notifications/read-all');
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  reset: () => set({ notifications: [], unreadCount: 0 }),
}));
