// Theme preference store — minimal stub.
//
// Current scope: light/dark field + setTheme. Real switching (UI control,
// localStorage persistence, system-preference resolution, DOM `data-theme`
// sync) is left for the sub-app to wire in. See master's pattern with
// `applyTheme.ts` + `useThemeStore` 3-way preference for a full example.

import { create } from 'zustand';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (next: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',
  setTheme: (next) => set({ theme: next }),
}));
