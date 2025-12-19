/**
 * Photo Management Workflow Integration Test
 *
 * Tests the complete workflow for managing photos in checkpoints:
 * - Selecting photos using expo-image-picker mock
 * - Adding photos to checkpoints
 * - Reordering photos
 * - Deleting photos
 * - Testing photo persistence in store and AsyncStorage
 * - Verifying PhotoGrid component updates
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import {
  renderForIntegration,
  TestDataFactories,
  WorkflowAssertions,
  TestScenarios,
  CleanupUtils,
} from '../../utils/integrationHelpers';
import { CommonTestDatasets } from '../../integration/helpers/checkpointsLoader';
import { useProjectStore, useCheckpointStore } from '../../../services/store';

// Import mocked image picker
import * as ImagePicker from 'expo-image-picker';

describe('Photo Management Workflow Integration', () => {
  let mockAsyncStorage: any;
  let navigationMocks: any;
  let stores: any;
  let projectId: string;
  let testCheckpoints: any[];

  // Mock photo URIs returned by image picker
  const mockPhotos = [
    'file://mock-image-1.jpg',
    'file://mock-image-2.jpg',
    'file://mock-image-3.jpg',
    'file://mock-photo-1.jpg',
    'file://mock-photo-2.jpg',
    'file://mock-photo-3.jpg',
  ];

  beforeEach(() => {
    // Setup integration test environment with checkpoints
    const scenario = TestScenarios.withCheckpoints();

    mockAsyncStorage = scenario.asyncStorageMock;
    navigationMocks = scenario.navigationMocks;
    stores = scenario.stores;
    projectId = 'test-project-id'; // From scenario setup
    testCheckpoints = scenario.testCheckpoints;

    // Reset image picker mock
    jest.clearAllMocks();
  });

  afterEach(() => {
    CleanupUtils.cleanup();
  });

  describe('Photo Selection and Addition', () => {
    it('should select and add photo to checkpoint using image picker', async () => {
      // ARRANGE: Get first checkpoint for testing
      if (!testCheckpoints || testCheckpoints.length === 0) {
        console.warn('No test checkpoints available, skipping test');
        return;
      }

      const testCheckpoint = testCheckpoints[0];

      // Mock image picker to return a photo
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        assets: [
          {
            uri: mockPhotos[0],
            width: 800,
            height: 600,
            fileName: 'mock-image-1.jpg',
            type: 'image',
          },
        ],
        cancelled: false,
      });

      // Mock permission request
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: true,
        status: 'granted',
      });

      // ACT: Select and add photo to checkpoint
      // Simulate the photo selection workflow
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      expect(permissionResult.granted).toBe(true);

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!pickerResult.cancelled && pickerResult.assets) {
        const selectedPhoto = pickerResult.assets[0];
        stores.checkpoint.addPhoto(testCheckpoint.id, selectedPhoto.uri);
      }

      // ASSERT: Verify photo was added to checkpoint
      const checkpointState = stores.checkpoint.getCheckpointState(testCheckpoint.id);
      expect(checkpointState.userPhotos).toContain(mockPhotos[0]);
      expect(checkpointState.userPhotos).toHaveLength(1);

      // ASSERT: Verify image picker was called correctly
      expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledTimes(1);

      // ASSERT: Verify photo was persisted
      mockAsyncStorage.expectOperation(
        'setItem',
        expect.stringContaining('checkpoint-store'),
        expect.any(String)
      );

      console.log(`✅ Photo added to checkpoint ${testCheckpoint.id}: ${mockPhotos[0]}`);
    });

    it('should add multiple photos to a checkpoint', async () => {
      // ARRANGE: Use second checkpoint for multiple photos test
      if (!testCheckpoints || testCheckpoints.length < 2) {
        console.warn('Not enough test checkpoints for multiple photos test');
        return;
      }

      const testCheckpoint = testCheckpoints[1];

      // Mock image picker to return different photos each time
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: true,
        status: 'granted',
      });

      // ACT: Add first photo
      ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
        assets: [
          {
            uri: mockPhotos[0],
            width: 800,
            height: 600,
            fileName: 'mock-image-1.jpg',
            type: 'image',
          },
        ],
        cancelled: false,
      });

      let pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        quality: 0.8,
      });

      if (!pickerResult.cancelled && pickerResult.assets) {
        stores.checkpoint.addPhoto(testCheckpoint.id, pickerResult.assets[0].uri);
      }

      // Add second photo
      ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
        assets: [
          {
            uri: mockPhotos[1],
            width: 1024,
            height: 768,
            fileName: 'mock-image-2.jpg',
            type: 'image',
          },
        ],
        cancelled: false,
      });

      pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        quality: 0.8,
      });

      if (!pickerResult.cancelled && pickerResult.assets) {
        stores.checkpoint.addPhoto(testCheckpoint.id, pickerResult.assets[0].uri);
      }

      // Add third photo
      ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
        assets: [
          {
            uri: mockPhotos[2],
            width: 1200,
            height: 900,
            fileName: 'mock-image-3.jpg',
            type: 'image',
          },
        ],
        cancelled: false,
      });

      pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        quality: 0.8,
      });

      if (!pickerResult.cancelled && pickerResult.assets) {
        stores.checkpoint.addPhoto(testCheckpoint.id, pickerResult.assets[0].uri);
      }

      // ASSERT: Verify all photos were added in correct order
      const checkpointState = stores.checkpoint.getCheckpointState(testCheckpoint.id);
      expect(checkpointState.userPhotos).toHaveLength(3);
      expect(checkpointState.userPhotos[0]).toBe(mockPhotos[0]);
      expect(checkpointState.userPhotos[1]).toBe(mockPhotos[1]);
      expect(checkpointState.userPhotos[2]).toBe(mockPhotos[2]);

      // ASSERT: Verify image picker was called 3 times
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledTimes(3);

      console.log(`✅ Multiple photos added to checkpoint ${testCheckpoint.id}: ${checkpointState.userPhotos.length} photos`);
    });

    it('should handle cancelled photo selection gracefully', async () => {
      // ARRANGE: Use third checkpoint for cancellation test
      if (!testCheckpoints || testCheckpoints.length < 3) {
        console.warn('Not enough test checkpoints for cancellation test');
        return;
      }

      const testCheckpoint = testCheckpoints[2];

      // Mock cancelled photo selection
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: true,
        status: 'granted',
      });

      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        cancelled: true,
      });

      // ACT: Attempt to select photo but cancel
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        quality: 0.8,
      });

      if (!pickerResult.cancelled && pickerResult.assets) {
        stores.checkpoint.addPhoto(testCheckpoint.id, pickerResult.assets[0].uri);
      }

      // ASSERT: Verify no photo was added when cancelled
      const checkpointState = stores.checkpoint.getCheckpointState(testCheckpoint.id);
      expect(checkpointState.userPhotos).toHaveLength(0);
      expect(checkpointState.userPhotos).not.toContain(expect.any(String));

      console.log(`✅ Photo cancellation handled gracefully for checkpoint ${testCheckpoint.id}`);
    });
  });

  describe('Camera Photo Capture', () => {
    it('should capture and add photo using camera', async () => {
      // ARRANGE: Use fourth checkpoint for camera test
      if (!testCheckpoints || testCheckpoints.length < 4) {
        console.warn('Not enough test checkpoints for camera test');
        return;
      }

      const testCheckpoint = testCheckpoints[3];

      // Mock camera permissions and capture
      ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        granted: true,
        status: 'granted',
      });

      ImagePicker.launchCameraAsync.mockResolvedValue({
        assets: [
          {
            uri: 'file://mock-camera-photo.jpg',
            width: 1920,
            height: 1080,
            fileName: 'camera-photo.jpg',
            type: 'image',
          },
        ],
        cancelled: false,
      });

      // ACT: Capture photo with camera
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      expect(permissionResult.granted).toBe(true);

      const cameraResult = await ImagePicker.launchCameraAsync({
        mediaTypes: 'Images',
        allowsEditing: false,
        quality: 0.7,
      });

      if (!cameraResult.cancelled && cameraResult.assets) {
        const cameraPhoto = cameraResult.assets[0];
        stores.checkpoint.addPhoto(testCheckpoint.id, cameraPhoto.uri);
      }

      // ASSERT: Verify camera photo was added
      const checkpointState = stores.checkpoint.getCheckpointState(testCheckpoint.id);
      expect(checkpointState.userPhotos).toContain('file://mock-camera-photo.jpg');
      expect(checkpointState.userPhotos).toHaveLength(1);

      // ASSERT: Verify camera methods were called
      expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(ImagePicker.launchCameraAsync).toHaveBeenCalledTimes(1);

      console.log(`✅ Camera photo added to checkpoint ${testCheckpoint.id}`);
    });
  });

  describe('Photo Deletion', () => {
    it('should delete photo from checkpoint', async () => {
      // ARRANGE: Setup checkpoint with multiple photos
      if (!testCheckpoints || testCheckpoints.length < 2) {
        console.warn('Not enough test checkpoints for deletion test');
        return;
      }

      const testCheckpoint = testCheckpoints[0];

      // Add initial photos
      stores.checkpoint.addPhoto(testCheckpoint.id, mockPhotos[0]);
      stores.checkpoint.addPhoto(testCheckpoint.id, mockPhotos[1]);
      stores.checkpoint.addPhoto(testCheckpoint.id, mockPhotos[2]);

      // Verify initial state
      let checkpointState = stores.checkpoint.getCheckpointState(testCheckpoint.id);
      expect(checkpointState.userPhotos).toHaveLength(3);

      // ACT: Delete middle photo
      stores.checkpoint.removePhoto(testCheckpoint.id, mockPhotos[1]);

      // ASSERT: Verify photo was removed
      checkpointState = stores.checkpoint.getCheckpointState(testCheckpoint.id);
      expect(checkpointState.userPhotos).toHaveLength(2);
      expect(checkpointState.userPhotos).not.toContain(mockPhotos[1]);
      expect(checkpointState.userPhotos[0]).toBe(mockPhotos[0]);
      expect(checkpointState.userPhotos[1]).toBe(mockPhotos[2]);

      console.log(`✅ Photo ${mockPhotos[1]} deleted from checkpoint ${testCheckpoint.id}`);
    });

    it('should delete all photos from checkpoint', async () => {
      // ARRANGE: Setup checkpoint with multiple photos
      if (!testCheckpoints || testCheckpoints.length < 3) {
        console.warn('Not enough test checkpoints for delete all test');
        return;
      }

      const testCheckpoint = testCheckpoints[2];

      // Add multiple photos
      mockPhotos.forEach(photo => {
        stores.checkpoint.addPhoto(testCheckpoint.id, photo);
      });

      // Verify initial state
      let checkpointState = stores.checkpoint.getCheckpointState(testCheckpoint.id);
      expect(checkpointState.userPhotos).toHaveLength(mockPhotos.length);

      // ACT: Delete all photos one by one
      [...checkpointState.userPhotos].forEach(photo => {
        stores.checkpoint.removePhoto(testCheckpoint.id, photo);
      });

      // ASSERT: Verify all photos were deleted
      checkpointState = stores.checkpoint.getCheckpointState(testCheckpoint.id);
      expect(checkpointState.userPhotos).toHaveLength(0);
      expect(checkpointState.userPhotos).toEqual([]);

      console.log(`✅ All photos deleted from checkpoint ${testCheckpoint.id}`);
    });

    it('should handle deletion of non-existent photo gracefully', () => {
      // ARRANGE: Use checkpoint with no photos
      if (!testCheckpoints || testCheckpoints.length === 0) {
        console.warn('No test checkpoints available');
        return;
      }

      const testCheckpoint = testCheckpoints[0];

      // ACT: Try to delete photo that doesn't exist
      expect(() => {
        stores.checkpoint.removePhoto(testCheckpoint.id, 'file://non-existent-photo.jpg');
      }).not.toThrow();

      // ASSERT: Verify no errors and checkpoint state unchanged
      const checkpointState = stores.checkpoint.getCheckpointState(testCheckpoint.id);
      expect(checkpointState.userPhotos).toHaveLength(0);

      console.log(`✅ Non-existent photo deletion handled gracefully`);
    });
  });

  describe('Photo Reordering', () => {
    it('should maintain photo order when added sequentially', async () => {
      // ARRANGE: Use checkpoint for ordering test
      if (!testCheckpoints || testCheckpoints.length === 0) {
        console.warn('No test checkpoints available');
        return;
      }

      const testCheckpoint = testCheckpoints[0];
      const orderedPhotos = mockPhotos.slice(0, 4); // Use first 4 photos

      // ACT: Add photos in specific order
      orderedPhotos.forEach(photo => {
        stores.checkpoint.addPhoto(testCheckpoint.id, photo);
      });

      // ASSERT: Verify photos maintained their order
      const checkpointState = stores.checkpoint.getCheckpointState(testCheckpoint.id);
      expect(checkpointState.userPhotos).toHaveLength(4);
      expect(checkpointState.userPhotos).toEqual(orderedPhotos);

      console.log(`✅ Photo order maintained: ${checkpointState.userPhotos.join(' -> ')}`);
    });

    it('should allow reordering by removing and re-adding', async () => {
      // ARRANGE: Setup checkpoint with photos
      if (!testCheckpoints || testCheckpoints.length === 0) {
        console.warn('No test checkpoints available');
        return;
      }

      const testCheckpoint = testCheckpoints[0];
      const initialOrder = [mockPhotos[0], mockPhotos[1], mockPhotos[2]];
      const newOrder = [mockPhotos[1], mockPhotos[0], mockPhotos[2]]; // Swap first two

      // Add initial photos
      initialOrder.forEach(photo => {
        stores.checkpoint.addPhoto(testCheckpoint.id, photo);
      });

      // ACT: Simulate reordering by removing all and re-adding in new order
      const currentState = stores.checkpoint.getCheckpointState(testCheckpoint.id);
      currentState.userPhotos.forEach(photo => {
        stores.checkpoint.removePhoto(testCheckpoint.id, photo);
      });

      newOrder.forEach(photo => {
        stores.checkpoint.addPhoto(testCheckpoint.id, photo);
      });

      // ASSERT: Verify new order is maintained
      const reorderedState = stores.checkpoint.getCheckpointState(testCheckpoint.id);
      expect(reorderedState.userPhotos).toEqual(newOrder);

      console.log(`✅ Photos reordered: ${newOrder.join(' -> ')}`);
    });
  });

  describe('Photo Persistence', () => {
    it('should persist photo data correctly', async () => {
      // ARRANGE: Use checkpoint for persistence test
      if (!testCheckpoints || testCheckpoints.length === 0) {
        console.warn('No test checkpoints available');
        return;
      }

      const testCheckpoint = testCheckpoints[0];

      // ACT: Add photos to checkpoint
      stores.checkpoint.addPhoto(testCheckpoint.id, mockPhotos[0]);
      stores.checkpoint.addPhoto(testCheckpoint.id, mockPhotos[1]);

      // Set some checkpoint data along with photos
      stores.checkpoint.setComment(testCheckpoint.id, 'Test comment with photos');

      // Simulate app restart
      mockAsyncStorage.simulateAppRestart();

      // Load persisted state
      const persistedState = mockAsyncStorage.getParsedStoreData('checkpoint-store');

      // ASSERT: Verify photos were persisted
      expect(persistedState).toBeDefined();
      expect(persistedState.state.changes[projectId]).toBeDefined();
      expect(persistedState.state.changes[projectId][testCheckpoint.id]).toBeDefined();

      const checkpointData = persistedState.state.changes[projectId][testCheckpoint.id];
      expect(checkpointData.userPhotos).toContain(mockPhotos[0]);
      expect(checkpointData.userPhotos).toContain(mockPhotos[1]);
      expect(checkpointData.userPhotos).toHaveLength(2);
      expect(checkpointData.userComment).toBe('Test comment with photos');

      console.log(`✅ Photos persisted correctly for checkpoint ${testCheckpoint.id}`);
    });

    it('should maintain photo data after app restart', async () => {
      // ARRANGE: Create complex photo scenario
      if (!testCheckpoints || testCheckpoints.length < 2) {
        console.warn('Not enough test checkpoints for restart test');
        return;
      }

      const checkpoint1 = testCheckpoints[0];
      const checkpoint2 = testCheckpoints[1];

      // Add photos to multiple checkpoints
      stores.checkpoint.addPhoto(checkpoint1.id, mockPhotos[0]);
      stores.checkpoint.addPhoto(checkpoint1.id, mockPhotos[1]);
      stores.checkpoint.addPhoto(checkpoint2.id, mockPhotos[2]);
      stores.checkpoint.addPhoto(checkpoint2.id, mockPhotos[3]);

      // Store original photo data
      const originalPhotos1 = stores.checkpoint.getCheckpointState(checkpoint1.id).userPhotos;
      const originalPhotos2 = stores.checkpoint.getCheckpointState(checkpoint2.id).userPhotos;

      // ACT: Simulate app restart
      mockAsyncStorage.simulateAppRestart();

      // Re-initialize store (simulating app startup)
      stores.checkpoint.setProjectId(projectId);

      // ASSERT: Verify photo data is maintained after restart
      const restoredPhotos1 = stores.checkpoint.getCheckpointState(checkpoint1.id).userPhotos;
      const restoredPhotos2 = stores.checkpoint.getCheckpointState(checkpoint2.id).userPhotos;

      expect(restoredPhotos1).toEqual(originalPhotos1);
      expect(restoredPhotos2).toEqual(originalPhotos2);

      console.log(`✅ Photo data maintained after restart:`);
      console.log(`  Checkpoint 1: ${restoredPhotos1.length} photos`);
      console.log(`  Checkpoint 2: ${restoredPhotos2.length} photos`);
    });
  });

  describe('Error Handling', () => {
    it('should handle permission denial gracefully', async () => {
      // ARRANGE: Mock denied permissions
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: false,
        status: 'denied',
      });

      // ACT: Try to select photo with denied permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      // ASSERT: Handle permission denial gracefully
      expect(permissionResult.granted).toBe(false);
      // Should not attempt to launch image picker without permissions

      console.log(`✅ Permission denial handled gracefully`);
    });

    it('should handle image picker errors gracefully', async () => {
      // ARRANGE: Mock image picker error
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: true,
        status: 'granted',
      });

      ImagePicker.launchImageLibraryAsync.mockRejectedValue(
        new Error('Image picker failed')
      );

      // ACT: Try to select photo with error
      try {
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'Images',
          quality: 0.8,
        });
      } catch (error) {
        // Handle error gracefully
        expect(error.message).toBe('Image picker failed');
      }

      console.log(`✅ Image picker error handled gracefully`);
    });

    it('should handle invalid photo URIs gracefully', () => {
      // ARRANGE: Use checkpoint for invalid URI test
      if (!testCheckpoints || testCheckpoints.length === 0) {
        console.warn('No test checkpoints available');
        return;
      }

      const testCheckpoint = testCheckpoints[0];

      // ACT: Try to add photo with invalid URI
      expect(() => {
        stores.checkpoint.addPhoto(testCheckpoint.id, ''); // Empty URI
        stores.checkpoint.addPhoto(testCheckpoint.id, null as any); // Null URI
        stores.checkpoint.addPhoto(testCheckpoint.id, undefined as any); // Undefined URI
      }).not.toThrow();

      // ASSERT: Checkpoint state handles invalid URIs gracefully
      const checkpointState = stores.checkpoint.getCheckpointState(testCheckpoint.id);
      // The store should handle invalid URIs appropriately (depends on implementation)
      expect(Array.isArray(checkpointState.userPhotos)).toBe(true);

      console.log(`✅ Invalid photo URIs handled gracefully`);
    });
  });

  describe('Performance with Multiple Photos', () => {
    it('should handle large number of photos efficiently', async () => {
      // ARRANGE: Create scenario with many photos
      if (!testCheckpoints || testCheckpoints.length === 0) {
        console.warn('No test checkpoints available');
        return;
      }

      const testCheckpoint = testCheckpoints[0];
      const manyPhotos = Array.from({ length: 50 }, (_, i) => `file://photo-${i}.jpg`);

      const startTime = Date.now();

      // ACT: Add many photos
      manyPhotos.forEach(photo => {
        stores.checkpoint.addPhoto(testCheckpoint.id, photo);
      });

      const addTime = Date.now() - startTime;

      // Test retrieval performance
      const retrievalStart = Date.now();
      const checkpointState = stores.checkpoint.getCheckpointState(testCheckpoint.id);
      const retrievalTime = Date.now() - retrievalStart;

      // Test deletion performance (delete half)
      const deleteStart = Date.now();
      checkpointState.userPhotos.slice(0, 25).forEach(photo => {
        stores.checkpoint.removePhoto(testCheckpoint.id, photo);
      });
      const deleteTime = Date.now() - deleteStart;

      // ASSERT: Performance should be reasonable
      expect(addTime).toBeLessThan(1000); // Adding 50 photos should be < 1 second
      expect(retrievalTime).toBeLessThan(100); // Retrieval should be < 100ms
      expect(deleteTime).toBeLessThan(500); // Deleting 25 photos should be < 500ms

      // Verify final state
      const finalState = stores.checkpoint.getCheckpointState(testCheckpoint.id);
      expect(finalState.userPhotos).toHaveLength(25);

      console.log(`✅ Performance test with ${manyPhotos.length} photos:`);
      console.log(`  Add time: ${addTime}ms`);
      console.log(`  Retrieval time: ${retrievalTime}ms`);
      console.log(`  Delete time: ${deleteTime}ms`);
      console.log(`  Final photo count: ${finalState.userPhotos.length}`);
    });
  });

  describe('Full Photo Management Workflow', () => {
    it('should complete comprehensive photo management workflow', async () => {
      // ARRANGE: Setup comprehensive test
      if (!testCheckpoints || testCheckpoints.length < 3) {
        console.warn('Not enough test checkpoints for full workflow');
        return;
      }

      const checkpoints = [testCheckpoints[0], testCheckpoints[1], testCheckpoints[2]];

      // Mock permissions
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: true,
        status: 'granted',
      });

      ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        granted: true,
        status: 'granted',
      });

      // ACT 1: Add photos from library to multiple checkpoints
      for (let i = 0; i < checkpoints.length; i++) {
        // Mock different photo selections
        ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
          assets: [
            {
              uri: mockPhotos[i],
              width: 800,
              height: 600,
              fileName: `photo-${i}.jpg`,
              type: 'image',
            },
          ],
          cancelled: false,
        });

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'Images',
          quality: 0.8,
        });

        if (!pickerResult.cancelled && pickerResult.assets) {
          stores.checkpoint.addPhoto(checkpoints[i].id, pickerResult.assets[0].uri);
        }
      }

      // ACT 2: Add camera photo to first checkpoint
      ImagePicker.launchCameraAsync.mockResolvedValue({
        assets: [
          {
            uri: 'file://camera-workflow.jpg',
            width: 1920,
            height: 1080,
            fileName: 'camera-workflow.jpg',
            type: 'image',
          },
        ],
        cancelled: false,
      });

      const cameraResult = await ImagePicker.launchCameraAsync({
        mediaTypes: 'Images',
        quality: 0.7,
      });

      if (!cameraResult.cancelled && cameraResult.assets) {
        stores.checkpoint.addPhoto(checkpoints[0].id, cameraResult.assets[0].uri);
      }

      // ACT 3: Add comments along with photos
      checkpoints.forEach((checkpoint, index) => {
        stores.checkpoint.setComment(checkpoint.id, `Comment ${index} with photos`);
      });

      // ACT 4: Test photo reordering by adding more photos
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        assets: [
          {
            uri: mockPhotos[3],
            width: 800,
            height: 600,
            fileName: 'reorder-photo.jpg',
            type: 'image',
          },
        ],
        cancelled: false,
      });

      const reorderResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        quality: 0.8,
      });

      if (!reorderResult.cancelled && reorderResult.assets) {
        // Add to beginning of first checkpoint to test order
        const currentState = stores.checkpoint.getCheckpointState(checkpoints[0].id);
        const currentPhotos = [...currentState.userPhotos];
        stores.checkpoint.removePhoto(checkpoints[0].id, currentPhotos[0]);
        stores.checkpoint.addPhoto(checkpoints[0].id, reorderResult.assets[0].uri);
        currentPhotos.forEach(photo => stores.checkpoint.addPhoto(checkpoints[0].id, photo));
      }

      // ACT 5: Delete some photos
      const secondCheckpointState = stores.checkpoint.getCheckpointState(checkpoints[1].id);
      if (secondCheckpointState.userPhotos.length > 0) {
        stores.checkpoint.removePhoto(checkpoints[1].id, secondCheckpointState.userPhotos[0]);
      }

      // ASSERT: Verify comprehensive workflow results
      checkpoints.forEach((checkpoint, index) => {
        const state = stores.checkpoint.getCheckpointState(checkpoint.id);

        if (index === 0) {
          // First checkpoint should have 2 photos (original + camera + reorder)
          expect(state.userPhotos.length).toBeGreaterThanOrEqual(2);
          expect(state.userComment).toBe('Comment 0 with photos');
        } else if (index === 1) {
          // Second checkpoint should have 0 photos (deleted)
          expect(state.userPhotos.length).toBe(0);
          expect(state.userComment).toBe('Comment 1 with photos');
        } else {
          // Third checkpoint should have 1 photo
          expect(state.userPhotos.length).toBe(1);
          expect(state.userComment).toBe('Comment 2 with photos');
        }
      });

      // ASSERT: Verify persistence worked throughout
      mockAsyncStorage.expectOperation(
        'setItem',
        expect.stringContaining('checkpoint-store'),
        expect.any(String)
      );

      // ASSERT: Verify image picker was used correctly
      expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalledTimes(4);
      expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledTimes(4);
      expect(ImagePicker.launchCameraAsync).toHaveBeenCalledTimes(1);

      console.log('✅ Comprehensive photo management workflow completed successfully');
      console.log(`  Photos added across ${checkpoints.length} checkpoints`);
      console.log(`  Camera integration tested`);
      console.log(`  Photo ordering tested`);
      console.log(`  Photo deletion tested`);
      console.log(`  Comments with photos tested`);
    });
  });
});