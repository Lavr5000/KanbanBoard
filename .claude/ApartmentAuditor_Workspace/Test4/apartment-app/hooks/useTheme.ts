import { colors } from '../constants/colors';

// Hook for accessing theme colors and controls
export function useTheme() {
  // Temporary implementation - will be connected to UI store later
  const themeMode: 'light' | 'dark' | 'system' = 'light';
  const setThemeMode = (mode: 'light' | 'dark' | 'system') => {
    // Will be connected to UI store later
    console.log('Setting theme mode to:', mode);
  };
  const toggleTheme = () => {
    const newMode: 'light' | 'dark' = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };
  const isDarkMode = themeMode === 'dark';

  const themeColors = isDarkMode ? colors.dark : colors.light;

  return {
    colors: themeColors,
    themeMode,
    isDarkMode,
    setThemeMode,
    toggleTheme,
  };
}