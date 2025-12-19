/**
 * UIStore Tests
 *
 * Testing Zustand store for UI state management functionality
 */

import { renderHook, act } from '@testing-library/react-native';
import { useUIStore, selectFinishMode, selectActiveTab, selectIsLoading } from '../../../services/store/uiStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

// Mock the persist middleware
jest.mock('zustand/middleware', () => ({
  persist: (createStore: any) => (...args: any[]) => {
    const store = createStore(...args);
    return {
      ...store,
      persist: {
        setOptions: jest.fn(),
        rehydrate: jest.fn(),
        hasHydrated: () => true,
      },
    };
  },
  createJSONStorage: () => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  }),
}));

describe('UIStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useUIStore());

      expect(result.current.finishMode).toBe('draft');
      expect(result.current.activeTab).toBe('objects');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.themeMode).toBe('dark');
    });

    it('should always return isDarkMode as true', () => {
      const { result } = renderHook(() => useUIStore());

      expect(result.current.isDarkMode).toBe(true);

      // Even after changing theme to light
      act(() => {
        result.current.setThemeMode('light');
      });

      expect(result.current.themeMode).toBe('light');
      expect(result.current.isDarkMode).toBe(true);
    });
  });

  describe('setFinishMode', () => {
    it('should set finish mode to draft', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setFinishMode('finish');
      });

      act(() => {
        result.current.setFinishMode('draft');
      });

      expect(result.current.finishMode).toBe('draft');
    });

    it('should set finish mode to finish', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setFinishMode('finish');
      });

      expect(result.current.finishMode).toBe('finish');
    });
  });

  describe('toggleFinishMode', () => {
    it('should toggle from draft to finish', () => {
      const { result } = renderHook(() => useUIStore());

      // Initial state is draft
      expect(result.current.finishMode).toBe('draft');

      act(() => {
        result.current.toggleFinishMode();
      });

      expect(result.current.finishMode).toBe('finish');
    });

    it('should toggle from finish to draft', () => {
      const { result } = renderHook(() => useUIStore());

      // First set to finish
      act(() => {
        result.current.setFinishMode('finish');
      });

      expect(result.current.finishMode).toBe('finish');

      // Then toggle back to draft
      act(() => {
        result.current.toggleFinishMode();
      });

      expect(result.current.finishMode).toBe('draft');
    });

    it('should handle multiple toggles correctly', () => {
      const { result } = renderHook(() => useUIStore());

      // Toggle multiple times
      act(() => {
        result.current.toggleFinishMode();
      });
      expect(result.current.finishMode).toBe('finish');

      act(() => {
        result.current.toggleFinishMode();
      });
      expect(result.current.finishMode).toBe('draft');

      act(() => {
        result.current.toggleFinishMode();
      });
      expect(result.current.finishMode).toBe('finish');
    });
  });

  describe('setActiveTab', () => {
    it('should set active tab to objects', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setActiveTab('services');
      });

      act(() => {
        result.current.setActiveTab('objects');
      });

      expect(result.current.activeTab).toBe('objects');
    });

    it('should set active tab to services', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setActiveTab('services');
      });

      expect(result.current.activeTab).toBe('services');
    });
  });

  describe('setLoading', () => {
    it('should set loading to true', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should set loading to false', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('setThemeMode', () => {
    it('should set theme mode to light', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setThemeMode('light');
      });

      expect(result.current.themeMode).toBe('light');
    });

    it('should set theme mode to dark', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setThemeMode('light');
      });

      act(() => {
        result.current.setThemeMode('dark');
      });

      expect(result.current.themeMode).toBe('dark');
    });

    it('should set theme mode to system', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setThemeMode('system');
      });

      expect(result.current.themeMode).toBe('system');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from dark to light', () => {
      const { result } = renderHook(() => useUIStore());

      // Initial state is dark
      expect(result.current.themeMode).toBe('dark');

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.themeMode).toBe('light');
    });

    it('should toggle from light to dark', () => {
      const { result } = renderHook(() => useUIStore());

      // First set to light
      act(() => {
        result.current.setThemeMode('light');
      });

      expect(result.current.themeMode).toBe('light');

      // Then toggle back to dark
      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.themeMode).toBe('dark');
    });

    it('should toggle from system to dark', () => {
      const { result } = renderHook(() => useUIStore());

      // First set to system
      act(() => {
        result.current.setThemeMode('system');
      });

      expect(result.current.themeMode).toBe('system');

      // Then toggle - should go to dark as per implementation
      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.themeMode).toBe('dark');
    });
  });

  describe('Selectors', () => {
    it('selectFinishMode should return current finish mode', () => {
      const { result } = renderHook(() => useUIStore());

      expect(selectFinishMode(result.current)).toBe('draft');

      act(() => {
        result.current.setFinishMode('finish');
      });

      expect(selectFinishMode(result.current)).toBe('finish');
    });

    it('selectActiveTab should return current active tab', () => {
      const { result } = renderHook(() => useUIStore());

      expect(selectActiveTab(result.current)).toBe('objects');

      act(() => {
        result.current.setActiveTab('services');
      });

      expect(selectActiveTab(result.current)).toBe('services');
    });

    it('selectIsLoading should return current loading state', () => {
      const { result } = renderHook(() => useUIStore());

      expect(selectIsLoading(result.current)).toBe(false);

      act(() => {
        result.current.setLoading(true);
      });

      expect(selectIsLoading(result.current)).toBe(true);
    });
  });

  describe('Complex UI workflows', () => {
    it('should handle complete UI state workflow', () => {
      const { result } = renderHook(() => useUIStore());

      // Initial state
      expect(result.current).toMatchObject({
        finishMode: 'draft',
        activeTab: 'objects',
        isLoading: false,
        themeMode: 'dark',
      });

      // Simulate user starting inspection
      act(() => {
        result.current.setLoading(true);
      });
      expect(result.current.isLoading).toBe(true);

      // User switches to finish mode
      act(() => {
        result.current.toggleFinishMode();
      });
      expect(result.current.finishMode).toBe('finish');

      // User navigates to services tab
      act(() => {
        result.current.setActiveTab('services');
      });
      expect(result.current.activeTab).toBe('services');

      // User toggles theme (even though isDarkMode always returns true)
      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.themeMode).toBe('light');

      // Process completes
      act(() => {
        result.current.setLoading(false);
      });
      expect(result.current.isLoading).toBe(false);

      // Final state
      expect(result.current).toMatchObject({
        finishMode: 'finish',
        activeTab: 'services',
        isLoading: false,
        themeMode: 'light',
      });
    });

    it('should reset UI state to defaults', () => {
      const { result } = renderHook(() => useUIStore());

      // Change all states
      act(() => {
        result.current.setFinishMode('finish');
        result.current.setActiveTab('services');
        result.current.setLoading(true);
        result.current.setThemeMode('light');
      });

      // Verify states are changed
      expect(result.current).toMatchObject({
        finishMode: 'finish',
        activeTab: 'services',
        isLoading: true,
        themeMode: 'light',
      });

      // Reset to defaults
      act(() => {
        result.current.setFinishMode('draft');
        result.current.setActiveTab('objects');
        result.current.setLoading(false);
        result.current.setThemeMode('dark');
      });

      // Verify reset to defaults
      expect(result.current).toMatchObject({
        finishMode: 'draft',
        activeTab: 'objects',
        isLoading: false,
        themeMode: 'dark',
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid state changes', () => {
      const { result } = renderHook(() => useUIStore());

      // Rapid toggles
      act(() => {
        result.current.toggleFinishMode();
        result.current.toggleFinishMode();
        result.current.toggleFinishMode();
      });

      expect(result.current.finishMode).toBe('finish');

      // Rapid theme changes
      act(() => {
        result.current.toggleTheme();
        result.current.toggleTheme();
        result.current.toggleTheme();
      });

      expect(result.current.themeMode).toBe('light');
    });

    it('should maintain state independence', () => {
      const { result } = renderHook(() => useUIStore());

      // Change finish mode
      act(() => {
        result.current.setFinishMode('finish');
      });

      // Verify other states unchanged
      expect(result.current).toMatchObject({
        activeTab: 'objects',
        isLoading: false,
        themeMode: 'dark',
      });

      // Change active tab
      act(() => {
        result.current.setActiveTab('services');
      });

      // Verify other states unchanged
      expect(result.current).toMatchObject({
        finishMode: 'finish',
        isLoading: false,
        themeMode: 'dark',
      });
    });
  });
});