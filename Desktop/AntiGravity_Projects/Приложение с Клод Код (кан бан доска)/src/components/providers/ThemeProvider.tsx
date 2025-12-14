'use client';

import React, { useEffect } from 'react';
import { useThemeStore } from '@/lib/stores/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode, isDark, setSystemPrefersDark } = useThemeStore();

  useEffect(() => {
    // Initialize theme on mount
    const htmlElement = document.documentElement;
    const savedMode = localStorage.getItem('theme-storage');

    if (savedMode) {
      try {
        const parsedState = JSON.parse(savedMode);
        if (parsedState.state && parsedState.state.mode) {
          const currentMode = parsedState.state.mode;
          if (currentMode === 'dark' || (currentMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            htmlElement.classList.add('dark');
          } else {
            htmlElement.classList.remove('dark');
          }
        }
      } catch (e) {
        // Fallback to system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          htmlElement.classList.add('dark');
          setSystemPrefersDark(true);
        }
      }
    } else {
      // First time user - use system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        htmlElement.classList.add('dark');
        setSystemPrefersDark(true);
      }
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
      // If user has set mode to 'auto', apply system preference
      const savedMode = localStorage.getItem('theme-storage');
      if (savedMode) {
        try {
          const parsedState = JSON.parse(savedMode);
          if (parsedState.state && parsedState.state.mode === 'auto') {
            if (e.matches) {
              htmlElement.classList.add('dark');
            } else {
              htmlElement.classList.remove('dark');
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setSystemPrefersDark]);

  return <>{children}</>;
}
