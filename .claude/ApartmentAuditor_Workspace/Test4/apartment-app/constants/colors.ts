// App color constants for consistent theming

export const colors = {
  // Light theme
  light: {
    primary: '#007AFF',
    secondary: '#5AC8FA',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',

    // Background colors
    background: '#F2F2F7',
    card: '#FFFFFF',
    surface: '#FFFFFF',

    // Text colors
    text: '#000000',
    textSecondary: '#8E8E93',
    textTertiary: '#C7C7CC',

    // Border colors
    border: '#C6C6C8',
    divider: '#C6C6C8',

    // Tab bar
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#007AFF',
  },

  // Dark theme
  dark: {
    primary: '#2196F3',        // Blue accent from specification
    secondary: '#03DAC6',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',         // Red for FAB button

    // Background colors
    background: '#121212',    // Deep black from specification
    card: '#1E1E1E',          // Dark surface from specification
    surface: '#1E1E1E',

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textTertiary: '#757575',

    // Border colors
    border: '#333333',
    divider: '#333333',

    // Tab bar
    tabIconDefault: '#BDBDBD',
    tabIconSelected: '#2196F3',
  }
};

// Status colors (theme-independent)
export const statusColors = {
  approved: '#34C759',
  defect: '#FF3B30',
  pending: '#FF9500',
  notInspected: '#8E8E93',
};

// Helper functions for status colors
export const getStatusColor = (status?: string | null) => {
  switch (status) {
    case 'complies':
      return statusColors.approved;
    case 'defect':
      return statusColors.defect;
    case 'not_inspected':
      return statusColors.notInspected;
    default:
      return statusColors.notInspected;
  }
};

// Helper functions for opacity variations
export const withOpacity = (hex: string, opacity: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Text styles
export const TEXT_STYLES = {
  // Заголовки
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  // Основной текст
  body: {
    fontSize: 16,
  },
  bodySmall: {
    fontSize: 14,
  },
  // Подписи
  caption: {
    fontSize: 12,
  },
  hint: {
    fontSize: 13,
  },
};

// Sizes and spacing
export const SIZES = {
  padding: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  margin: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999,
  },
  shadow: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 8,
    },
  },
};

// Default dark theme colors for enforced dark mode
export const defaultColors = colors.dark;

// Export dark theme as default colors (enforced)
export const {
  primary,
  secondary,
  success,
  warning,
  error,
  background,
  card,
  surface,
  text,
  textSecondary,
  textTertiary,
  border,
  divider
} = colors.dark;