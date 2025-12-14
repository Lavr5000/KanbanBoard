import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  systemPrefersDark: boolean;
  setSystemPrefersDark: (prefersDark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'auto',
      isDark: false,
      systemPrefersDark: false,

      setMode: (mode: ThemeMode) => {
        set({ mode });
        applyTheme(mode);
      },

      setIsDark: (isDark: boolean) => {
        set({ isDark, mode: isDark ? 'dark' : 'light' });
        applyTheme(isDark ? 'dark' : 'light');
      },

      setSystemPrefersDark: (prefersDark: boolean) => {
        set({ systemPrefersDark: prefersDark });
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

function applyTheme(mode: ThemeMode) {
  const html = document.documentElement;

  if (mode === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  } else if (mode === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}
