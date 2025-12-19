import { faker } from '@faker-js/faker';
import { Task, TaskStatus, Priority, Assignee, Tag } from '@/shared/types/task';

// Constants for realistic task generation
export const TASK_STATUSES: TaskStatus[] = ['todo', 'in-progress', 'review', 'testing', 'done'];
export const PRIORITIES: Priority[] = ['urgent', 'high', 'medium', 'low'];

export const SAMPLE_ASSIGNNIES: Assignee[] = [
  { id: 'user-1', name: 'Alice Johnson', color: '#3B82F6' },
  { id: 'user-2', name: 'Bob Smith', color: '#10B981' },
  { id: 'user-3', name: 'Carol Davis', color: '#F59E0B' },
  { id: 'user-4', name: 'David Wilson', color: '#EF4444' },
  { id: 'user-5', name: 'Emma Brown', color: '#8B5CF6' },
  { id: 'user-6', name: 'Frank Miller', color: '#EC4899' },
  { id: 'user-7', name: 'Grace Taylor', color: '#14B8A6' },
  { id: 'user-8', name: 'Henry Anderson', color: '#F97316' },
];

export const SAMPLE_TAGS: Tag[] = [
  { id: 'tag-1', name: 'Frontend', color: '#3B82F6' },
  { id: 'tag-2', name: 'Backend', color: '#10B981' },
  { id: 'tag-3', name: 'Bug', color: '#EF4444' },
  { id: 'tag-4', name: 'Feature', color: '#8B5CF6' },
  { id: 'tag-5', name: 'Documentation', color: '#6B7280' },
  { id: 'tag-6', name: 'Testing', color: '#F59E0B' },
  { id: 'tag-7', name: 'UI/UX', color: '#EC4899' },
  { id: 'tag-8', name: 'Database', color: '#14B8A6' },
  { id: 'tag-9', name: 'API', color: '#F97316' },
  { id: 'tag-10', name: 'Security', color: '#DC2626' },
  { id: 'tag-11', name: 'Performance', color: '#7C3AED' },
  { id: 'tag-12', name: 'Refactoring', color: '#059669' },
];

// Helper functions for generating realistic data
export const createRandomAssignees = (min: number = 1, max: number = 3): Assignee[] => {
  const count = faker.datatype.number({ min, max });
  return faker.helpers.arrayElements(SAMPLE_ASSIGNNIES, count);
};

export const createRandomTags = (min: number = 0, max: number = 5): Tag[] => {
  const count = faker.datatype.number({ min, max });
  return faker.helpers.arrayElements(SAMPLE_TAGS, count);
};

export const generateRealisticDates = () => {
  const startDate = faker.date.recent({ days: 30 });
  const duration = faker.datatype.number({ min: 1, max: 30 });
  const dueDate = new Date(startDate);
  dueDate.setDate(dueDate.getDate() + duration);

  return {
    startDate: startDate.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
  };
};

export const createRealisticTask = (overrides?: Partial<Task>): Task => {
  const dates = generateRealisticDates();
  const assignees = createRandomAssignees();
  const tags = createRandomTags();

  // Generate realistic task titles based on tags
  const titleOptions = [
    'Fix critical bug in authentication system',
    'Implement new user dashboard',
    'Optimize database queries for performance',
    'Add responsive design for mobile devices',
    'Write comprehensive API documentation',
    'Set up CI/CD pipeline',
    'Review pull requests from team members',
    'Conduct security audit',
    'Refactor legacy codebase',
    'Implement real-time notifications',
    'Add unit tests for core functionality',
    'Optimize images and assets loading',
    'Design new landing page',
    'Implement search functionality',
    'Add data export feature',
  ];

  // If tags are provided, try to create relevant titles
  let title = faker.helpers.arrayElement(titleOptions);
  if (tags.length > 0) {
    const tagNames = tags.map(t => t.name).join(', ');
    title = `${faker.helpers.arrayElement(titleOptions)} (${tagNames})`;
  }

  // Generate realistic descriptions
  const descriptionTemplates = [
    `This task involves ${faker.lorem.sentences(2).toLowerCase()}`,
    `Complete implementation of ${faker.lorem.words(2).toLowerCase()} with proper error handling`,
    `Review and update ${faker.lorem.words(3).toLowerCase()} to meet current requirements`,
    `Fix reported issues with ${faker.lorem.words(2).toLowerCase()} functionality`,
    `Optimize ${faker.lorem.words(2).toLowerCase()} for better performance and user experience`,
  ];

  const progress = faker.datatype.number({ min: 0, max: 100 });

  return {
    id: `task-${faker.datatype.uuid()}`,
    title,
    description: faker.helpers.arrayElement(descriptionTemplates),
    status: faker.helpers.arrayElement(TASK_STATUSES),
    priority: faker.helpers.arrayElement(PRIORITIES),
    startDate: dates.startDate,
    dueDate: dates.dueDate,
    assignees,
    tags,
    progress,
    ...overrides,
  };
};

// Create tasks with specific characteristics for testing
export const createTaskInStatus = (status: TaskStatus, overrides?: Partial<Task>): Task => {
  return createRealisticTask({ status, ...overrides });
};

export const createTaskWithPriority = (priority: Priority, overrides?: Partial<Task>): Task => {
  return createRealisticTask({ priority, ...overrides });
};

export const createTaskWithProgress = (progress: number, overrides?: Partial<Task>): Task => {
  return createRealisticTask({ progress, ...overrides });
};

// Create multiple tasks with different distributions
export const createTaskDistribution = (
  totalTasks: number = 20,
  statusDistribution?: Partial<Record<TaskStatus, number>>
): Task[] => {
  const defaultDistribution = {
    todo: Math.floor(totalTasks * 0.4),
    'in-progress': Math.floor(totalTasks * 0.25),
    review: Math.floor(totalTasks * 0.15),
    testing: Math.floor(totalTasks * 0.1),
    done: Math.floor(totalTasks * 0.1),
  };

  const distribution = { ...defaultDistribution, ...statusDistribution };
  const tasks: Task[] = [];

  Object.entries(distribution).forEach(([status, count]) => {
    for (let i = 0; i < count; i++) {
      tasks.push(createTaskInStatus(status as TaskStatus));
    }
  });

  // Fill remaining tasks if total doesn't match
  while (tasks.length < totalTasks) {
    tasks.push(createRealisticTask());
  }

  return tasks.slice(0, totalTasks);
};

// Create specific test scenarios
export const createTestScenario = {
  // Simple workflow from todo to done
  simpleWorkflow: (): Task[] => [
    createTaskInStatus('todo', {
      title: 'Start Project Setup',
      progress: 0
    }),
    createTaskInStatus('in-progress', {
      title: 'Develop Core Features',
      progress: 60
    }),
    createTaskInStatus('review', {
      title: 'Review Implementation',
      progress: 80
    }),
    createTaskInStatus('testing', {
      title: 'Test User Acceptance',
      progress: 90
    }),
    createTaskInStatus('done', {
      title: 'Deploy to Production',
      progress: 100
    }),
  ],

  // High priority urgent tasks
  urgentTasks: (): Task[] => [
    createTaskWithPriority('urgent', {
      title: 'Critical Security Fix',
      status: 'todo',
      progress: 0
    }),
    createTaskWithPriority('urgent', {
      title: 'Production Bug Fix',
      status: 'in-progress',
      progress: 30
    }),
    createTaskWithPriority('high', {
      title: 'Client Deadline Feature',
      status: 'review',
      progress: 85
    }),
  ],

  // Tasks with multiple assignees
  collaborativeTasks: (): Task[] => [
    createRealisticTask({
      title: 'Team Collaboration Project',
      assignees: createRandomAssignees(3, 5),
      status: 'in-progress',
      progress: 50
    }),
    createRealisticTask({
      title: 'Cross-Team Integration',
      assignees: createRandomAssignees(2, 4),
      status: 'testing',
      progress: 75
    }),
  ],

  // Complex tasks with many tags
  complexTasks: (): Task[] => [
    createRealisticTask({
      title: 'Comprehensive System Overhaul',
      tags: createRandomTags(4, 8),
      status: 'todo',
      progress: 0,
      priority: 'high'
    }),
    createRealisticTask({
      title: 'Multi-Feature Release',
      tags: createRandomTags(3, 6),
      status: 'in-progress',
      progress: 65
    }),
  ],

  // Tasks across different date ranges
  dateRangeTasks: (): Task[] => {
    const now = new Date();
    const past = new Date(now);
    past.setDate(past.getDate() - 10);
    const future = new Date(now);
    future.setDate(future.getDate() + 10);
    const farFuture = new Date(now);
    farFuture.setDate(farFuture.getDate() + 30);

    return [
      createRealisticTask({
        title: 'Overdue Task',
        startDate: past.toISOString().split('T')[0],
        dueDate: now.toISOString().split('T')[0],
        status: 'in-progress',
        progress: 70
      }),
      createRealisticTask({
        title: 'Due Soon Task',
        startDate: now.toISOString().split('T')[0],
        dueDate: future.toISOString().split('T')[0],
        status: 'review',
        progress: 85
      }),
      createRealisticTask({
        title: 'Future Task',
        startDate: future.toISOString().split('T')[0],
        dueDate: farFuture.toISOString().split('T')[0],
        status: 'todo',
        progress: 0
      }),
    ];
  },
};

// Helper for creating empty initial state
export const createEmptyState = (): Task[] => [];

// Helper for creating a large dataset for performance testing
export const createLargeDataset = (count: number = 100): Task[] => {
  return Array.from({ length: count }, (_, index) =>
    createRealisticTask({
      title: `Performance Test Task ${index + 1}`,
      description: `This is task number ${index + 1} created for performance testing purposes. ${faker.lorem.sentences(2)}`,
      progress: faker.datatype.number({ min: 0, max: 100 })
    })
  );
};

// ===== FILTERING AND SEARCH TESTING FIXTURES =====

// Create tasks specifically designed for comprehensive filter testing
export const createFilterTestDataset = (): Task[] => {
  return [
    // Tasks with different combinations for multi-filter testing
    createRealisticTask({
      title: 'Critical Backend Bug',
      description: 'Database connection timeout issue needs immediate attention',
      status: 'todo',
      priority: 'urgent',
      tags: [SAMPLE_TAGS[1]], // Backend
      assignees: [SAMPLE_ASSIGNNIES[0]], // Alice
      startDate: '2025-01-01',
      dueDate: '2025-01-15',
    }),
    createRealisticTask({
      title: 'Frontend Performance Review',
      description: 'Optimize React component rendering and state management',
      status: 'in-progress',
      priority: 'high',
      tags: [SAMPLE_TAGS[0]], // Frontend
      assignees: [SAMPLE_ASSIGNNIES[1]], // Bob
      startDate: '2025-01-10',
      dueDate: '2025-01-25',
    }),
    createRealisticTask({
      title: 'Database Migration Script',
      description: 'Migrate PostgreSQL schema to version 2.0',
      status: 'review',
      priority: 'medium',
      tags: [SAMPLE_TAGS[1], SAMPLE_TAGS[7]], // Backend, Database
      assignees: [SAMPLE_ASSIGNNIES[0], SAMPLE_ASSIGNNIES[2]], // Alice, Charlie
      startDate: '2025-01-15',
      dueDate: '2025-01-30',
    }),
    createRealisticTask({
      title: 'User Authentication Fix',
      description: 'Resolve login session timeout and security issues',
      status: 'testing',
      priority: 'low',
      tags: [SAMPLE_TAGS[2], SAMPLE_TAGS[9]], // Bug, Security
      assignees: [SAMPLE_ASSIGNNIES[1]], // Bob
      startDate: '2025-01-20',
      dueDate: '2025-02-05',
    }),
    createRealisticTask({
      title: 'Mobile App Development',
      description: 'Develop React Native mobile application',
      status: 'todo',
      priority: 'high',
      tags: [SAMPLE_TAGS[0], SAMPLE_TAGS[6]], // Frontend, UI/UX
      assignees: [SAMPLE_ASSIGNNIES[2]], // Charlie
      startDate: '2025-02-01',
      dueDate: '2025-02-20',
    }),
    createRealisticTask({
      title: 'API Documentation',
      description: 'Write comprehensive API documentation with examples',
      status: 'in-progress',
      priority: 'medium',
      tags: [SAMPLE_TAGS[4], SAMPLE_TAGS[8]], // Documentation, API
      assignees: [SAMPLE_ASSIGNNIES[3]], // David
      startDate: '2025-02-05',
      dueDate: '2025-02-25',
    }),
  ];
};

// Create tasks for advanced search testing
export const createSearchTestDataset = (): Task[] => {
  const searchTerms = [
    'React Performance Optimization',
    'Database Schema Design',
    'User Authentication System',
    'API Integration Testing',
    'Frontend Bug Fixes',
    'Backend Security Audit',
    'Mobile Development',
    'Documentation Writing',
    'Code Review Process',
    'Deployment Automation',
  ];

  return searchTerms.map((term, index) =>
    createRealisticTask({
      title: term,
      description: `This task involves ${term.toLowerCase()} and requires careful implementation`,
      status: TASK_STATUSES[index % TASK_STATUSES.length],
      priority: PRIORITIES[index % PRIORITIES.length],
      tags: [SAMPLE_TAGS[index % SAMPLE_TAGS.length]],
      assignees: [SAMPLE_ASSIGNNIES[index % SAMPLE_ASSIGNNIES.length]],
    })
  );
};

// Create tasks for testing special characters and case sensitivity
export const createSpecialCharTestDataset = (): Task[] => {
  return [
    createRealisticTask({
      title: 'CRITICAL BUG FIX',
      description: 'Fix critical production bug immediately',
      status: 'todo',
      priority: 'urgent',
    }),
    createRealisticTask({
      title: 'Critical Security Update',
      description: 'Update security protocols and patch vulnerabilities',
      status: 'in-progress',
      priority: 'high',
    }),
    createRealisticTask({
      title: 'User@Name Validation',
      description: 'Validate email addresses and username formats',
      status: 'review',
      priority: 'medium',
    }),
    createRealisticTask({
      title: 'File-Path Handling',
      description: 'Handle Windows/Unix file paths correctly',
      status: 'testing',
      priority: 'low',
    }),
    createRealisticTask({
      title: 'API Endpoint: /users/profile',
      description: 'Implement REST API endpoint with special characters',
      status: 'todo',
      priority: 'medium',
    }),
    createRealisticTask({
      title: 'Search with spaces',
      description: 'Multiple word search query testing',
      status: 'in-progress',
      priority: 'low',
    }),
  ];
};

// Create tasks with specific date ranges for date filter testing
export const createDateRangeTestDataset = (): Task[] => {
  return [
    createRealisticTask({
      title: 'Start of Year Task',
      description: 'Q1 planning and setup',
      status: 'todo',
      startDate: '2025-01-01',
      dueDate: '2025-01-15',
    }),
    createRealisticTask({
      title: 'Mid Year Task',
      description: 'Mid-year review and adjustments',
      status: 'in-progress',
      startDate: '2025-06-15',
      dueDate: '2025-06-30',
    }),
    createRealisticTask({
      title: 'End of Year Task',
      description: 'Year-end reports and summaries',
      status: 'review',
      startDate: '2025-12-01',
      dueDate: '2025-12-31',
    }),
    createRealisticTask({
      title: 'Overdue Task',
      description: 'Task that should have been completed',
      status: 'todo',
      startDate: '2024-11-01',
      dueDate: '2024-12-31',
    }),
    createRealisticTask({
      title: 'Future Planning Task',
      description: 'Planning for next quarter',
      status: 'todo',
      startDate: '2025-03-01',
      dueDate: '2025-03-31',
    }),
  ];
};

// Performance testing helpers for filtering
export const createFilterPerformanceDataset = (size: number = 1000): Task[] => {
  return Array.from({ length: size }, (_, index) => {
    const searchContent = `Performance Test Task ${index + 1}`;
    const hasMultipleTags = index % 3 === 0;
    const hasMultipleAssignees = index % 4 === 0;

    return createRealisticTask({
      title: searchContent,
      description: `This is performance test task number ${index + 1} with searchable content`,
      status: TASK_STATUSES[index % TASK_STATUSES.length],
      priority: PRIORITIES[index % PRIORITIES.length],
      tags: hasMultipleTags
        ? [SAMPLE_TAGS[index % SAMPLE_TAGS.length], SAMPLE_TAGS[(index + 1) % SAMPLE_TAGS.length]]
        : [SAMPLE_TAGS[index % SAMPLE_TAGS.length]],
      assignees: hasMultipleAssignees
        ? [SAMPLE_ASSIGNNIES[index % SAMPLE_ASSIGNNIES.length], SAMPLE_ASSIGNNIES[(index + 1) % SAMPLE_ASSIGNNIES.length]]
        : [SAMPLE_ASSIGNNIES[index % SAMPLE_ASSIGNNIES.length]],
    });
  });
};

// Search term variations for testing different search scenarios
export const SEARCH_TEST_SCENARIOS = {
  // Exact matches
  exactMatches: ['React', 'Database', 'API', 'Security'],

  // Partial matches
  partialMatches: ['perf', 'task', 'dev', 'test'],

  // Case variations
  caseVariations: ['REACT', 'react', 'React', 'rEaCt'],

  // Multi-word searches
  multiWord: [
    'React Performance',
    'Database Design',
    'API Integration',
    'User Authentication',
  ],

  // Special characters
  specialChars: ['@', '#', '-', '/', '_', '.'],

  // Phrases with quotes (for exact phrase testing)
  exactPhrases: [
    '"critical bug"',
    '"performance optimization"',
    '"user interface"',
  ],

  // Negative searches
  negativeSearches: [
    'frontend -bug',
    'backend -urgent',
    'api -documentation',
  ],
};

// Filter combinations for testing complex filter scenarios
export const FILTER_COMBINATIONS = {
  // Basic single filters
  singleFilters: [
    { search: 'React' },
    { priorities: ['urgent'] },
    { statuses: ['todo'] },
    { tags: [SAMPLE_TAGS[0].id] },
    { assignees: [SAMPLE_ASSIGNNIES[0].id] },
  ],

  // Complex multi-filters
  complexFilters: [
    {
      search: 'React',
      priorities: ['urgent', 'high'],
      statuses: ['todo', 'in-progress'],
      tags: [SAMPLE_TAGS[0].id],
      assignees: [SAMPLE_ASSIGNNIES[0].id, SAMPLE_ASSIGNNIES[1].id],
    },
    {
      search: 'Database',
      priorities: ['medium'],
      statuses: ['review', 'testing'],
      tags: [SAMPLE_TAGS[1].id, SAMPLE_TAGS[7].id],
    },
  ],

  // Edge case filters
  edgeCases: [
    { search: '' }, // Empty search
    { priorities: [] }, // Empty priorities
    { statuses: ['nonexistent'] }, // Invalid status
    { tags: ['invalid-tag-id'] }, // Invalid tag
  ],
};

// Helper function to measure filter performance
export const measureFilterPerformance = async (
  filterFunction: () => Promise<void>,
  maxDuration: number = 1000
) => {
  const start = performance.now();
  await filterFunction();
  const duration = performance.now() - start;

  return {
    duration,
    passed: duration < maxDuration,
    threshold: maxDuration,
  };
};

// Create mock filter scenarios for comprehensive testing
export const createMockFilterScenarios = () => {
  return {
    // Scenario 1: User searching for high-priority frontend tasks
    frontendHighPriority: {
      filters: {
        priorities: ['urgent', 'high'],
        tags: [SAMPLE_TAGS[0].id], // Frontend
      },
      expectedResults: 'Tasks with frontend tag and high/urgent priority',
    },

    // Scenario 2: Manager viewing tasks assigned to specific team members
    teamMemberTasks: {
      filters: {
        assignees: [SAMPLE_ASSIGNNIES[0].id, SAMPLE_ASSIGNNIES[1].id], // Alice, Bob
        statuses: ['todo', 'in-progress'],
      },
      expectedResults: 'Tasks assigned to Alice or Bob that are not completed',
    },

    // Scenario 3: Developer searching for bug fixes
    bugFixes: {
      filters: {
        search: 'bug fix',
        tags: [SAMPLE_TAGS[2].id], // Bug
        priorities: ['urgent', 'high'],
      },
      expectedResults: 'High-priority bug fix tasks',
    },

    // Scenario 4: Date-based filtering for sprint planning
    sprintPlanning: {
      filters: {
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        statuses: ['todo'],
      },
      expectedResults: 'Todo tasks scheduled for January 2025',
    },
  };
};

// Export default function for quick usage
export default createRealisticTask;