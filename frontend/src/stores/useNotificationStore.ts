import { create } from "zustand";

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  increment: () => void;
  decrement: (amount?: number) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,

  setUnreadCount: (count) => set({ unreadCount: count }),

  increment: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),

  decrement: (amount = 1) =>
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - amount),
    })),

  reset: () => set({ unreadCount: 0 }),
}));
