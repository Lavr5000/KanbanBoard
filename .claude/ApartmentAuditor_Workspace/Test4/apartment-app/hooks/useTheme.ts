import { colors } from '../constants/colors';
import { useUIStore } from '../services/store/uiStore';

// Hook for accessing theme colors and controls
export function useTheme() {
  const themeMode = useUIStore((state) => state.themeMode);
  const setThemeMode = useUIStore((state) => state.setThemeMode);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const isDarkMode = useUIStore((state) => state.isDarkMode);

  const themeColors = isDarkMode ? colors.dark : colors.light;

  return {
    colors: themeColors,
    themeMode,
    isDarkMode,
    setThemeMode,
    toggleTheme,
  };
}
