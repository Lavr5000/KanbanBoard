// Simple test to verify CategoryCard can be imported
import React from 'react';
import { render } from '@testing-library/react-native';

// Mock all dependencies
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  StyleSheet: {
    create: jest.fn(() => ({})),
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: function MockIonicons({ name, size, color, style }: any) {
    return 'Ionicons';
  },
  default: function MockIonicons({ name, size, color, style }: any) {
    return 'Ionicons';
  },
}));

jest.mock('../../../components/ui/ProgressBar', () => 'ProgressBar');

jest.mock('../../../constants/colors', () => ({
  defaultColors: {
    card: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    primary: '#2196F3',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    background: '#121212',
  },
  getStatusColor: jest.fn(() => '#8E8E93'),
  SIZES: {
    borderRadius: { lg: 12 },
    padding: { md: 16, sm: 8, xs: 4 },
    margin: { sm: 8, xs: 4 },
    shadow: { md: {} },
  },
  TEXT_STYLES: {
    h3: { fontSize: 20, fontWeight: '600' },
    body: { fontSize: 16 },
    bodySmall: { fontSize: 14 },
    caption: { fontSize: 12 },
  },
}));

describe('CategoryCard Import Test', () => {
  it('can import CategoryCard component', () => {
    const { CategoryCard } = require('../../../components/features/CategoryCard');

    expect(typeof CategoryCard).toBe('function');
  });

  it('renders CategoryCard with minimal props', () => {
    const { CategoryCard } = require('../../../components/features/CategoryCard');

    const stats = { total: 10, inspected: 5, percentage: 50 };

    expect(() => {
      render(
        <CategoryCard
          categoryId="floor"
          categoryName="Test"
          stats={stats}
          onPress={() => {}}
          currentMode="draft"
        />
      );
    }).not.toThrow();
  });
});