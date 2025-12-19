/**
 * CheckpointStore Tests
 *
 * Testing Zustand store for checkpoint management functionality
 */

import { renderHook, act } from '@testing-library/react-native';
import { useCheckpointStore } from '../../../services/store/checkpointStore';

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

// Mock the checkpoints database
jest.mock('../../../constants/checkpoints_v2.1.json', () => ({
  version: '2.1',
  totalCheckpoints: 383,
  categories: {
    floor: {
      draft: [
        {
          id: 'floor_001',
          categoryId: 'floor',
          title: 'Floor Base Preparation',
          description: 'Check floor base preparation',
          tolerance: '±2mm',
          method: 'Visual inspection',
          standardReference: 'СП 29.13330.2011 п. 9.4',
          violationText: 'Floor base not properly prepared',
          hintLayman: 'Check that floor surface is level and clean',
          referenceImageUrl: '',
          status: null,
          userPhotos: [],
          userComment: '',
        },
        {
          id: 'floor_002',
          categoryId: 'floor',
          title: 'Floor Surface Level',
          description: 'Check floor surface levelness',
          tolerance: '±3mm',
          method: 'Level measurement',
          standardReference: 'СП 29.13330.2011 п. 9.5',
          violationText: 'Floor surface not level',
          hintLayman: 'Use level to check surface flatness',
          referenceImageUrl: '',
          status: null,
          userPhotos: [],
          userComment: '',
        },
      ],
      finish: [
        {
          id: 'floor_003',
          categoryId: 'floor',
          title: 'Floor Finish Quality',
          description: 'Check floor finishing quality',
          tolerance: '±1mm',
          method: 'Visual inspection',
          standardReference: 'СП 29.13330.2011 п. 9.6',
          violationText: 'Floor finish quality unacceptable',
          hintLayman: 'Check for scratches and defects',
          referenceImageUrl: '',
          status: null,
          userPhotos: [],
          userComment: '',
        },
      ],
    },
  },
}));

describe('CheckpointStore', () => {
  const mockCheckpointId = 'floor_001';
  const mockPhotoUri = 'file://test-photo.jpg';
  const mockComment = 'Test comment';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with empty changes and null project ID', () => {
      const { result } = renderHook(() => useCheckpointStore());

      expect(result.current.changes).toEqual({});
      expect(result.current.projectId).toBeNull();
    });
  });

  describe('updateCheckpointStatus', () => {
    it('should update checkpoint status', () => {
      const { result } = renderHook(() => useCheckpointStore());

      act(() => {
        result.current.setProjectId('test_project');
        result.current.updateCheckpointStatus(mockCheckpointId, 'complies');
      });

      expect(result.current.changes.test_project?.[mockCheckpointId]).toMatchObject({
        status: 'complies',
      });
    });

    it('should overwrite existing status', () => {
      const { result } = renderHook(() => useCheckpointStore());

      act(() => {
        result.current.setProjectId('test_project');
        result.current.updateCheckpointStatus(mockCheckpointId, 'complies');
      });

      act(() => {
        result.current.updateCheckpointStatus(mockCheckpointId, 'defect');
      });

      expect(result.current.changes.test_project?.[mockCheckpointId]?.status).toBe('defect');
    });
  });

  describe('addPhoto', () => {
    it('should add photo to checkpoint', () => {
      const { result } = renderHook(() => useCheckpointStore());

      act(() => {
        result.current.setProjectId('test_project');
        result.current.addPhoto(mockCheckpointId, mockPhotoUri);
      });

      expect(result.current.changes.test_project?.[mockCheckpointId]).toMatchObject({
        userPhotos: [mockPhotoUri],
      });
    });

    it('should add multiple photos to checkpoint', () => {
      const { result } = renderHook(() => useCheckpointStore());
      const photo1 = 'file://photo1.jpg';
      const photo2 = 'file://photo2.jpg';

      act(() => {
        result.current.setProjectId('test_project');
        result.current.addPhoto(mockCheckpointId, photo1);
        result.current.addPhoto(mockCheckpointId, photo2);
      });

      expect(result.current.changes.test_project?.[mockCheckpointId]?.userPhotos).toEqual([photo1, photo2]);
    });

    it('should not add duplicate photos', () => {
      const { result } = renderHook(() => useCheckpointStore());

      act(() => {
        result.current.setProjectId('test_project');
        result.current.addPhoto(mockCheckpointId, mockPhotoUri);
        result.current.addPhoto(mockCheckpointId, mockPhotoUri);
      });

      expect(result.current.changes.test_project?.[mockCheckpointId]?.userPhotos).toEqual([mockPhotoUri]);
    });
  });

  describe('removePhoto', () => {
    it('should remove photo from checkpoint', () => {
      const { result } = renderHook(() => useCheckpointStore());
      const photo1 = 'file://photo1.jpg';
      const photo2 = 'file://photo2.jpg';

      act(() => {
        result.current.setProjectId('test_project');
        result.current.addPhoto(mockCheckpointId, photo1);
        result.current.addPhoto(mockCheckpointId, photo2);
      });

      expect(result.current.changes.test_project?.[mockCheckpointId]?.userPhotos).toHaveLength(2);

      // Remove one photo
      act(() => {
        result.current.removePhoto(mockCheckpointId, photo1);
      });

      expect(result.current.changes.test_project?.[mockCheckpointId]?.userPhotos).toEqual([photo2]);
    });

    it('should handle removing non-existent photo', () => {
      const { result } = renderHook(() => useCheckpointStore());

      act(() => {
        result.current.setProjectId('test_project');
        result.current.removePhoto(mockCheckpointId, 'non-existent-photo.jpg');
      });

      // Should not create changes entry for non-existent photo
      expect(result.current.changes.test_project?.[mockCheckpointId]).toBeUndefined();
    });
  });

  describe('setComment', () => {
    it('should set comment for checkpoint', () => {
      const { result } = renderHook(() => useCheckpointStore());

      act(() => {
        result.current.setProjectId('test_project');
        result.current.setComment(mockCheckpointId, mockComment);
      });

      expect(result.current.changes.test_project?.[mockCheckpointId]).toMatchObject({
        userComment: mockComment,
      });
    });

    it('should overwrite existing comment', () => {
      const { result } = renderHook(() => useCheckpointStore());

      act(() => {
        result.current.setProjectId('test_project');
        result.current.setComment(mockCheckpointId, 'First comment');
        result.current.setComment(mockCheckpointId, 'Second comment');
      });

      expect(result.current.changes.test_project?.[mockCheckpointId]?.userComment).toBe('Second comment');
    });

    it('should set empty comment', () => {
      const { result } = renderHook(() => useCheckpointStore());

      act(() => {
        result.current.setProjectId('test_project');
        result.current.setComment(mockCheckpointId, '');
      });

      expect(result.current.changes.test_project?.[mockCheckpointId]).toMatchObject({
        userComment: '',
      });
    });
  });

  describe('setRoom', () => {
    it('should set room for checkpoint', () => {
      const { result } = renderHook(() => useCheckpointStore());
      const mockRoom = 'Living Room';

      act(() => {
        result.current.setProjectId('test_project');
        result.current.setRoom(mockCheckpointId, mockRoom);
      });

      expect(result.current.changes.test_project?.[mockCheckpointId]).toMatchObject({
        selectedRoom: mockRoom,
      });
    });

    it('should overwrite existing room', () => {
      const { result } = renderHook(() => useCheckpointStore());

      act(() => {
        result.current.setProjectId('test_project');
        result.current.setRoom(mockCheckpointId, 'Bedroom');
        result.current.setRoom(mockCheckpointId, 'Kitchen');
      });

      expect(result.current.changes.test_project?.[mockCheckpointId]?.selectedRoom).toBe('Kitchen');
    });
  });

  describe('setProjectId', () => {
    it('should set active project ID', () => {
      const { result } = renderHook(() => useCheckpointStore());
      const mockProjectId = 'project_123';

      act(() => {
        result.current.setProjectId(mockProjectId);
      });

      expect(result.current.projectId).toBe(mockProjectId);
    });

    it('should handle setting null project ID', () => {
      const { result } = renderHook(() => useCheckpointStore());

      act(() => {
        result.current.setProjectId('test_project');
        result.current.updateCheckpointStatus(mockCheckpointId, 'complies');
      });

      expect(result.current.changes.test_project).toBeDefined();

      // Clear project
      act(() => {
        result.current.setProjectId(null);
      });

      expect(result.current.projectId).toBeNull();
    });
  });

  describe('deleteCheckpointData', () => {
    it('should delete all data for checkpoint', () => {
      const { result } = renderHook(() => useCheckpointStore());

      // Add various data to checkpoint
      act(() => {
        result.current.setProjectId('test_project');
        result.current.updateCheckpointStatus(mockCheckpointId, 'defect');
        result.current.addPhoto(mockCheckpointId, mockPhotoUri);
        result.current.setComment(mockCheckpointId, mockComment);
        result.current.setRoom(mockCheckpointId, 'Living Room');
      });

      expect(result.current.changes.test_project?.[mockCheckpointId]).toMatchObject({
        status: 'defect',
        userPhotos: [mockPhotoUri],
        userComment: mockComment,
        selectedRoom: 'Living Room',
      });

      // Delete all checkpoint data
      act(() => {
        result.current.deleteCheckpointData(mockCheckpointId);
      });

      expect(result.current.changes.test_project?.[mockCheckpointId]).toBeUndefined();
    });

    it('should handle deleting non-existent checkpoint data', () => {
      const { result } = renderHook(() => useCheckpointStore());

      act(() => {
        result.current.setProjectId('test_project');
        result.current.deleteCheckpointData('non-existent-checkpoint');
      });

      // Should not cause errors
      expect(result.current.changes.test_project).toEqual({});
    });
  });

  describe('getCheckpointState', () => {
    it('should return checkpoint data when exists', () => {
      const { result } = renderHook(() => useCheckpointStore());

      act(() => {
        result.current.setProjectId('test_project');
        result.current.updateCheckpointStatus(mockCheckpointId, 'complies');
        result.current.setComment(mockCheckpointId, mockComment);
      });

      const checkpointData = result.current.getCheckpointState(mockCheckpointId);
      expect(checkpointData).toMatchObject({
        status: 'complies',
        userComment: mockComment,
      });
    });

    it('should throw error when checkpoint ID does not exist', () => {
      const { result } = renderHook(() => useCheckpointStore());

      expect(() => {
        result.current.getCheckpointState('non-existent-checkpoint');
      }).toThrow('Checkpoint with ID "non-existent-checkpoint" not found in database');
    });
  });

  describe('clearAllChanges', () => {
    it('should clear all checkpoint changes', () => {
      const { result } = renderHook(() => useCheckpointStore());

      // Add multiple checkpoint changes
      act(() => {
        result.current.setProjectId('test_project');
        result.current.updateCheckpointStatus('checkpoint1', 'complies');
        result.current.updateCheckpointStatus('checkpoint2', 'defect');
        result.current.setComment('checkpoint1', 'Comment 1');
      });

      expect(Object.keys(result.current.changes.test_project || {})).toHaveLength(2);

      // Clear all changes
      act(() => {
        result.current.clearAllChanges();
      });

      expect(result.current.changes).toEqual({});
      expect(result.current.projectId).toBeNull();
    });
  });

  describe('Complex workflows', () => {
    it('should handle complete checkpoint workflow', () => {
      const { result } = renderHook(() => useCheckpointStore());
      const projectId = 'project_123';

      // Set project
      act(() => {
        result.current.setProjectId(projectId);
      });

      // Update status
      act(() => {
        result.current.updateCheckpointStatus(mockCheckpointId, 'defect');
      });

      // Add photos
      act(() => {
        result.current.addPhoto(mockCheckpointId, 'file://photo1.jpg');
        result.current.addPhoto(mockCheckpointId, 'file://photo2.jpg');
      });

      // Add comment
      act(() => {
        result.current.setComment(mockCheckpointId, 'Found issue with floor');
      });

      // Set room
      act(() => {
        result.current.setRoom(mockCheckpointId, 'Main Hall');
      });

      // Verify all data is stored correctly
      expect(result.current.changes[projectId]?.[mockCheckpointId]).toMatchObject({
        status: 'defect',
        userPhotos: ['file://photo1.jpg', 'file://photo2.jpg'],
        userComment: 'Found issue with floor',
        selectedRoom: 'Main Hall',
      });

      expect(result.current.projectId).toBe(projectId);
    });
  });
});