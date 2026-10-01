"use client";

import { create } from "zustand";

type SidebarStore = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

/** Mobile sidebar drawer state, shared by the Topbar menu button and the Sidebar. */
export const useSidebar = create<SidebarStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
