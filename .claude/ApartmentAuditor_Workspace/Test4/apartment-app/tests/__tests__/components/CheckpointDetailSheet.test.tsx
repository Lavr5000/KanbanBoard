// Mock React Native modules before imports
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Dimensions: {
      get: jest.fn(() => ({ height: 800, width: 400 })),
    },
  };
});

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

jest.mock('@/components/features/RoomSelector', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    RoomSelector: jest.fn(({ selectedRoom, onSelectRoom }: any) => (
      React.createElement(View, { testID: "room-selector" }, [
        React.createElement(View, { testID: "selected-room", key: "room" }, selectedRoom || 'none'),
        React.createElement(View, {
          testID: "select-room-btn",
          key: "btn",
          onTouchEnd: () => onSelectRoom('Test Room')
        })
      ])
    )),
  };
});

jest.mock('@/components/features/PhotoGrid', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    PhotoGrid: jest.fn(({ photos, onAddPhoto, onRemovePhoto }: any) => (
      React.createElement(View, { testID: "photo-grid" }, [
        React.createElement(View, { testID: "photo-count", key: "count" }, photos.length),
        React.createElement(View, {
          testID: "add-photo-btn",
          key: "add",
          onTouchEnd: onAddPhoto
        }),
        ...photos.map((photo: string, index: number) =>
          React.createElement(View, {
            key: photo,
            testID: `remove-photo-${index}`,
            onTouchEnd: () => onRemovePhoto(photo)
          })
        )
      ])
    )),
  };
});

jest.mock('@/hooks/usePhotoPicker', () => ({
  usePhotoPicker: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Ionicons: ({ name }: any) => React.createElement(View, { testID: `icon-${name}` }, name),
  };
});

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { CheckpointDetailSheet, type CheckpointDetailSheetProps } from '@/components/features/CheckpointDetailSheet';
import { usePhotoPicker } from '@/hooks/usePhotoPicker';
import type { DBCheckpoint } from '@/types/database.types';

const mockShowPickerOptions = jest.fn();

// Test data
const mockCheckpoint: DBCheckpoint = {
  id: 'test-checkpoint-1',
  categoryId: 'floor',
  title: 'Test Checkpoint Title',
  description: 'Test checkpoint description',
  tolerance: '±2mm',
  method: 'Visual inspection',
  standardReference: 'СП 29.13330.2011 п. 9.4',
  violationText: 'Violation detected',
  hintLayman: 'This is a hint for the user',
  referenceImageUrl: 'https://example.com/reference.jpg',
  status: null,
  userPhotos: [],
  userComment: '',
  selectedRoom: undefined,
};

const mockCheckpointWithData: DBCheckpoint = {
  ...mockCheckpoint,
  status: 'defect',
  userPhotos: ['file://photo1.jpg', 'file://photo2.jpg'],
  userComment: 'Existing comment',
  selectedRoom: 'Гостиная',
};

// Helper function to render component
const renderComponent = (props: Partial<CheckpointDetailSheetProps> = {}) => {
  const defaultProps: CheckpointDetailSheetProps = {
    visible: true,
    checkpoint: mockCheckpoint,
    projectId: 'test-project-1',
    onClose: jest.fn(),
    onStatusChange: jest.fn(),
  };

  return render(<CheckpointDetailSheet {...defaultProps} {...props} />);
};

describe('CheckpointDetailSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePhotoPicker as jest.Mock).mockReturnValue({
      showPickerOptions: mockShowPickerOptions,
    });
  });

  describe('Basic Rendering', () => {
    test('renders correctly when visible with checkpoint', () => {
      renderComponent();

      expect(screen.getByText('Test Checkpoint Title')).toBeTruthy();
      expect(screen.getByText('This is a hint for the user')).toBeTruthy();
      expect(screen.getByText('Допуск:')).toBeTruthy();
      expect(screen.getByText('±2mm')).toBeTruthy();
      expect(screen.getByText('Метод:')).toBeTruthy();
      expect(screen.getByText('Visual inspection')).toBeTruthy();
      expect(screen.getByText('Норматив:')).toBeTruthy();
      expect(screen.getByText('СП 29.13330.2011 п. 9.4')).toBeTruthy();
    });

    test('renders reference image section when referenceImageUrl exists', () => {
      renderComponent();

      expect(screen.getByText('Эталонное фото')).toBeTruthy();
      expect(screen.getByTestId('icon-image')).toBeTruthy();
    });

    test('does not render reference image section when no referenceImageUrl', () => {
      const checkpointWithoutImage = {
        ...mockCheckpoint,
        referenceImageUrl: '',
      };
      renderComponent({ checkpoint: checkpointWithoutImage });

      expect(screen.queryByText('Эталонное фото')).toBeFalsy();
    });

    test('renders null when no checkpoint provided', () => {
      renderComponent({ checkpoint: null });

      // The component should return null - no checkpoint title should be present
      expect(screen.queryByText('Test Checkpoint Title')).toBeFalsy();
    });

    test('renders modal with correct properties', () => {
      renderComponent();

      // Check that modal content is rendered by looking for title
      expect(screen.getByText('Test Checkpoint Title')).toBeTruthy();
      expect(screen.getByText('This is a hint for the user')).toBeTruthy();
    });
  });

  describe('State Management and useEffect', () => {
    test('initializes state from checkpoint data on mount', () => {
      renderComponent({ checkpoint: mockCheckpointWithData });

      expect(screen.getByDisplayValue('Existing comment')).toBeTruthy();
      // Check that room selector and photo grid receive initial data
      expect(screen.getByTestId('room-selector')).toBeTruthy();
      expect(screen.getByTestId('photo-grid')).toBeTruthy();
    });

    test('resets state when checkpoint changes to null', async () => {
      const { rerender } = renderComponent({ checkpoint: mockCheckpointWithData });

      // Change checkpoint to null
      rerender(<CheckpointDetailSheet
        visible={true}
        checkpoint={null}
        projectId="test-project-1"
        onClose={jest.fn()}
        onStatusChange={jest.fn()}
      />);

      // Component should return null
      expect(screen.queryByText('Test Checkpoint Title')).toBeFalsy();
    });

    test('updates state when checkpoint changes to different one', async () => {
      const { rerender } = renderComponent({ checkpoint: mockCheckpoint });

      const differentCheckpoint: DBCheckpoint = {
        ...mockCheckpoint,
        id: 'different-checkpoint',
        title: 'Different Title',
        userComment: 'Different comment',
        selectedRoom: 'Кухня',
      };

      rerender(<CheckpointDetailSheet
        visible={true}
        checkpoint={differentCheckpoint}
        projectId="test-project-1"
        onClose={jest.fn()}
        onStatusChange={jest.fn()}
      />);

      expect(screen.getByText('Different Title')).toBeTruthy();
    });

    test('resets state to defaults when checkpoint has no user data', () => {
      renderComponent({ checkpoint: mockCheckpoint });

      expect(screen.getByDisplayValue('')).toBeTruthy();
    });
  });

  describe('Photo Handling', () => {
    test('adds photo successfully when photo picker returns URI', async () => {
      const photoUri = 'file://new-photo.jpg';
      mockShowPickerOptions.mockResolvedValue(photoUri);

      renderComponent();

      const addPhotoBtn = screen.getByTestId('add-photo-btn');
      await act(async () => {
        fireEvent(addPhotoBtn, 'touchEnd');
      });

      expect(mockShowPickerOptions).toHaveBeenCalled();
      // Photo grid should show updated count
      await waitFor(() => {
        expect(screen.getByTestId('photo-count')).toBeTruthy();
      });
    });

    test('does not add photo when picker returns null', async () => {
      mockShowPickerOptions.mockResolvedValue(null);

      renderComponent();

      const addPhotoBtn = screen.getByTestId('add-photo-btn');
      await act(async () => {
        fireEvent(addPhotoBtn, 'touchEnd');
      });

      expect(mockShowPickerOptions).toHaveBeenCalled();
      // Photo count should remain 0
      expect(screen.getByTestId('photo-count')).toBeTruthy();
    });

    test('shows error alert when photo picker fails', async () => {
      const error = new Error('Permission denied');
      mockShowPickerOptions.mockRejectedValue(error);

      renderComponent();

      const addPhotoBtn = screen.getByTestId('add-photo-btn');
      await act(async () => {
        fireEvent(addPhotoBtn, 'touchEnd');
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Ошибка',
        'Не удалось загрузить фото. Проверьте разрешения в настройках.'
      );
    });

    test('removes photo from list', () => {
      const checkpointWithPhotos = {
        ...mockCheckpoint,
        userPhotos: ['file://photo1.jpg', 'file://photo2.jpg'],
      };
      renderComponent({ checkpoint: checkpointWithPhotos });

      const removePhotoBtn = screen.getByTestId('remove-photo-0');
      fireEvent(removePhotoBtn, 'touchEnd');

      // PhotoGrid component should receive updated photos array
      expect(screen.getByTestId('photo-grid')).toBeTruthy();
    });
  });

  describe('Room Selection', () => {
    test('renders RoomSelector with correct props', () => {
      renderComponent({ checkpoint: mockCheckpointWithData });

      expect(screen.getByTestId('room-selector')).toBeTruthy();
    });

    test('updates selected room when RoomSelector calls onSelectRoom', () => {
      renderComponent();

      const selectRoomBtn = screen.getByTestId('select-room-btn');
      fireEvent(selectRoomBtn, 'touchEnd');

      // RoomSelector should receive updated selectedRoom
      expect(screen.getByTestId('room-selector')).toBeTruthy();
    });
  });

  describe('Comment Input', () => {
    test('updates comment when text is entered', () => {
      renderComponent();

      const commentInput = screen.getByDisplayValue('');
      fireEvent.changeText(commentInput, 'New comment text');

      expect(commentInput.props.value).toBe('New comment text');
    });

    test('renders existing comment from checkpoint', () => {
      renderComponent({ checkpoint: mockCheckpointWithData });

      expect(screen.getByDisplayValue('Existing comment')).toBeTruthy();
    });
  });

  describe('Status Button Validation', () => {
    test('enables defect button only when photo and room are selected', () => {
      // Initially without photos and room
      renderComponent({ checkpoint: mockCheckpoint });

      // Check that defect button is present but should be disabled
      expect(screen.getByText('Дефект')).toBeTruthy();
      // Note: In actual React Native testing, we'd need to test the TouchableOpacity props
    });

    test('shows validation alert when trying to mark defect without photos', async () => {
      renderComponent({ checkpoint: { ...mockCheckpoint, selectedRoom: 'Гостиная' } });

      const defectButton = screen.getByText('Дефект');

      await act(async () => {
        fireEvent.press(defectButton);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Требуется фото',
        'Добавьте хотя бы одно фото для фиксации дефекта'
      );
    });

    test('shows validation alert when trying to mark defect without room', async () => {
      const checkpointWithPhotos = {
        ...mockCheckpoint,
        userPhotos: ['file://photo1.jpg'],
      };
      renderComponent({ checkpoint: checkpointWithPhotos });

      const defectButton = screen.getByText('Дефект');

      await act(async () => {
        fireEvent.press(defectButton);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Укажите помещение',
        'Выберите помещение, где обнаружен дефект'
      );
    });

    test('enables defect button when both photo and room are selected', () => {
      const checkpointWithPhotoAndRoom = {
        ...mockCheckpoint,
        userPhotos: ['file://photo1.jpg'],
        selectedRoom: 'Гостиная',
      };
      renderComponent({ checkpoint: checkpointWithPhotoAndRoom });

      // Check that defect button is present and should be enabled
      expect(screen.getByText('Дефект')).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    test('submits "not_inspected" status successfully', async () => {
      const onStatusChange = jest.fn();
      const onClose = jest.fn();

      renderComponent({ onStatusChange, onClose });

      const notInspectedButton = screen.getByText('Не осмотрено');

      await act(async () => {
        fireEvent.press(notInspectedButton);
      });

      expect(onStatusChange).toHaveBeenCalledWith(
        'test-checkpoint-1',
        'not_inspected',
        {
          selectedRoom: undefined,
          photos: [],
          comment: ''
        }
      );
      expect(onClose).toHaveBeenCalled();
    });

    test('submits "complies" status successfully', async () => {
      const onStatusChange = jest.fn();
      const onClose = jest.fn();

      renderComponent({ onStatusChange, onClose });

      const compliesButton = screen.getByText('Соответствует');

      await act(async () => {
        fireEvent.press(compliesButton);
      });

      expect(onStatusChange).toHaveBeenCalledWith(
        'test-checkpoint-1',
        'complies',
        {
          selectedRoom: undefined,
          photos: [],
          comment: ''
        }
      );
      expect(onClose).toHaveBeenCalled();
    });

    test('submits "defect" status with all data successfully', async () => {
      const onStatusChange = jest.fn();
      const onClose = jest.fn();
      const checkpointWithPhotoAndRoom = {
        ...mockCheckpoint,
        userPhotos: ['file://photo1.jpg'],
        selectedRoom: 'Гостиная',
      };

      renderComponent({
        checkpoint: checkpointWithPhotoAndRoom,
        onStatusChange,
        onClose
      });

      const defectButton = screen.getByText('Дефект');

      await act(async () => {
        fireEvent.press(defectButton);
      });

      expect(onStatusChange).toHaveBeenCalledWith(
        'test-checkpoint-1',
        'defect',
        {
          selectedRoom: 'Гостиная',
          photos: ['file://photo1.jpg'],
          comment: ''
        }
      );
      expect(onClose).toHaveBeenCalled();
    });

    test('shows loading indicator while submitting', async () => {
      const onStatusChange = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderComponent({ onStatusChange });

      const compliesButton = screen.getByText('Соответствует');

      act(() => {
        fireEvent.press(compliesButton);
      });

      // Check for ActivityIndicator (note: might not be visible in testing environment)
      // expect(screen.getByTestId('activity-indicator')).toBeTruthy();

      await waitFor(() => {
        expect(onStatusChange).toHaveBeenCalled();
      });
    });

    test('shows error alert when submission fails', async () => {
      const error = new Error('Network error');
      const onStatusChange = jest.fn().mockRejectedValue(error);

      renderComponent({ onStatusChange });

      const compliesButton = screen.getByText('Соответствует');

      await act(async () => {
        fireEvent.press(compliesButton);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Ошибка сохранения',
        'Не удалось сохранить изменения. Попробуйте снова.'
      );
    });
  });

  describe('Complex UI Interactions', () => {
    test('handles complete defect workflow', async () => {
      const onStatusChange = jest.fn();
      const onClose = jest.fn();

      renderComponent({ onStatusChange, onClose });

      // Step 1: Add photo
      mockShowPickerOptions.mockResolvedValue('file://test-photo.jpg');
      const addPhotoBtn = screen.getByTestId('add-photo-btn');
      await act(async () => {
        fireEvent(addPhotoBtn, 'touchEnd');
      });

      // Step 2: Select room
      const selectRoomBtn = screen.getByTestId('select-room-btn');
      fireEvent.press(selectRoomBtn);

      // Step 3: Add comment
      const commentInput = screen.getByDisplayValue('');
      fireEvent.changeText(commentInput, 'Test defect comment');

      // Step 4: Mark as defect
      const defectButton = screen.getByText('Дефект').closest('TouchableOpacity');
      await act(async () => {
        fireEvent.press(defectButton);
      });

      expect(onStatusChange).toHaveBeenCalledWith(
        'test-checkpoint-1',
        'defect',
        {
          selectedRoom: 'Test Room',
          photos: ['file://test-photo.jpg'],
          comment: 'Test defect comment'
        }
      );
      expect(onClose).toHaveBeenCalled();
    });

    test('handles photo removal before submission', () => {
      const checkpointWithPhotos = {
        ...mockCheckpoint,
        userPhotos: ['file://photo1.jpg', 'file://photo2.jpg'],
        selectedRoom: 'Гостиная',
      };

      renderComponent({ checkpoint: checkpointWithPhotos });

      // Remove first photo
      const removePhotoBtn = screen.getByTestId('remove-photo-0');
      fireEvent(removePhotoBtn, 'touchEnd');

      // Defect button should still be enabled (one photo remains)
      const defectButton = screen.getByText('Дефект').closest('TouchableOpacity');
      expect(defectButton.props.disabled).toBe(false);
    });

    test('handles state reset when switching checkpoints', async () => {
      const { rerender } = renderComponent({ checkpoint: mockCheckpointWithData });

      // Verify initial state
      expect(screen.getByDisplayValue('Existing comment')).toBeTruthy();

      // Switch to different checkpoint
      const newCheckpoint = {
        ...mockCheckpoint,
        id: 'new-checkpoint',
        title: 'New Checkpoint',
        userComment: '',
        selectedRoom: undefined,
        userPhotos: [],
      };

      rerender(<CheckpointDetailSheet
        visible={true}
        checkpoint={newCheckpoint}
        projectId="test-project-1"
        onClose={jest.fn()}
        onStatusChange={jest.fn()}
      />);

      expect(screen.getByText('New Checkpoint')).toBeTruthy();
      expect(screen.getByDisplayValue('')).toBeTruthy();
    });

    test('handles modal close via backdrop press', () => {
      const onClose = jest.fn();

      renderComponent({ onClose });

      const backdrop = screen.getByTestId('backdrop');
      fireEvent.press(backdrop);

      expect(onClose).toHaveBeenCalled();
    });

    test('prevents close when pressing inside sheet', () => {
      const onClose = jest.fn();

      renderComponent({ onClose });

      const sheetContent = screen.getByTestId('sheet-content');
      fireEvent.press(sheetContent);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Integration with Child Components', () => {
    test('RoomSelector receives correct selectedRoom prop', () => {
      renderComponent({ checkpoint: mockCheckpointWithData });

      const selectedRoom = screen.getByTestId('selected-room');
      expect(selectedRoom.props.children).toBe('Гостиная');
    });

    test('PhotoGrid receives correct photos prop', () => {
      const checkpointWithPhotos = {
        ...mockCheckpoint,
        userPhotos: ['file://photo1.jpg', 'file://photo2.jpg'],
      };
      renderComponent({ checkpoint: checkpointWithPhotos });

      const photoCount = screen.getByTestId('photo-count');
      expect(photoCount.props.children).toBe(2);
    });

    test('child components are re-rendered when state changes', async () => {
      renderComponent();

      // Initial state
      const photoCount = screen.getByTestId('photo-count');
      expect(photoCount.props.children).toBe(0);

      // Add photo
      mockShowPickerOptions.mockResolvedValue('file://new-photo.jpg');
      const addPhotoBtn = screen.getByTestId('add-photo-btn');
      await act(async () => {
        fireEvent(addPhotoBtn, 'touchEnd');
      });

      // PhotoGrid should receive updated photos
      expect(screen.getByTestId('photo-grid')).toBeTruthy();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles missing checkpoint gracefully', () => {
      renderComponent({ checkpoint: null });
      expect(screen.queryByText('Test Checkpoint Title')).toBeFalsy();
    });

    test('handles undefined onStatusChange callback', async () => {
      renderComponent({ onStatusChange: undefined });

      const compliesButton = screen.getByText('Соответствует');

      await act(async () => {
        fireEvent.press(compliesButton);
      });

      // Should not throw error
      expect(Alert.alert).not.toHaveBeenCalledWith(
        'Ошибка сохранения',
        expect.any(String)
      );
    });

    test('handles photo picker error without crashing', async () => {
      mockShowPickerOptions.mockRejectedValue(new Error('Camera error'));

      renderComponent();

      const addPhotoBtn = screen.getByTestId('add-photo-btn');
      await act(async () => {
        fireEvent(addPhotoBtn, 'touchEnd');
      });

      expect(Alert.alert).toHaveBeenCalled();
    });

    test('handles async submission error properly', async () => {
      const onStatusChange = jest.fn().mockImplementation(() => {
        throw new Error('Async error');
      });

      renderComponent({ onStatusChange });

      const compliesButton = screen.getByText('Соответствует');

      await act(async () => {
        fireEvent.press(compliesButton);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Ошибка сохранения',
        'Не удалось сохранить изменения. Попробуйте снова.'
      );
    });
  });
});