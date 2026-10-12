"use client";

import { create } from "zustand";

/** Global UI chrome state: drawer + sheets. */
type UIState = {
  drawerOpen: boolean;
  supportOpen: boolean;
  chatOpen: boolean;
  /** text to seed the chat with when it opens (from the chat bar) */
  chatSeed: string | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  openSupport: () => void;
  closeSupport: () => void;
  openChat: (seed?: string) => void;
  closeChat: () => void;
};

export const useUI = create<UIState>((set) => ({
  drawerOpen: false,
  supportOpen: false,
  chatOpen: false,
  chatSeed: null,
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  openSupport: () => set({ supportOpen: true }),
  closeSupport: () => set({ supportOpen: false }),
  openChat: (seed) => set({ chatOpen: true, chatSeed: seed ?? null }),
  closeChat: () => set({ chatOpen: false, chatSeed: null }),
}));
