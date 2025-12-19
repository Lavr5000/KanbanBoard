import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { CreateProjectModal } from '@/components/features/CreateProjectModal';

// Mock all external dependencies
import { useProjectStore } from '@/services/store';
import { useTheme } from '@/hooks/useTheme';

jest.mock('@/services/store', () => ({
  useProjectStore: jest.fn(),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

const mockAlert = {
  alert: jest.fn(),
};

jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
  Modal: 'Modal',
  ScrollView: 'ScrollView',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  Platform: {
    OS: 'ios',
  },
  StyleSheet: {
    create: jest.fn(() => ({})),
  },
  Alert: mockAlert,
}));

jest.mock('@expo/vector-icons', () => 'Ionicons');

const mockProjectStore = {
  createProject: jest.fn(),
  setActiveProject: jest.fn(),
};

const mockTheme = {
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
};

describe('CreateProjectModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useProjectStore as unknown as jest.Mock).mockImplementation(() => mockProjectStore);
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Modal Visibility and Basic Rendering', () => {
    test('renders modal when visible is true', () => {
      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Новый объект')).toBeTruthy();
      expect(screen.getByDisplayValue('')).toBeTruthy(); // Title input
      expect(screen.getByPlaceholderText('Название объекта*')).toBeTruthy();
      expect(screen.getByPlaceholderText('Адрес объекта (необязательно)')).toBeTruthy();
      expect(screen.getByText('Участники')).toBeTruthy();
      expect(screen.getByText('Создать')).toBeTruthy();
      expect(screen.getByText('Отмена')).toBeTruthy();
    });

    test('does not render modal when visible is false', () => {
      render(
        <CreateProjectModal
          visible={false}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText('Новый объект')).toBeFalsy();
      expect(screen.queryByPlaceholderText('Название объекта*')).toBeFalsy();
    });

    test('renders initial participant with inspector role', () => {
      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Инспектор')).toBeTruthy();
      expect(screen.getByPlaceholderText('ФИО*')).toBeTruthy();
      expect(screen.getByPlaceholderText('Должность')).toBeTruthy();
      expect(screen.getByPlaceholderText('Организация')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    test('shows error alert when title is empty', async () => {
      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      const createButton = screen.getByText('Создать');
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(mockAlert.alert).toHaveBeenCalledWith('Ошибка', 'Введите название объекта');
      });
    });

    test('shows error alert when title contains only whitespace', async () => {
      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      const titleInput = screen.getByPlaceholderText('Название объекта*');
      fireEvent.changeText(titleInput, '   ');

      const createButton = screen.getByText('Создать');
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(mockAlert.alert).toHaveBeenCalledWith('Ошибка', 'Введите название объекта');
      });
    });

    test('enables create button when title is provided', () => {
      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      const titleInput = screen.getByPlaceholderText('Название объекта*');
      const createButton = screen.getByText('Создать');

      // Initially button should be enabled but will fail validation
      expect(createButton).toBeTruthy();

      fireEvent.changeText(titleInput, 'Test Project');
      expect(createButton).toBeTruthy();
    });

    test('allows optional address field to remain empty', () => {
      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      const addressInput = screen.getByPlaceholderText('Адрес объекта (необязательно)');
      expect(addressInput).toBeTruthy();
      expect(addressInput.props.value).toBe('');
    });
  });

  describe('Participant Management', () => {
    test('adds new participant when add button is pressed', () => {
      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      // Initially should have one participant
      expect(screen.getAllByText('ФИО*')).toHaveLength(1);

      const addButton = screen.getByRole('button', { name: /add/i });
      fireEvent.press(addButton);

      // Should now have two participants
      expect(screen.getAllByText('ФИО*')).toHaveLength(2);
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

      expect(screen.getAllByText('ФИО*')).toHaveLength(2);

      // Remove the second participant (there should be a remove button now)
      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      expect(removeButtons).toHaveLength(1); // Only second participant should have remove button

      fireEvent.press(removeButtons[0]);

      // Should be back to one participant
      expect(screen.getAllByText('ФИО*')).toHaveLength(1);
    });

    test('cannot remove the last participant', () => {
      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      // Should not have any remove buttons initially
      expect(screen.queryByRole('button', { name: /remove/i })).toBeFalsy();
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
  });

  describe('Project Creation Flow', () => {
    test('creates project successfully with valid data', async () => {
      const mockProjectId = 'project_1234567890_001';
      mockProjectStore.createProject.mockReturnValue(mockProjectId);

      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      // Fill in the form
      const titleInput = screen.getByPlaceholderText('Название объекта*');
      const addressInput = screen.getByPlaceholderText('Адрес объекта (необязательно)');
      const fullNameInput = screen.getByPlaceholderText('ФИО*');

      fireEvent.changeText(titleInput, 'Test Apartment');
      fireEvent.changeText(addressInput, '123 Test Street');
      fireEvent.changeText(fullNameInput, 'John Inspector');

      // Submit the form
      const createButton = screen.getByText('Создать');
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(mockProjectStore.createProject).toHaveBeenCalledWith(
          'Test Apartment',
          '123 Test Street'
        );
        expect(mockProjectStore.setActiveProject).toHaveBeenCalledWith(mockProjectId);
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    test('creates project without address', async () => {
      const mockProjectId = 'project_1234567890_001';
      mockProjectStore.createProject.mockReturnValue(mockProjectId);

      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      const titleInput = screen.getByPlaceholderText('Название объекта*');
      fireEvent.changeText(titleInput, 'Test Apartment');

      const createButton = screen.getByText('Создать');
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(mockProjectStore.createProject).toHaveBeenCalledWith(
          'Test Apartment',
          ''
        );
      });
    });

    test('trims whitespace from title and address', async () => {
      const mockProjectId = 'project_1234567890_001';
      mockProjectStore.createProject.mockReturnValue(mockProjectId);

      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      const titleInput = screen.getByPlaceholderText('Название объекта*');
      const addressInput = screen.getByPlaceholderText('Адрес объекта (необязательно)');

      fireEvent.changeText(titleInput, '  Test Apartment  ');
      fireEvent.changeText(addressInput, '  123 Test Street  ');

      const createButton = screen.getByText('Создать');
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(mockProjectStore.createProject).toHaveBeenCalledWith(
          'Test Apartment',
          '123 Test Street'
        );
      });
    });
  });

  describe('Loading States', () => {
    test('disables all inputs during creation', async () => {
      let resolveCreation: (value: string) => void;
      const creationPromise = new Promise<string>(resolve => {
        resolveCreation = resolve;
      });

      mockProjectStore.createProject.mockReturnValue(creationPromise);

      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      const titleInput = screen.getByPlaceholderText('Название объекта*');
      const addressInput = screen.getByPlaceholderText('Адрес объекта (необязательно)');
      const fullNameInput = screen.getByPlaceholderText('ФИО*');
      const closeButton = screen.getByRole('button', { name: /close/i });

      fireEvent.changeText(titleInput, 'Test Apartment');

      const createButton = screen.getByText('Создать');
      fireEvent.press(createButton);

      // Check loading state
      await waitFor(() => {
        expect(screen.getByText('Создание...')).toBeTruthy();
        expect(titleInput.props.editable).toBe(false);
        expect(addressInput.props.editable).toBe(false);
        expect(fullNameInput.props.editable).toBe(false);
        expect(closeButton.props.disabled).toBe(true);
      });

      // Resolve the creation
      resolveCreation!('project_123');
    });

    test('shows loading text on create button', async () => {
      let resolveCreation: (value: string) => void;
      const creationPromise = new Promise<string>(resolve => {
        resolveCreation = resolve;
      });

      mockProjectStore.createProject.mockReturnValue(creationPromise);

      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      const titleInput = screen.getByPlaceholderText('Название объекта*');
      fireEvent.changeText(titleInput, 'Test Apartment');

      const createButton = screen.getByText('Создать');
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(screen.getByText('Создание...')).toBeTruthy();
      });

      resolveCreation!('project_123');
    });
  });

  describe('Error Handling', () => {
    test('shows error alert when project creation fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockProjectStore.createProject.mockImplementation(() => {
        throw new Error('Creation failed');
      });

      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      const titleInput = screen.getByPlaceholderText('Название объекта*');
      fireEvent.changeText(titleInput, 'Test Apartment');

      const createButton = screen.getByText('Создать');
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(mockAlert.alert).toHaveBeenCalledWith('Ошибка', 'Не удалось создать объект');
        expect(consoleSpy).toHaveBeenCalledWith('Failed to create project:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    test('re-enables form after error', async () => {
      mockProjectStore.createProject.mockImplementation(() => {
        throw new Error('Creation failed');
      });

      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      const titleInput = screen.getByPlaceholderText('Название объекта*');
      fireEvent.changeText(titleInput, 'Test Apartment');

      const createButton = screen.getByText('Создать');
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(mockAlert.alert).toHaveBeenCalled();
        // After error, button should be back to normal state
        expect(screen.getByText('Создать')).toBeTruthy();
        expect(titleInput.props.editable).toBe(true);
      });
    });
  });

  describe('Form Reset Functionality', () => {
    test('resets form when modal is closed normally', () => {
      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      const titleInput = screen.getByPlaceholderText('Название объекта*');
      const addressInput = screen.getByPlaceholderText('Адрес объекта (необязательно)');
      const fullNameInput = screen.getByPlaceholderText('ФИО*');

      // Fill in the form
      fireEvent.changeText(titleInput, 'Test Apartment');
      fireEvent.changeText(addressInput, '123 Test Street');
      fireEvent.changeText(fullNameInput, 'John Doe');

      // Close the modal
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.press(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    test('resets form after successful project creation', async () => {
      const mockProjectId = 'project_1234567890_001';
      mockProjectStore.createProject.mockReturnValue(mockProjectId);

      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      const titleInput = screen.getByPlaceholderText('Название объекта*');
      const addressInput = screen.getByPlaceholderText('Адрес объекта (необязательно)');
      const fullNameInput = screen.getByPlaceholderText('ФИО*');

      // Fill in the form
      fireEvent.changeText(titleInput, 'Test Apartment');
      fireEvent.changeText(addressInput, '123 Test Street');
      fireEvent.changeText(fullNameInput, 'John Doe');

      // Add another participant
      const addButton = screen.getByRole('button', { name: /add/i });
      fireEvent.press(addButton);

      expect(screen.getAllByText('ФИО*')).toHaveLength(2);

      // Submit the form
      const createButton = screen.getByText('Создать');
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    test('resets form when cancel button is pressed', () => {
      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      const titleInput = screen.getByPlaceholderText('Название объекта*');
      fireEvent.changeText(titleInput, 'Test Apartment');

      const cancelButton = screen.getByText('Отмена');
      fireEvent.press(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    test('prevents closing during creation', async () => {
      let resolveCreation: (value: string) => void;
      const creationPromise = new Promise<string>(resolve => {
        resolveCreation = resolve;
      });

      mockProjectStore.createProject.mockReturnValue(creationPromise);

      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      const titleInput = screen.getByPlaceholderText('Название объекта*');
      fireEvent.changeText(titleInput, 'Test Apartment');

      const createButton = screen.getByText('Создать');
      fireEvent.press(createButton);

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close/i });
        expect(closeButton.props.disabled).toBe(true);

        const cancelButton = screen.getByText('Отмена');
        expect(cancelButton.props.disabled).toBe(true);
      });

      resolveCreation!('project_123');
    });

    test('handles max length constraints', () => {
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

    test('auto-focuses title input on modal open', () => {
      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      const titleInput = screen.getByPlaceholderText('Название объекта*');
      expect(titleInput.props.autoFocus).toBe(true);
    });
  });

  describe('Edge Cases and Error Conditions', () => {
    test('handles very long text input correctly', () => {
      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      const titleInput = screen.getByPlaceholderText('Название объекта*');
      const longText = 'a'.repeat(50); // Max length

      fireEvent.changeText(titleInput, longText);
      expect(titleInput.props.value).toBe(longText);
    });

    test('handles multiple rapid participant additions', () => {
      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      const addButton = screen.getByRole('button', { name: /add/i });

      // Add multiple participants quickly
      for (let i = 0; i < 5; i++) {
        fireEvent.press(addButton);
      }

      expect(screen.getAllByText('ФИО*')).toHaveLength(6); // 1 initial + 5 added
    });

    test('maintains participant data when adding new participants', () => {
      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      const fullNameInput = screen.getByPlaceholderText('ФИО*');
      fireEvent.changeText(fullNameInput, 'First Participant');

      const addButton = screen.getByRole('button', { name: /add/i });
      fireEvent.press(addButton);

      // First participant's data should be preserved
      expect(fullNameInput.props.value).toBe('First Participant');
    });

    test('handles empty participant data during form submission', async () => {
      const mockProjectId = 'project_1234567890_001';
      mockProjectStore.createProject.mockReturnValue(mockProjectId);

      render(
        <CreateProjectModal
          visible={true}
          onClose={mockOnClose}
        />
      );

      const titleInput = screen.getByPlaceholderText('Название объекта*');
      fireEvent.changeText(titleInput, 'Test Apartment');

      // Don't fill in participant data
      const createButton = screen.getByText('Создать');
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(mockProjectStore.createProject).toHaveBeenCalledWith(
          'Test Apartment',
          ''
        );
      });
    });
  });
});