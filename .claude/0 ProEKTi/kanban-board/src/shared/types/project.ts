export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string; // Hex color format
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  taskCount: number; // Denormalized for performance
  isActive: boolean;
}

export interface ProjectSettings {
  id: string;
  projectId: string;
  // Future settings: custom columns, workflows, etc.
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  color: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

// Predefined color palette for projects
export const PROJECT_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#14B8A6', // teal-500
  '#F97316', // orange-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#6366F1', // indigo-500
  '#A855F7', // purple-500
] as const;

export type ProjectColor = typeof PROJECT_COLORS[number];