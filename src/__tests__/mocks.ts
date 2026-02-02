import { vi } from 'vitest'
import React from 'react'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock @dnd-kit/core
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => React.createElement('div', null, children),
  useDroppable: () => ({
    setNodeRef: vi.fn(),
    isOver: false,
  }),
  useDraggable: () => ({
    setNodeRef: vi.fn(),
    attributes: {},
    listeners: {},
    transform: null,
    isDragging: false,
  }),
  useSensors: (sensors: any) => sensors,
  useSensor: (sensor: any, options?: any) => ({ name: sensor, options }),
  PointerSensor: class PointerSensor {},
  TouchSensor: class TouchSensor {},
  DragOverlay: ({ children }: any) => React.createElement('div', null, children),
  defaultDropAnimationSideEffects: vi.fn(() => ({})),
}))

// Mock @dnd-kit/sortable
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    setNodeRef: vi.fn(),
    attributes: {},
    listeners: {},
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  SortableContext: ({ children }: any) => React.createElement('div', null, children),
  verticalListSortingStrategy: {},
}))

// Mock CSS from @dnd-kit/utilities
vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Translate: {
      toString: () => '',
    },
  },
}))

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => ({ data: null, error: null })),
          order: vi.fn(() => ({ data: [], error: null })),
        })),
        order: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
    })),
  })),
}))

// Mock useAISuggestions hook
vi.mock('@/features/ai-suggestions/hooks/useAISuggestions', () => ({
  useAISuggestions: () => ({
    suggestions: [],
    isLoading: false,
    error: null,
  }),
}))

// Mock useTaskAI hook
vi.mock('@/features/task-ai-suggestions', () => ({
  useTaskAI: () => ({
    suggestions: null,
    loading: false,
    error: null,
    visible: false,
    generateSuggestions: vi.fn(),
    hideSuggestions: vi.fn(),
    restoreSuggestions: vi.fn(),
  }),
  TaskAISuggestions: () => null,
  AISuggestionIcon: () => null,
}))

// Mock useRoadmap hook
vi.mock('@/features/roadmap/hooks/useRoadmap', () => ({
  useRoadmap: () => ({
    roadmap: null,
    isLoading: false,
    error: null,
  }),
}))

// Mock parseRoadmapTasks
vi.mock('@/features/roadmap/lib/parser', () => ({
  parseRoadmapTasks: () => [],
}))

// Mock useBoardData hook
vi.mock('@/hooks/useBoardData', () => ({
  useBoardData: () => ({
    columns: [],
    tasks: [],
    loading: false,
    error: null,
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    moveTask: vi.fn(),
    refetchColumns: vi.fn(),
  }),
}))

// Mock useBoards hook
vi.mock('@/hooks/useBoards', () => ({
  useBoards: () => ({
    activeBoard: { id: 'test-board', name: 'Test Project' },
  }),
}))

// Mock AuthProvider
vi.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', user_metadata: { full_name: 'Test User' } },
    signOut: vi.fn(),
  }),
}))

// Mock useMediaQuery
vi.mock('@/shared/lib/useMediaQuery', () => ({
  useIsMobile: () => false,
}))
