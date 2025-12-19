/**
 * Type definitions for Apartment Auditor database
 * Based on checkpoints_v2.1.json structure
 */

export type CheckpointStatus = 'complies' | 'defect' | 'not_inspected' | null;
export type FinishMode = 'draft' | 'finish';

export interface DBCheckpoint {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  tolerance: string;
  method: string;
  standardReference: string;
  violationText: string;
  hintLayman: string;
  referenceImageUrl: string;
  status: CheckpointStatus | null;
  userPhotos: string[];
  userComment: string;
  selectedRoom?: string;
}

export interface Category {
  id: string;
  name: string;
  draft: DBCheckpoint[];
  finish: DBCheckpoint[];
}

export interface CheckpointsDatabase {
  version: string;
  generatedAt: string;
  description: string;
  totalCheckpoints: number;
  categories: Record<string, Category>;
}

// User's checkpoint state (in project)
export interface ProjectCheckpoint {
  dbCheckpointId: string;
  status: CheckpointStatus;
  photos: string[];       // file:// URIs
  notes: string;
  timestamp?: number;
}

// Category progress tracking
export interface ProgressResult {
  total: number;
  completed: number;
  percentage: number;
}

// Category info for UI
export interface CategoryInfo {
  id: string;
  name: string;
  draftCount: number;
  finishCount: number;
}

// UI state interface
export interface UIState {
  finishMode: 'draft' | 'finish';
  activeTab: 'objects' | 'services';  // Updated to match new navigation
  isLoading: boolean;
  themeMode: 'light' | 'dark' | 'system';
}

// Project state (expanded with UI properties)
export interface Project {
  id: string;
  address?: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  finishMode: 'draft' | 'finish';
  isActive: boolean;

  // Phase 4 additions
  participants?: Participant[];  // Added for PDF generation
}

// Changes tracking
export interface CheckpointChanges {
  [projectId: string]: {
    [checkpointId: string]: {
      status?: CheckpointStatus;
      userPhotos?: string[];
      userComment?: string;
      selectedRoom?: string;
      timestamp?: number;
    };
  } | undefined;
}

// Phase 4: PDF Generation Types

// Participant in project
export interface Participant {
  role: 'developer' | 'representative' | 'inspector';
  fullName: string;
  position: string;
  organization: string;
}

// Report data structure
export interface ReportData {
  projectId: string;
  projectTitle: string;
  projectAddress?: string;
  generatedAt: Date;
  finishMode: 'draft' | 'finish';
  participants: Participant[];

  categories: {
    categoryId: string;
    categoryName: string;
    checkpoints: ReportCheckpoint[];
    stats: {
      total: number;
      complies: number;
      defects: number;
      notInspected: number;
      percentage: number;
    };
  }[];

  summary: {
    totalCheckpoints: number;
    totalComplies: number;
    totalDefects: number;
    totalNotInspected: number;
    overallPercentage: number;
  };
}

// Checkpoint in report (merged DB + user data)
export interface ReportCheckpoint {
  id: string;
  categoryName: string;
  title: string;
  status: CheckpointStatus;
  violation?: string;         // violationText from DB
  standardReference?: string; // standardReference from DB
  photos: ProcessedPhoto[];
  comment?: string;
  selectedRoom?: string;
}

// Processed photo (ready for PDF)
export interface ProcessedPhoto {
  base64: string;    // data:image/jpeg;base64,...
  width: number;
  height: number;
  originalUri: string;
}

// Progress callback for photo processing
export interface PhotoProcessProgress {
  current: number;
  total: number;
  percentage: number;
}