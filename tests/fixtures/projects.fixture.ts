/**
 * Project Fixtures for Testing
 *
 * These are sample project data used in unit, integration, and E2E tests.
 */

import { checkpointsFixture } from './checkpoints.fixture';

export interface TestProject {
  id: string;
  name: string;
  description: string;
  location?: string;
  createdAt: Date;
  participants: TestParticipant[];
  progress?: Record<string, number>;
}

export interface TestParticipant {
  id: string;
  name: string;
  role: string;
  contact: string;
}

// ===========================
// Sample Projects
// ===========================

export const basicProject: TestProject = {
  id: 'project-basic-001',
  name: 'Test Apartment',
  description: 'Simple test apartment for unit testing',
  location: 'Test Street, 123',
  createdAt: new Date('2025-01-01T10:00:00Z'),
  participants: [],
  progress: {
    walls: 0,
    floors: 0,
    ceiling: 0,
    windows: 0,
    doors: 0,
    plumbing: 0,
    electrical: 0,
    hvac: 0,
    gas: 0,
  },
};

export const projectWithParticipants: TestProject = {
  id: 'project-with-participants-001',
  name: 'Apartment with Inspectors',
  description: 'Apartment with multiple participants',
  location: 'Lenina Street, 15',
  createdAt: new Date('2025-01-05T14:30:00Z'),
  participants: [
    {
      id: 'participant-1',
      name: 'John Doe',
      role: 'Lead Auditor',
      contact: 'john.doe@example.com',
    },
    {
      id: 'participant-2',
      name: 'Jane Smith',
      role: 'Inspector',
      contact: 'jane.smith@example.com',
    },
    {
      id: 'participant-3',
      name: 'Bob Johnson',
      role: 'Photographer',
      contact: 'bob.johnson@example.com',
    },
  ],
  progress: {
    walls: 0,
    floors: 0,
    ceiling: 0,
    windows: 0,
    doors: 0,
    plumbing: 0,
    electrical: 0,
    hvac: 0,
    gas: 0,
  },
};

export const projectPartiallyCompleted: TestProject = {
  id: 'project-partial-001',
  name: 'Partially Inspected Apartment',
  description: 'Apartment with some categories completed',
  location: 'Main Avenue, 42',
  createdAt: new Date('2025-01-10T09:00:00Z'),
  participants: [
    {
      id: 'participant-4',
      name: 'Alice Williams',
      role: 'Lead Auditor',
      contact: 'alice.williams@example.com',
    },
  ],
  progress: {
    walls: 100, // Completed
    floors: 75, // Mostly done
    ceiling: 50, // Halfway done
    windows: 25, // Just started
    doors: 0, // Not started
    plumbing: 0,
    electrical: 0,
    hvac: 0,
    gas: 0,
  },
};

export const projectFullyCompleted: TestProject = {
  id: 'project-completed-001',
  name: 'Fully Inspected Apartment',
  description: 'Complete inspection of apartment',
  location: 'Oak Road, 88',
  createdAt: new Date('2024-12-20T12:00:00Z'),
  participants: [
    {
      id: 'participant-5',
      name: 'Charlie Brown',
      role: 'Lead Auditor',
      contact: 'charlie.brown@example.com',
    },
    {
      id: 'participant-6',
      name: 'Diana Prince',
      role: 'Inspector',
      contact: 'diana.prince@example.com',
    },
  ],
  progress: {
    walls: 100,
    floors: 100,
    ceiling: 100,
    windows: 100,
    doors: 100,
    plumbing: 100,
    electrical: 100,
    hvac: 100,
    gas: 100,
  },
};

// ===========================
// Project Collections for Batch Testing
// ===========================

export const projectsFixture: TestProject[] = [
  basicProject,
  projectWithParticipants,
  projectPartiallyCompleted,
  projectFullyCompleted,
];

// ===========================
// Factory Functions
// ===========================

export function createTestProject(overrides?: Partial<TestProject>): TestProject {
  return {
    id: `project-${Date.now()}`,
    name: 'Test Project',
    description: 'Auto-generated test project',
    location: 'Test Location',
    createdAt: new Date(),
    participants: [],
    progress: {
      walls: 0,
      floors: 0,
      ceiling: 0,
      windows: 0,
      doors: 0,
      plumbing: 0,
      electrical: 0,
      hvac: 0,
      gas: 0,
    },
    ...overrides,
  };
}

export function createTestParticipant(overrides?: Partial<TestParticipant>): TestParticipant {
  return {
    id: `participant-${Date.now()}`,
    name: 'Test User',
    role: 'Inspector',
    contact: 'test@example.com',
    ...overrides,
  };
}

// ===========================
// Participant Fixtures
// ===========================

export const testParticipants = {
  leadAuditor: {
    id: 'participant-lead-1',
    name: 'Senior Auditor',
    role: 'Lead Auditor',
    contact: 'senior@example.com',
  },
  inspector: {
    id: 'participant-inspector-1',
    name: 'Field Inspector',
    role: 'Inspector',
    contact: 'inspector@example.com',
  },
  photographer: {
    id: 'participant-photo-1',
    name: 'Photographer',
    role: 'Photographer',
    contact: 'photographer@example.com',
  },
  coordinator: {
    id: 'participant-coord-1',
    name: 'Project Coordinator',
    role: 'Coordinator',
    contact: 'coordinator@example.com',
  },
};

export default {
  basicProject,
  projectWithParticipants,
  projectPartiallyCompleted,
  projectFullyCompleted,
  projectsFixture,
  createTestProject,
  createTestParticipant,
  testParticipants,
};
