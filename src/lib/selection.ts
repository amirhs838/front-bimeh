"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Selected insurance products (card checkboxes).
 * Persisted in sessionStorage only — cleared when the tab closes.
 * `skipHydration` is used so SSR markup matches the first client render;
 * AppShell rehydrates in an effect.
 */
type SelectionState = {
  items: string[];
  toggle: (slug: string) => void;
  clear: () => void;
};

export const useSelection = create<SelectionState>()(
  persist(
    (set) => ({
      items: [],
      toggle: (slug) =>
        set((s) => ({
          items: s.items.includes(slug)
            ? s.items.filter((x) => x !== slug)
            : [...s.items, slug],
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "bimeh-selection",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
    }
  )
);
