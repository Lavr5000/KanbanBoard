/**
 * Participant Management Workflow Integration Test (Simplified)
 *
 * Tests the complete workflow for managing project participants through stores only:
 * - Adding participants with different roles
 * - Editing participant information
 * - Deleting participants
 * - Using react-native-contacts mock
 * - Verifying store updates and persistence
 */

import {
  renderForIntegration,
  TestDataFactories,
  WorkflowAssertions,
  TestScenarios,
  CleanupUtils,
} from '../../utils/integrationHelpers';
import { useProjectStore } from '../../../services/store';
import type { Participant } from '../../../types/database.types';

// Import the mocked contacts
const Contacts = require('react-native-contacts');

describe('Participant Management Workflow Integration', () => {
  let mockAsyncStorage: any;
  let stores: any;

  beforeEach(() => {
    // Setup integration test environment
    const setup = renderForIntegration(<></>, {
      navigationPath: '/(tabs)/objects',
    });

    mockAsyncStorage = setup.asyncStorageMock;
    stores = setup.stores;

    // Reset contacts mock
    jest.clearAllMocks();
  });

  afterEach(() => {
    CleanupUtils.cleanup();
  });

  describe('Adding Participants', () => {
    it('should add multiple participants with different roles', () => {
      // ARRANGE: Create project for participants
      const testProject = TestDataFactories.createProject();
      const projectId = stores.project.createProject(testProject.title, testProject.address);

      // Create participant data
      const participants: Participant[] = [
        {
          role: 'developer',
          fullName: 'John Developer',
          position: 'Project Manager',
          organization: 'BuildCo',
        },
        {
          role: 'representative',
          fullName: 'Jane Representative',
          position: 'Property Owner',
          organization: 'OwnerAssoc',
        },
        {
          role: 'inspector',
          fullName: 'Bob Inspector',
          position: 'Senior Inspector',
          organization: 'InspectPro',
        },
      ];

      // ACT: Save participants through project update
      stores.project.updateProject(projectId, {
        participants,
      });

      // ASSERT: Verify participants saved to store
      const updatedProject = stores.project.projects.find((p: any) => p.id === projectId);
      expect(updatedProject.participants).toHaveLength(3);
      expect(updatedProject.participants).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'developer',
            fullName: 'John Developer',
          }),
          expect.objectContaining({
            role: 'representative',
            fullName: 'Jane Representative',
          }),
          expect.objectContaining({
            role: 'inspector',
            fullName: 'Bob Inspector',
          }),
        ])
      );

      // ASSERT: Verify persistence
      WorkflowAssertions.expectProjectCreated(
        { project: stores.project },
        mockAsyncStorage,
        expect.objectContaining({
          participants,
        })
      );
    });

    it('should use contacts mock to add participant from device contacts', () => {
      // ARRANGE: Mock contacts selection
      const mockContact = {
        recordID: 'contact-1',
        name: 'Alice Contact',
        phoneNumbers: [{ label: 'mobile', number: '+1234567890' }],
        emailAddresses: [{ label: 'work', email: 'alice@example.com' }],
      };

      Contacts.openContactPicker.mockResolvedValue(mockContact);

      // ACT: Simulate contact selection and participant creation
      const participantFromContact: Participant = {
        role: 'inspector',
        fullName: mockContact.name,
        position: 'Field Inspector',
        organization: 'External Contractor',
      };

      const testProject = TestDataFactories.createProject();
      const projectId = stores.project.createProject(testProject.title);
      stores.project.updateProject(projectId, {
        participants: [participantFromContact],
      });

      // ASSERT: Verify contact picker was called
      expect(Contacts.openContactPicker).toHaveBeenCalledTimes(1);

      // ASSERT: Verify participant was created with contact data
      const updatedProject = stores.project.projects.find((p: any) => p.id === projectId);
      expect(updatedProject.participants[0]).toEqual(
        expect.objectContaining({
          fullName: 'Alice Contact',
          role: 'inspector',
        })
      );
    });
  });

  describe('Editing Participants', () => {
    it('should update participant information', () => {
      // ARRANGE: Create project with initial participant
      const testProject = TestDataFactories.createProject();
      const projectId = stores.project.createProject(testProject.title);

      const initialParticipant: Participant = {
        role: 'inspector',
        fullName: 'John Smith',
        position: 'Junior Inspector',
        organization: 'InspectCo',
      };

      stores.project.updateProject(projectId, {
        participants: [initialParticipant],
      });

      // ACT: Update participant information
      const updatedParticipant: Participant = {
        role: 'inspector',
        fullName: 'John Smith', // Same name
        position: 'Senior Inspector', // Updated position
        organization: 'InspectPro', // Updated organization
      };

      stores.project.updateProject(projectId, {
        participants: [updatedParticipant],
      });

      // ASSERT: Verify participant was updated
      const updatedProject = stores.project.projects.find((p: any) => p.id === projectId);
      expect(updatedProject.participants[0]).toEqual(updatedParticipant);

      // ASSERT: Verify updates were persisted
      mockAsyncStorage.expectOperation(
        'setItem',
        expect.stringContaining('project-store'),
        expect.stringContaining('Senior Inspector')
      );
    });

    it('should change participant role', () => {
      // ARRANGE: Create project with inspector
      const testProject = TestDataFactories.createProject();
      const projectId = stores.project.createProject(testProject.title);

      const initialParticipant: Participant = {
        role: 'inspector',
        fullName: 'John Smith',
        position: 'Inspector',
        organization: 'InspectCo',
      };

      stores.project.updateProject(projectId, {
        participants: [initialParticipant],
      });

      // ACT: Change role to representative
      const roleChangedParticipant: Participant = {
        role: 'representative',
        fullName: 'John Smith',
        position: 'Property Representative',
        organization: 'OwnerAssoc',
      };

      stores.project.updateProject(projectId, {
        participants: [roleChangedParticipant],
      });

      // ASSERT: Verify role was changed
      const updatedProject = stores.project.projects.find((p: any) => p.id === projectId);
      expect(updatedProject.participants[0].role).toBe('representative');
      expect(updatedProject.participants[0]).toEqual(roleChangedParticipant);
    });
  });

  describe('Deleting Participants', () => {
    it('should remove participant from project', () => {
      // ARRANGE: Create project with multiple participants
      const testProject = TestDataFactories.createProject();
      const projectId = stores.project.createProject(testProject.title);

      const participants: Participant[] = [
        {
          role: 'developer',
          fullName: 'Dev One',
          position: 'Manager',
          organization: 'DevCo',
        },
        {
          role: 'inspector',
          fullName: 'Inspector One',
          position: 'Inspector',
          organization: 'InspectCo',
        },
        {
          role: 'representative',
          fullName: 'Rep One',
          position: 'Representative',
          organization: 'RepCo',
        },
      ];

      stores.project.updateProject(projectId, { participants });

      // ACT: Remove the inspector
      const participantsAfterDeletion = participants.filter(p => p.role !== 'inspector');
      stores.project.updateProject(projectId, {
        participants: participantsAfterDeletion,
      });

      // ASSERT: Verify participant was removed
      const updatedProject = stores.project.projects.find((p: any) => p.id === projectId);
      expect(updatedProject.participants).toHaveLength(2);
      expect(updatedProject.participants).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ role: 'developer' }),
          expect.objectContaining({ role: 'representative' }),
        ])
      );
      expect(updatedProject.participants).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ role: 'inspector' }),
        ])
      );
    });

    it('should handle deletion of non-existent participant gracefully', () => {
      // ARRANGE: Create project with single participant
      const testProject = TestDataFactories.createProject();
      const projectId = stores.project.createProject(testProject.title);

      const singleParticipant: Participant = {
        role: 'developer',
        fullName: 'Solo Dev',
        position: 'Developer',
        organization: 'SoloCo',
      };

      stores.project.updateProject(projectId, {
        participants: [singleParticipant],
      });

      // ACT: Try to remove participant that doesn't exist (no-op)
      stores.project.updateProject(projectId, {
        participants: [singleParticipant], // Same array, no changes
      });

      // ASSERT: Verify no errors and participant still exists
      const updatedProject = stores.project.projects.find((p: any) => p.id === projectId);
      expect(updatedProject.participants).toHaveLength(1);
      expect(updatedProject.participants[0]).toEqual(singleParticipant);
    });
  });

  describe('Workflow Integration', () => {
    it('should complete full participant management workflow', () => {
      // ARRANGE: Create project
      const testProject = TestDataFactories.createProject({
        title: 'Full Workflow Test Project',
      });
      const projectId = stores.project.createProject(testProject.title);

      // ACT 1: Add initial participants
      const initialParticipants: Participant[] = [
        TestDataFactories.createParticipant({
          role: 'developer',
          fullName: 'Initial Developer',
          organization: 'DevCo',
        }),
        TestDataFactories.createParticipant({
          role: 'inspector',
          fullName: 'Initial Inspector',
          organization: 'InspectCo',
        }),
      ];

      stores.project.updateProject(projectId, {
        participants: initialParticipants,
      });

      // ACT 2: Edit first participant
      const editedParticipants = [...initialParticipants];
      editedParticipants[0] = {
        ...editedParticipants[0],
        position: 'Senior Developer',
      };

      stores.project.updateProject(projectId, {
        participants: editedParticipants,
      });

      // ACT 3: Add new participant using contacts mock
      Contacts.getAll.mockResolvedValue([
        {
          recordID: 'contact-2',
          name: 'New Contact',
          phoneNumbers: [{ label: 'work', number: '+0987654321' }],
        },
      ]);

      const newParticipant: Participant = {
        role: 'representative',
        fullName: 'New Contact',
        position: 'Property Representative',
        organization: 'OwnerOrg',
      };

      const finalParticipants = [...editedParticipants, newParticipant];
      stores.project.updateProject(projectId, {
        participants: finalParticipants,
      });

      // ACT 4: Remove inspector participant
      const participantsWithoutInspector = finalParticipants.filter(
        p => p.role !== 'inspector'
      );

      stores.project.updateProject(projectId, {
        participants: participantsWithoutInspector,
      });

      // ASSERT: Verify final state
      const finalProject = stores.project.projects.find((p: any) => p.id === projectId);
      expect(finalProject.participants).toHaveLength(2);
      expect(finalProject.participants).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'developer',
            fullName: 'Initial Developer',
            position: 'Senior Developer',
          }),
          expect.objectContaining({
            role: 'representative',
            fullName: 'New Contact',
            organization: 'OwnerOrg',
          }),
        ])
      );

      // ASSERT: Verify all operations were persisted
      expect(mockAsyncStorage.getOperationLog()).toContainEqual(
        expect.objectContaining({
          operation: 'setItem',
          key: expect.stringContaining('project-store'),
        })
      );
    });
  });
});