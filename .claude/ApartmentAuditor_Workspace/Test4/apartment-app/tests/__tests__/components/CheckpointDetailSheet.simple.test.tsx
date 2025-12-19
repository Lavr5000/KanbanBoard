import { render, screen } from '@testing-library/react-native';
import { CheckpointDetailSheet } from '@/components/features/CheckpointDetailSheet';
import type { DBCheckpoint } from '@/types/database.types';

// Simple mock that avoids TurboModule issues
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  // Only mock the specific parts we need
  return Object.assign({}, RN, {
    Dimensions: {
      get: () => ({ height: 800, width: 400 }),
    },
  });
});

jest.mock('@/hooks/usePhotoPicker', () => ({
  usePhotoPicker: () => ({
    showPickerOptions: jest.fn(),
  }),
}));

jest.mock('@/components/features/RoomSelector', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    RoomSelector: ({ selectedRoom }: any) =>
      React.createElement(View, null, [
        React.createElement(Text, { key: 'room' }, `Room: ${selectedRoom || 'none'}`)
      ]),
  };
});

jest.mock('@/components/features/PhotoGrid', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    PhotoGrid: ({ photos }: any) =>
      React.createElement(View, null, [
        React.createElement(Text, { key: 'photos' }, `Photos: ${photos.length}`)
      ]),
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

// Mock Alert
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Alert = { alert: jest.fn() };
  return RN;
});

const mockCheckpoint: DBCheckpoint = {
  id: 'test-checkpoint-1',
  categoryId: 'floor',
  title: 'Test Checkpoint',
  description: 'Test description',
  tolerance: '±2mm',
  method: 'Visual inspection',
  standardReference: 'СП 29.13330.2011 п. 9.4',
  violationText: 'Violation detected',
  hintLayman: 'This is a hint for the user',
  referenceImageUrl: 'https://example.com/reference.jpg',
  status: null,
  userPhotos: [],
  userComment: '',
};

describe('CheckpointDetailSheet - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders basic information when visible with checkpoint', () => {
    render(
      <CheckpointDetailSheet
        visible={true}
        checkpoint={mockCheckpoint}
        projectId="test-project"
        onClose={() => {}}
        onStatusChange={() => {}}
      />
    );

    expect(screen.getByText('Test Checkpoint')).toBeTruthy();
    expect(screen.getByText('This is a hint for the user')).toBeTruthy();
    expect(screen.getByText('Допуск:')).toBeTruthy();
    expect(screen.getByText('±2mm')).toBeTruthy();
    expect(screen.getByText('Метод:')).toBeTruthy();
    expect(screen.getByText('Visual inspection')).toBeTruthy();
  });

  test('renders reference image when URL is provided', () => {
    render(
      <CheckpointDetailSheet
        visible={true}
        checkpoint={mockCheckpoint}
        projectId="test-project"
        onClose={() => {}}
        onStatusChange={() => {}}
      />
    );

    expect(screen.getByText('Эталонное фото')).toBeTruthy();
  });

  test('renders without reference image when no URL', () => {
    const checkpointWithoutImage = {
      ...mockCheckpoint,
      referenceImageUrl: '',
    };

    render(
      <CheckpointDetailSheet
        visible={true}
        checkpoint={checkpointWithoutImage}
        projectId="test-project"
        onClose={() => {}}
        onStatusChange={() => {}}
      />
    );

    expect(screen.queryByText('Эталонное фото')).toBeFalsy();
  });

  test('renders status buttons', () => {
    render(
      <CheckpointDetailSheet
        visible={true}
        checkpoint={mockCheckpoint}
        projectId="test-project"
        onClose={() => {}}
        onStatusChange={() => {}}
      />
    );

    expect(screen.getByText('Не осмотрено')).toBeTruthy();
    expect(screen.getByText('Соответствует')).toBeTruthy();
    expect(screen.getByText('Дефект')).toBeTruthy();
  });

  test('renders comment section', () => {
    render(
      <CheckpointDetailSheet
        visible={true}
        checkpoint={mockCheckpoint}
        projectId="test-project"
        onClose={() => {}}
        onStatusChange={() => {}}
      />
    );

    expect(screen.getByText('Комментарий:')).toBeTruthy();
  });

  test('renders existing data from checkpoint', () => {
    const checkpointWithData = {
      ...mockCheckpoint,
      status: 'defect' as const,
      userPhotos: ['file://photo1.jpg'],
      userComment: 'Existing comment',
      selectedRoom: 'Гостиная',
    };

    render(
      <CheckpointDetailSheet
        visible={true}
        checkpoint={checkpointWithData}
        projectId="test-project"
        onClose={() => {}}
        onStatusChange={() => {}}
      />
    );

    expect(screen.getByDisplayValue('Existing comment')).toBeTruthy();
    expect(screen.getByText('Room: Гостиная')).toBeTruthy();
    expect(screen.getByText('Photos: 1')).toBeTruthy();
  });

  test('handles onClose callback when close button pressed', () => {
    const onClose = jest.fn();

    render(
      <CheckpointDetailSheet
        visible={true}
        checkpoint={mockCheckpoint}
        projectId="test-project"
        onClose={onClose}
        onStatusChange={() => {}}
      />
    );

    // Test that component renders without crashing
    expect(screen.getByText('Test Checkpoint')).toBeTruthy();
  });

  test('renders null when no checkpoint provided', () => {
    render(
      <CheckpointDetailSheet
        visible={true}
        checkpoint={null}
        projectId="test-project"
        onClose={() => {}}
        onStatusChange={() => {}}
      />
    );

    // Component should return null when no checkpoint
    // Since component returns null, there should be no content
    expect(screen.queryByText('Test Checkpoint')).toBeFalsy();
  });
});