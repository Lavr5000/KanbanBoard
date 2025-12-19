import { Task, TaskStatus, Priority } from '@/shared/types/task';
import { createRealisticTask, SAMPLE_TAGS, SAMPLE_ASSIGNNIES } from './tasks-data';

// ===== EDGE CASES AND ERROR HANDLING TESTING FIXTURES =====

// Create tasks with invalid data for testing validation
export const createInvalidTaskDataset = (): Task[] => {
  return [
    // Task with invalid dates
    {
      id: 'task-invalid-dates-1',
      title: 'Invalid Date Task 1',
      description: 'Task with invalid month',
      status: 'todo' as TaskStatus,
      priority: 'medium' as Priority,
      startDate: '2025-13-01', // Invalid month
      dueDate: '2025-01-15',
      assignees: [SAMPLE_ASSIGNNIES[0]],
      tags: [],
      progress: 0,
    },
    {
      id: 'task-invalid-dates-2',
      title: 'Invalid Date Task 2',
      description: 'Task with invalid day',
      status: 'in-progress' as TaskStatus,
      priority: 'high' as Priority,
      startDate: '2025-02-30', // Invalid day for February
      dueDate: '2025-03-01',
      assignees: [SAMPLE_ASSIGNNIES[1]],
      tags: [SAMPLE_TAGS[0]],
      progress: 25,
    },
    {
      id: 'task-date-order',
      title: 'Wrong Date Order Task',
      description: 'Due date before start date',
      status: 'review' as TaskStatus,
      priority: 'urgent' as Priority,
      startDate: '2025-12-31',
      dueDate: '2025-01-01', // Before start date
      assignees: [SAMPLE_ASSIGNNIES[2]],
      tags: [SAMPLE_TAGS[1]],
      progress: 50,
    },
  ];
};

// Create tasks with invalid progress values
export const createInvalidProgressDataset = (): Task[] => {
  return [
    // @ts-ignore - intentionally invalid progress
    {
      id: 'task-progress-negative',
      title: 'Negative Progress Task',
      description: 'Task with negative progress',
      status: 'todo' as TaskStatus,
      priority: 'low' as Priority,
      startDate: '2025-01-01',
      dueDate: '2025-01-15',
      assignees: [SAMPLE_ASSIGNNIES[0]],
      tags: [],
      progress: -10, // Invalid negative progress
    },
    // @ts-ignore - intentionally invalid progress
    {
      id: 'task-progress-overflow',
      title: 'Overflow Progress Task',
      description: 'Task with progress over 100%',
      status: 'testing' as TaskStatus,
      priority: 'medium' as Priority,
      startDate: '2025-01-10',
      dueDate: '2025-01-20',
      assignees: [SAMPLE_ASSIGNNIES[1]],
      tags: [SAMPLE_TAGS[2]],
      progress: 150, // Invalid progress > 100
    },
    // @ts-ignore - intentionally invalid progress
    {
      id: 'task-progress-infinity',
      title: 'Infinite Progress Task',
      description: 'Task with infinite progress',
      status: 'done' as TaskStatus,
      priority: 'high' as Priority,
      startDate: '2025-01-05',
      dueDate: '2025-01-10',
      assignees: [SAMPLE_ASSIGNNIES[2]],
      tags: [SAMPLE_TAGS[3]],
      progress: Infinity, // Invalid infinite progress
    },
  ];
};

// Create tasks with invalid statuses and priorities
export const createInvalidStatusPriorityDataset = (): Task[] => {
  return [
    // @ts-ignore - intentionally invalid status
    {
      id: 'task-invalid-status',
      title: 'Invalid Status Task',
      description: 'Task with invalid status',
      status: 'invalid-status',
      priority: 'medium' as Priority,
      startDate: '2025-01-01',
      dueDate: '2025-01-15',
      assignees: [SAMPLE_ASSIGNNIES[0]],
      tags: [SAMPLE_TAGS[0]],
      progress: 25,
    },
    // @ts-ignore - intentionally invalid priority
    {
      id: 'task-invalid-priority',
      title: 'Invalid Priority Task',
      description: 'Task with invalid priority',
      status: 'todo' as TaskStatus,
      priority: 'invalid-priority',
      startDate: '2025-01-05',
      dueDate: '2025-01-20',
      assignees: [SAMPLE_ASSIGNNIES[1]],
      tags: [SAMPLE_TAGS[1]],
      progress: 50,
    },
    // @ts-ignore - both invalid
    {
      id: 'task-both-invalid',
      title: 'Double Invalid Task',
      description: 'Task with invalid status and priority',
      status: 'nonexistent',
      priority: 'ultra-high',
      startDate: '2025-01-10',
      dueDate: '2025-01-25',
      assignees: [SAMPLE_ASSIGNNIES[2]],
      tags: [SAMPLE_TAGS[2], SAMPLE_TAGS[3]],
      progress: 75,
    },
  ];
};

// Create tasks with problematic characters for XSS testing
export const createXSSRiskDataset = (): Task[] => {
  return [
    createRealisticTask({
      title: '<script>alert("XSS")</script>',
      description: 'Task with script tag in title',
      status: 'todo',
      priority: 'high',
      tags: [SAMPLE_TAGS[2]], // Bug
      assignees: [SAMPLE_ASSIGNNIES[0]],
    }),
    createRealisticTask({
      title: 'javascript:alert("XSS")',
      description: 'Task with JavaScript URL in title',
      status: 'in-progress',
      priority: 'urgent',
      tags: [SAMPLE_TAGS[9]], // Security
      assignees: [SAMPLE_ASSIGNNIES[1]],
    }),
    createRealisticTask({
      title: '<img src="x" onerror="alert(\'XSS\')">',
      description: 'Task with malicious image tag',
      status: 'review',
      priority: 'medium',
      tags: [SAMPLE_TAGS[2]], // Bug
      assignees: [SAMPLE_ASSIGNNIES[2]],
    }),
    createRealisticTask({
      title: '"><script>alert("XSS")</script>',
      description: 'Task with quote injection attempt',
      status: 'testing',
      priority: 'high',
      tags: [SAMPLE_TAGS[9]], // Security
      assignees: [SAMPLE_ASSIGNNIES[0], SAMPLE_ASSIGNNIES[1]],
    }),
    createRealisticTask({
      title: '<div onclick="alert(\'XSS\')">Click me</div>',
      description: 'Task with event handler injection',
      status: 'done',
      priority: 'low',
      tags: [SAMPLE_TAGS[2], SAMPLE_TAGS[9]], // Bug, Security
      assignees: [SAMPLE_ASSIGNNIES[3]],
    }),
  ];
};

// Create tasks with extremely long content
export const createExtremelyLongDataset = (): Task[] => {
  const veryLongTitle = 'A'.repeat(1000);
  const veryLongDescription = 'B'.repeat(10000);

  return [
    createRealisticTask({
      title: veryLongTitle,
      description: 'Task with extremely long title',
      status: 'todo',
      priority: 'medium',
      tags: [SAMPLE_TAGS[4]], // Documentation
      assignees: [SAMPLE_ASSIGNNIES[0]],
    }),
    createRealisticTask({
      title: 'Task with extremely long description',
      description: veryLongDescription,
      status: 'in-progress',
      priority: 'low',
      tags: [SAMPLE_TAGS[4]], // Documentation
      assignees: [SAMPLE_ASSIGNNIES[1]],
    }),
    createRealisticTask({
      title: 'Task with both extremely long title and description',
      description: veryLongDescription,
      status: 'review',
      priority: 'high',
      tags: [SAMPLE_TAGS[4]], // Documentation
      assignees: [SAMPLE_ASSIGNNIES[2]],
    }),
  ];
};

// Create tasks with Unicode and special characters
export const createUnicodeDataset = (): Task[] => {
  return [
    createRealisticTask({
      title: '🚀🎯💡🔥 Emoji Task',
      description: 'Task with various emojis',
      status: 'todo',
      priority: 'high',
      tags: [SAMPLE_TAGS[3]], // Feature
      assignees: [SAMPLE_ASSIGNNIES[0]],
    }),
    createRealisticTask({
      title: 'العربية Arabic Task',
      description: 'Task with Arabic text',
      status: 'in-progress',
      priority: 'medium',
      tags: [SAMPLE_TAGS[0]], // Frontend
      assignees: [SAMPLE_ASSIGNNIES[1]],
    }),
    createRealisticTask({
      title: 'עברית Hebrew Task',
      description: 'Task with Hebrew text',
      status: 'review',
      priority: 'low',
      tags: [SAMPLE_TAGS[1]], // Backend
      assignees: [SAMPLE_ASSIGNNIES[2]],
    }),
    createRealisticTask({
      title: '中文 Chinese Task',
      description: 'Task with Chinese characters',
      status: 'testing',
      priority: 'high',
      tags: [SAMPLE_TAGS[3]], // Feature
      assignees: [SAMPLE_ASSIGNNIES[0]],
    }),
    createRealisticTask({
      title: '日本語 Japanese Task',
      description: 'Task with Japanese characters',
      status: 'done',
      priority: 'medium',
      tags: [SAMPLE_TAGS[0]], // Frontend
      assignees: [SAMPLE_ASSIGNNIES[1]],
    }),
    createRealisticTask({
      title: '한국어 Korean Task',
      description: 'Task with Korean characters',
      status: 'todo',
      priority: 'urgent',
      tags: [SAMPLE_TAGS[1]], // Backend
      assignees: [SAMPLE_ASSIGNNIES[2]],
    }),
    createRealisticTask({
      title: '🇺🇸🇨🇦🇲🇽 Flag Emojis Task',
      description: 'Task with country flag emojis',
      status: 'in-progress',
      priority: 'low',
      tags: [SAMPLE_TAGS[3]], // Feature
      assignees: [SAMPLE_ASSIGNNIES[0]],
    }),
  ];
};

// Create tasks with null/undefined values for testing robustness
export const createNullUndefinedDataset = (): Task[] => {
  return [
    // @ts-ignore - intentionally testing null values
    {
      id: 'task-null-description',
      title: 'Task with null description',
      description: null,
      status: 'todo' as TaskStatus,
      priority: 'medium' as Priority,
      startDate: '2025-01-01',
      dueDate: '2025-01-15',
      assignees: [SAMPLE_ASSIGNNIES[0]],
      tags: [],
      progress: 0,
    },
    // @ts-ignore - intentionally testing undefined values
    {
      id: 'task-undefined-assignees',
      title: 'Task with undefined assignees',
      description: 'Task without assignees',
      status: 'in-progress' as TaskStatus,
      priority: 'high' as Priority,
      startDate: '2025-01-05',
      dueDate: '2025-01-20',
      assignees: undefined,
      tags: [SAMPLE_TAGS[0]],
      progress: 25,
    },
    // @ts-ignore - intentionally testing empty values
    {
      id: 'task-empty-tags',
      title: 'Task with empty tags',
      description: 'Task with undefined tags array',
      status: 'review' as TaskStatus,
      priority: 'low' as Priority,
      startDate: '2025-01-10',
      dueDate: '2025-01-25',
      assignees: [SAMPLE_ASSIGNNIES[1]],
      tags: undefined,
      progress: 50,
    },
  ];
};

// Error simulation helpers
export const ERROR_SCENARIOS = {
  localStorage: {
    corrupted: '{"invalid": "json", "corrupted": true}',
    incomplete: '{"incomplete": json',
    empty: '',
    null: null,
    oversized: 'x'.repeat(10 * 1024 * 1024), // 10MB
  },
  network: {
    timeout: 'Network timeout',
    offline: 'Network offline',
    serverError: 'Internal server error',
    rateLimit: 'Rate limit exceeded',
  },
  validation: {
    emptyTitle: '',
    longTitle: 'x'.repeat(10000),
    specialChars: '\0\r\n\t',
    unicodeComplex: '\u{1F1FA}\u{1F1F8}',
  },
  dates: {
    invalidMonth: '2025-13-01',
    invalidDay: '2025-02-30',
    invalidFormat: 'invalid-date',
    wrongOrder: { start: '2025-12-31', end: '2025-01-01' },
  },
  progress: {
    negative: -10,
    over100: 150,
    decimal: 25.7,
    infinity: Infinity,
    nan: NaN,
  },
};

// Mock error throwing functions
export const mockLocalStorageError = () => {
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = jest.fn(() => {
    throw new Error('localStorage quota exceeded');
  });
  return originalSetItem;
};

export const mockNetworkError = () => {
  const originalFetch = global.fetch;
  global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
  return originalFetch;
};

export const mockConsoleError = () => {
  const originalConsoleError = console.error;
  console.error = jest.fn();
  return originalConsoleError;
};

// Recovery testing helpers
export const testErrorRecovery = async (
  errorOperation: () => Promise<void>,
  recoveryOperation: () => Promise<void>,
  maxRetries: number = 3
): Promise<{ success: boolean; attempts: number; error?: Error }> => {
  let attempts = 0;
  let lastError: Error | undefined;

  while (attempts < maxRetries) {
    attempts++;
    try {
      await errorOperation();
      await recoveryOperation();
      return { success: true, attempts };
    } catch (error) {
      lastError = error as Error;
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 100 * attempts));
    }
  }

  return { success: false, attempts, error: lastError };
};

// Performance stress testing helpers
export const createMemoryStressDataset = (size: number = 1000): Task[] => {
  return Array.from({ length: size }, (_, index) => ({
    id: `memory-stress-${index}`,
    title: `Memory Stress Task ${index} - ${'x'.repeat(100)}`,
    description: `This is memory stress task number ${index}. ${'y'.repeat(1000)}`,
    status: 'todo' as TaskStatus,
    priority: 'medium' as Priority,
    startDate: '2025-01-01',
    dueDate: '2025-12-31',
    assignees: [SAMPLE_ASSIGNNIES[index % SAMPLE_ASSIGNNIES.length]],
    tags: Array.from({ length: 5 }, (_, i) => SAMPLE_TAGS[i % SAMPLE_TAGS.length]),
    progress: Math.floor(Math.random() * 101),
  }));
};

// Browser compatibility testing helpers
export const testMissingAPI = (apiName: string, originalValue: any) => {
  // @ts-ignore
  if (window[apiName]) {
    // @ts-ignore
    const temp = window[apiName];
    // @ts-ignore
    window[apiName] = originalValue;
    return temp;
  }
  return undefined;
};

// Data corruption simulation helpers
export const corruptTaskData = (task: Task): Task => {
  return {
    ...task,
    // Corrupt various fields randomly
    progress: Math.random() > 0.5 ? -1 : Math.random() > 0.5 ? 150 : task.progress,
    // @ts-ignore
    priority: Math.random() > 0.5 ? 'invalid-priority' : task.priority,
    // @ts-ignore
    status: Math.random() > 0.5 ? 'invalid-status' : task.status,
  };
};

// Export default for easy usage
export default {
  createInvalidTaskDataset,
  createInvalidProgressDataset,
  createInvalidStatusPriorityDataset,
  createXSSRiskDataset,
  createExtremelyLongDataset,
  createUnicodeDataset,
  createNullUndefinedDataset,
  ERROR_SCENARIOS,
  mockLocalStorageError,
  mockNetworkError,
  mockConsoleError,
  testErrorRecovery,
  createMemoryStressDataset,
  testMissingAPI,
  corruptTaskData,
};