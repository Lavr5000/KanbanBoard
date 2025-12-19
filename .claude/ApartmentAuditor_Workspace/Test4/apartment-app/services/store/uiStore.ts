import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UIState } from '../types/index';

// Extended interface for the store to include actions
interface UIStore extends UIState {
  // Actions
  setFinishMode: (mode: 'draft' | 'finish') => void;
  setActiveTab: (tab: 'objects' | 'services') => void;
  setLoading: (loading: boolean) => void;
  toggleFinishMode: () => void; // Convenience method

  // Theme actions
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  get isDarkMode(): boolean; // Computed property
}

export const useUIStore = create<UIStore>()(
  (set, get) => ({
    // Initial state
    finishMode: 'draft',
    activeTab: 'objects',
    isLoading: false,
    themeMode: 'dark',

    // Actions
    setFinishMode: (mode: 'draft' | 'finish') => set({ finishMode: mode }),

    setActiveTab: (tab: 'objects' | 'services') => set({ activeTab: tab }),

    setLoading: (loading: boolean) => set({ isLoading: loading }),

    toggleFinishMode: () => set((state: UIStore) => ({
      finishMode: state.finishMode === 'draft' ? 'finish' : 'draft'
    })),

    // Theme actions
    setThemeMode: (mode: 'light' | 'dark' | 'system') => set({ themeMode: mode }),

    toggleTheme: () => {
      const { themeMode } = get();
      const newMode = themeMode === 'dark' ? 'light' : 'dark';
      set({ themeMode: newMode });
    },

    get isDarkMode() {
      // Force dark mode always
      return true;
    }
  })
);

// Simple persistence for UI state (optional, not critical)
export const useUIStoreWithPersistence = create<UIStore>()(
  persist(
    (set, get) => ({
      // Initial state
      finishMode: 'draft',
      activeTab: 'objects',
      isLoading: false,
      themeMode: 'dark',

      // Actions
      setFinishMode: (mode: 'draft' | 'finish') => set({ finishMode: mode }),

      setActiveTab: (tab: 'objects' | 'services') => set({ activeTab: tab }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      toggleFinishMode: () => set((state: UIStore) => ({
        finishMode: state.finishMode === 'draft' ? 'finish' : 'draft'
      })),

      // Theme actions
      setThemeMode: (mode: 'light' | 'dark' | 'system') => set({ themeMode: mode }),

      toggleTheme: () => {
        const { themeMode } = get();
        const newMode = themeMode === 'dark' ? 'light' : 'dark';
        set({ themeMode: newMode });
      },

      get isDarkMode() {
        // Force dark mode always
        return true;
      }
    }),
    {
      name: 'ui-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: UIStore) => ({
        finishMode: state.finishMode,
        activeTab: state.activeTab,
        themeMode: state.themeMode,
        // isLoading is not persisted as it's temporary state
      }),
    }
  )
);

// Selectors for performance optimization
export const selectFinishMode = (state: UIStore) => state.finishMode;
export const selectActiveTab = (state: UIStore) => state.activeTab;
export const selectIsLoading = (state: UIStore) => state.isLoading;