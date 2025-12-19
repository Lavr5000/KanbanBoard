/**
 * Simple test for CreateProjectModal component
 * This test focuses on core functionality without complex mocking
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';

// Mock the component before importing
const mockCreateProject = jest.fn();
const mockSetActiveProject = jest.fn();
const mockOnClose = jest.fn();

// Mock all external dependencies first
jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: ({ children, testID, ...props }) => {
      return React.createElement('View', { testID, ...props }, children);
    },
    Text: ({ children, testID, ...props }) => {
      return React.createElement('Text', { testID, ...props }, children);
    },
    TextInput: ({ testID, placeholder, value, ...props }) => {
      return React.createElement('TextInput', { testID, placeholder, value, ...props });
    },
    TouchableOpacity: ({ children, testID, onPress, ...props }) => {
      return React.createElement(
        'TouchableOpacity',
        { testID, onPress, ...props },
        children
      );
    },
    Modal: ({ children, visible, ...props }) => {
      if (!visible) return null;
      return React.createElement('Modal', props, children);
    },
    ScrollView: ({ children, ...props }) => {
      return React.createElement('ScrollView', props, children);
    },
    KeyboardAvoidingView: ({ children, ...props }) => {
      return React.createElement('KeyboardAvoidingView', props, children);
    },
    StyleSheet: {
      create: () => ({}),
    },
    Platform: {
      OS: 'ios',
      select: (obj) => obj.ios || obj.default,
    },
    Alert: {
      alert: jest.fn(),
    },
  };
});

jest.mock('@expo/vector-icons/Ionicons', () => {
  const React = require('react');
  return ({ name, size, color, testID }) => {
    return React.createElement('Ionicons', {
      name, size, color, testID,
      'data-testid': testID || `icon-${name}`
    });
  };
});

jest.mock('@/services/store', () => ({
  useProjectStore: () => ({
    createProject: mockCreateProject,
    setActiveProject: mockSetActiveProject,
  }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      card: '#ffffff',
      text: '#000000',
      textSecondary: '#666666',
      border: '#e0e0e0',
      surface: '#f5f5f5',
      background: '#fafafa',
      primary: '#007AFF',
      error: '#FF3B30',
    },
  }),
}));

// Import the component after mocking
import { CreateProjectModal } from '../../../components/features/CreateProjectModal';

describe('CreateProjectModal Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders modal when visible is true', () => {
    render(
      <CreateProjectModal
        visible={true}
        onClose={mockOnClose}
      />
    );

    // Check if key elements are present
    expect(screen.getByText('Новый объект')).toBeTruthy();
    expect(screen.getByPlaceholderText('Название объекта*')).toBeTruthy();
    expect(screen.getByPlaceholderText('Адрес объекта (необязательно)')).toBeTruthy();
    expect(screen.getByText('Участники')).toBeTruthy();
    expect(screen.getByText('Создать')).toBeTruthy();
    expect(screen.getByText('Отмена')).toBeTruthy();
  });

  test('does not render when visible is false', () => {
    render(
      <CreateProjectModal
        visible={false}
        onClose={mockOnClose}
      />
    );

    // Modal content should not be visible
    expect(screen.queryByText('Новый объект')).toBeFalsy();
    expect(screen.queryByPlaceholderText('Название объекта*')).toBeFalsy();
  });

  test('calls onClose when cancel button is pressed', () => {
    render(
      <CreateProjectModal
        visible={true}
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByText('Отмена');
    fireEvent.press(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('creates project when form is submitted with valid data', () => {
    const mockProjectId = 'test-project-123';
    mockCreateProject.mockReturnValue(mockProjectId);

    render(
      <CreateProjectModal
        visible={true}
        onClose={mockOnClose}
      />
    );

    // Fill in required fields
    const titleInput = screen.getByPlaceholderText('Название объекта*');
    fireEvent.changeText(titleInput, 'Test Project');

    const addressInput = screen.getByPlaceholderText('Адрес объекта (необязательно)');
    fireEvent.changeText(addressInput, 'Test Address');

    // Submit form
    const createButton = screen.getByText('Создать');
    fireEvent.press(createButton);

    expect(mockCreateProject).toHaveBeenCalledWith('Test Project', 'Test Address');
    expect(mockSetActiveProject).toHaveBeenCalledWith(mockProjectId);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('shows error when trying to create project without title', () => {
    const { Alert } = require('react-native');

    render(
      <CreateProjectModal
        visible={true}
        onClose={mockOnClose}
      />
    );

    // Try to submit without title
    const createButton = screen.getByText('Создать');
    fireEvent.press(createButton);

    expect(Alert.alert).toHaveBeenCalledWith('Ошибка', 'Введите название объекта');
    expect(mockCreateProject).not.toHaveBeenCalled();
  });

  test('adds new participant when add button is pressed', () => {
    render(
      <CreateProjectModal
        visible={true}
        onClose={mockOnClose}
      />
    );

    // Should start with one participant
    expect(screen.getAllByPlaceholderText('ФИО*')).toHaveLength(1);

    // Add participant
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.press(addButton);

    // Should now have two participants
    expect(screen.getAllByPlaceholderText('ФИО*')).toHaveLength(2);
  });

  test('removes participant when remove button is pressed', () => {
    render(
      <CreateProjectModal
        visible={true}
        onClose={mockOnClose}
      />
    );

    // Add second participant first
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.press(addButton);

    expect(screen.getAllByPlaceholderText('ФИО*')).toHaveLength(2);

    // Remove the second participant
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    expect(removeButtons).toHaveLength(1);

    fireEvent.press(removeButtons[0]);

    // Should be back to one participant
    expect(screen.getAllByPlaceholderText('ФИО*')).toHaveLength(1);
  });

  test('updates participant fields correctly', () => {
    render(
      <CreateProjectModal
        visible={true}
        onClose={mockOnClose}
      />
    );

    const fullNameInput = screen.getByPlaceholderText('ФИО*');
    const positionInput = screen.getByPlaceholderText('Должность');
    const organizationInput = screen.getByPlaceholderText('Организация');

    fireEvent.changeText(fullNameInput, 'John Doe');
    fireEvent.changeText(positionInput, 'Inspector');
    fireEvent.changeText(organizationInput, 'Test Company');

    expect(fullNameInput.props.value).toBe('John Doe');
    expect(positionInput.props.value).toBe('Inspector');
    expect(organizationInput.props.value).toBe('Test Company');
  });

  test('handles max length constraints on inputs', () => {
    render(
      <CreateProjectModal
        visible={true}
        onClose={mockOnClose}
      />
    );

    const titleInput = screen.getByPlaceholderText('Название объекта*');
    const addressInput = screen.getByPlaceholderText('Адрес объекта (необязательно)');

    expect(titleInput.props.maxLength).toBe(50);
    expect(addressInput.props.maxLength).toBe(100);
  });
});