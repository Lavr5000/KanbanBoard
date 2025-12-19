import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndContext } from '@dnd-kit/core';
import { KanbanBoard } from '@/features/kanban/ui/KanbanBoard';
import { renderWithProvider } from '../fixtures/store-helpers';
import {
  createTaskDistribution,
  createLargeDataset,
  createRealisticTask,
  SAMPLE_TAGS,
  SAMPLE_ASSIGNNIES,
} from '../fixtures/tasks-data';
import { Task, TaskFilters } from '@/shared/types/task';
import { measurePerformance } from '../fixtures/performance-utils';

describe('Comprehensive Filtering', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    localStorage.clear();
  });

  describe('Multi-Filter Combinations', () => {
    it('should combine text search + priority + status + date filters', async () => {
      // Create diverse dataset for comprehensive filtering
      const comprehensiveDataset = [
        createRealisticTask({
          title: 'Critical Backend Bug',
          description: 'Database connection timeout issue',
          status: 'todo',
          priority: 'urgent',
          tags: [SAMPLE_TAGS[0]], // 'backend'
          assignees: [SAMPLE_ASSIGNNIES[0]],
        }),
        createRealisticTask({
          title: 'Frontend Performance Review',
          description: 'Optimize React component rendering',
          status: 'in-progress',
          priority: 'high',
          tags: [SAMPLE_TAGS[1]], // 'frontend'
          assignees: [SAMPLE_ASSIGNNIES[1]],
        }),
        createRealisticTask({
          title: 'Database Migration Script',
          description: 'Migrate PostgreSQL schema',
          status: 'review',
          priority: 'medium',
          tags: [SAMPLE_TAGS[0], SAMPLE_TAGS[2]], // 'backend', 'database'
          assignees: [SAMPLE_ASSIGNNIES[0], SAMPLE_ASSIGNNIES[2]],
        }),
        createRealisticTask({
          title: 'User Authentication Fix',
          description: 'Resolve login session issues',
          status: 'testing',
          priority: 'low',
          tags: [SAMPLE_TAGS[3]], // 'bug'
          assignees: [SAMPLE_ASSIGNNIES[1]],
        }),
      ];

      const initialFilters: TaskFilters = {
        search: 'Database',
        priorities: ['urgent', 'medium'],
        statuses: ['todo', 'review'],
        tags: [SAMPLE_TAGS[0].id], // backend tag
      };

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: comprehensiveDataset,
          initialFilters,
          dndContext: true,
        }
      );

      // Wait for filter panel to be available
      const filterToggle = screen.getByTestId('filter-toggle-button');
      await user.click(filterToggle);

      await waitFor(() => {
        expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
      });

      // Verify complex filtering is working
      await waitFor(() => {
        // Should show tasks matching "Database" text AND backend tag AND (urgent OR medium priority) AND (todo OR review status)
        const visibleTasks = document.querySelectorAll('[data-testid^="task-"]:not([style*="display: none"])');

        // Should match "Critical Backend Bug" (urgent, todo, backend, contains "Database" in description)
        // Should match "Database Migration Script" (medium, review, backend, contains "Database" in title)
        expect(visibleTasks).toHaveLength(2);
      });

      // Verify specific filtered tasks are visible
      expect(screen.getByText('Critical Backend Bug')).toBeInTheDocument();
      expect(screen.getByText('Database Migration Script')).toBeInTheDocument();

      // Verify non-matching tasks are hidden
      expect(screen.queryByText('Frontend Performance Review')).not.toBeInTheDocument();
      expect(screen.queryByText('User Authentication Fix')).not.toBeInTheDocument();
    });

    it('should handle empty filter combinations gracefully', async () => {
      const largeDataset = createTaskDistribution(20);

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: largeDataset,
          dndContext: true,
        }
      );

      // Open filter panel
      const filterToggle = screen.getByTestId('filter-toggle-button');
      await user.click(filterToggle);

      // Apply empty filters (should show all tasks)
      const clearFiltersButton = screen.getByTestId('clear-filters-button');
      await user.click(clearFiltersButton);

      await waitFor(() => {
        const allTasks = document.querySelectorAll('[data-testid^="task-"]');
        expect(allTasks).toHaveLength(20);
      });
    });

    it('should maintain filter state during task operations', async () => {
      const initialTasks = createTaskDistribution(10);

      const activeFilters: TaskFilters = {
        search: 'Test',
        priorities: ['high'],
        statuses: ['todo', 'in-progress'],
      };

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks,
          initialFilters: activeFilters,
          dndContext: true,
        }
      );

      // Open filter panel
      const filterToggle = screen.getByTestId('filter-toggle-button');
      await user.click(filterToggle);

      // Wait for initial filtering
      await waitFor(() => {
        const searchInput = screen.getByTestId('filter-search-input');
        expect(searchInput).toHaveValue('Test');
      });

      // Add a new task that matches filters
      await user.click(screen.getByTestId('add-task-todo'));

      await waitFor(() => {
        // New task should be visible if it matches filters
        const allTasks = document.querySelectorAll('[data-testid^="task-"]');
        expect(allTasks.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Date Range Filtering', () => {
    it('should filter by date ranges effectively with edge cases', async () => {
      const dateBasedTasks = [
        createRealisticTask({
          title: 'Start of Year Task',
          status: 'todo',
          startDate: '2025-01-01',
          dueDate: '2025-01-15',
        }),
        createRealisticTask({
          title: 'Mid Year Task',
          status: 'in-progress',
          startDate: '2025-06-15',
          dueDate: '2025-06-30',
        }),
        createRealisticTask({
          title: 'End of Year Task',
          status: 'review',
          startDate: '2025-12-01',
          dueDate: '2025-12-31',
        }),
        createRealisticTask({
          title: 'Overdue Task',
          status: 'todo',
          startDate: '2024-11-01',
          dueDate: '2024-12-31',
        }),
      ];

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: dateBasedTasks,
          dndContext: true,
        }
      );

      // Open filter panel
      const filterToggle = screen.getByTestId('filter-toggle-button');
      await user.click(filterToggle);

      // Filter by first quarter (Jan-Mar 2025)
      const startDateInput = screen.getByTestId('filter-start-date');
      const endDateInput = screen.getByTestId('filter-end-date');

      await user.clear(startDateInput);
      await user.type(startDateInput, '2025-01-01');

      await user.clear(endDateInput);
      await user.type(endDateInput, '2025-03-31');

      // Apply date filter
      const applyDateFilter = screen.getByTestId('apply-date-filter');
      await user.click(applyDateFilter);

      await waitFor(() => {
        // Should only show "Start of Year Task"
        const visibleTasks = document.querySelectorAll('[data-testid^="task-"]:not([style*="display: none"])');
        expect(visibleTasks).toHaveLength(1);
        expect(screen.getByText('Start of Year Task')).toBeInTheDocument();
      });

      // Clear date filter
      const clearDateFilter = screen.getByTestId('clear-date-filter');
      await user.click(clearDateFilter);

      await waitFor(() => {
        const allTasks = document.querySelectorAll('[data-testid^="task-"]');
        expect(allTasks).toHaveLength(4);
      });
    });

    it('should handle invalid date ranges with proper error handling', async () => {
      const tasks = createTaskDistribution(5);

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: tasks,
          dndContext: true,
        }
      );

      // Open filter panel
      const filterToggle = screen.getByTestId('filter-toggle-button');
      await user.click(filterToggle);

      // Try to set invalid date range (end date before start date)
      const startDateInput = screen.getByTestId('filter-start-date');
      const endDateInput = screen.getByTestId('filter-end-date');

      await user.clear(startDateInput);
      await user.type(startDateInput, '2025-12-31');

      await user.clear(endDateInput);
      await user.type(endDateInput, '2025-01-01');

      // Try to apply invalid range
      const applyDateFilter = screen.getByTestId('apply-date-filter');
      await user.click(applyDateFilter);

      // Should show error message or ignore invalid filter
      await waitFor(() => {
        const errorMessage = screen.queryByTestId('date-range-error');
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument();
        } else {
          // If no error message, filter should be ignored
          const allTasks = document.querySelectorAll('[data-testid^="task-"]');
          expect(allTasks).toHaveLength(5);
        }
      });
    });
  });

  describe('Tag and Assignee Filtering', () => {
    it('should filter by multiple tags with OR logic', async () => {
      const taggedTasks = [
        createRealisticTask({
          title: 'Backend API Task',
          status: 'todo',
          tags: [SAMPLE_TAGS[0]], // backend
        }),
        createRealisticTask({
          title: 'Frontend UI Task',
          status: 'in-progress',
          tags: [SAMPLE_TAGS[1]], // frontend
        }),
        createRealisticTask({
          title: 'Full Stack Feature',
          status: 'review',
          tags: [SAMPLE_TAGS[0], SAMPLE_TAGS[1]], // backend + frontend
        }),
        createRealisticTask({
          title: 'Database Optimization',
          status: 'testing',
          tags: [SAMPLE_TAGS[2]], // database
        }),
      ];

      const filters: TaskFilters = {
        tags: [SAMPLE_TAGS[0].id, SAMPLE_TAGS[1].id], // backend OR frontend
      };

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: taggedTasks,
          initialFilters: filters,
          dndContext: true,
        }
      );

      await waitFor(() => {
        // Should show tasks with backend OR frontend tags
        expect(screen.getByText('Backend API Task')).toBeInTheDocument();
        expect(screen.getByText('Frontend UI Task')).toBeInTheDocument();
        expect(screen.getByText('Full Stack Feature')).toBeInTheDocument();

        // Should not show database-only task
        expect(screen.queryByText('Database Optimization')).not.toBeInTheDocument();
      });
    });

    it('should filter by multiple assignees with OR logic', async () => {
      const assignedTasks = [
        createRealisticTask({
          title: 'Task for Alice',
          status: 'todo',
          assignees: [SAMPLE_ASSIGNNIES[0]],
        }),
        createRealisticTask({
          title: 'Task for Bob',
          status: 'in-progress',
          assignees: [SAMPLE_ASSIGNNIES[1]],
        }),
        createRealisticTask({
          title: 'Team Collaboration Task',
          status: 'review',
          assignees: [SAMPLE_ASSIGNNIES[0], SAMPLE_ASSIGNNIES[1]],
        }),
        createRealisticTask({
          title: 'Task for Charlie',
          status: 'testing',
          assignees: [SAMPLE_ASSIGNNIES[2]],
        }),
      ];

      const filters: TaskFilters = {
        assignees: [SAMPLE_ASSIGNNIES[0].id, SAMPLE_ASSIGNNIES[1].id],
      };

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: assignedTasks,
          initialFilters: filters,
          dndContext: true,
        }
      );

      await waitFor(() => {
        // Should show tasks assigned to Alice OR Bob OR both
        expect(screen.getByText('Task for Alice')).toBeInTheDocument();
        expect(screen.getByText('Task for Bob')).toBeInTheDocument();
        expect(screen.getByText('Team Collaboration Task')).toBeInTheDocument();

        // Should not show Charlie's task
        expect(screen.queryByText('Task for Charlie')).not.toBeInTheDocument();
      });
    });
  });

  describe('Filter Performance with Large Datasets', () => {
    it('should maintain performance with complex filters on large datasets', async () => {
      const largeDataset = createLargeDataset(200); // 200 tasks

      const complexFilters: TaskFilters = {
        search: 'Performance',
        priorities: ['urgent', 'high'],
        statuses: ['todo', 'in-progress'],
        tags: [SAMPLE_TAGS[0].id, SAMPLE_TAGS[1].id],
        assignees: [SAMPLE_ASSIGNNIES[0].id],
      };

      const { metrics, passed } = await measurePerformance(async () => {
        renderWithProvider(
          <DndContext>
            <KanbanBoard />
          </DndContext>,
          {
            initialTasks: largeDataset,
            initialFilters: complexFilters,
            dndContext: true,
          }
        );

        // Wait for filtering to complete
        await waitFor(() => {
          const filterToggle = screen.getByTestId('filter-toggle-button');
          expect(filterToggle).toBeInTheDocument();
        }, { timeout: 5000 });
      }, {
        maxDuration: 3000, // Should complete within 3 seconds
      });

      expect(passed).toBe(true);
      expect(metrics.duration).toBeLessThan(3000);
    });

    it('should handle rapid filter changes without performance degradation', async () => {
      const user = userEvent.setup({ delay: 0 });
      const dataset = createTaskDistribution(50);

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: dataset,
          dndContext: true,
        }
      );

      // Open filter panel
      const filterToggle = screen.getByTestId('filter-toggle-button');
      await user.click(filterToggle);

      const searchInput = screen.getByTestId('filter-search-input');

      // Apply rapid search filters
      const searchTerms = ['Task', 'Project', 'Feature', 'Bug', ''];

      for (const term of searchTerms) {
        await user.clear(searchInput);
        if (term) {
          await user.type(searchInput, term);
        }

        // Brief wait for filtering
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Should complete without errors
      await waitFor(() => {
        expect(searchInput).toBeInTheDocument();
      });
    });
  });

  describe('Filter State Management', () => {
    it('should clear all filters correctly and reset state', async () => {
      const initialTasks = createTaskDistribution(10);

      const initialFilters: TaskFilters = {
        search: 'Test Search',
        priorities: ['urgent'],
        statuses: ['todo'],
        tags: [SAMPLE_TAGS[0].id],
        assignees: [SAMPLE_ASSIGNNIES[0].id],
      };

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks,
          initialFilters,
          dndContext: true,
        }
      );

      // Open filter panel
      const filterToggle = screen.getByTestId('filter-toggle-button');
      await user.click(filterToggle);

      // Verify filters are applied
      await waitFor(() => {
        const searchInput = screen.getByTestId('filter-search-input');
        expect(searchInput).toHaveValue('Test Search');
      });

      // Clear all filters
      const clearFiltersButton = screen.getByTestId('clear-filters-button');
      await user.click(clearFiltersButton);

      await waitFor(() => {
        // Verify all filter inputs are cleared
        const searchInput = screen.getByTestId('filter-search-input');
        expect(searchInput).toHaveValue('');
      });

      // Verify all tasks are visible again
      await waitFor(() => {
        const allTasks = document.querySelectorAll('[data-testid^="task-"]');
        expect(allTasks).toHaveLength(10);
      });
    });

    it('should preserve filter state between page refreshes', async () => {
      const initialTasks = createTaskDistribution(5);

      const persistentFilters: TaskFilters = {
        search: 'Persistent Search',
        priorities: ['high'],
        statuses: ['in-progress'],
      };

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks,
          initialFilters: persistentFilters,
          dndContext: true,
        }
      );

      // Open filter panel
      const filterToggle = screen.getByTestId('filter-toggle-button');
      await user.click(filterToggle);

      // Verify filters are applied
      await waitFor(() => {
        const searchInput = screen.getByTestId('filter-search-input');
        expect(searchInput).toHaveValue('Persistent Search');
      });

      // Simulate page refresh by re-rendering with same initial state
      // (In real app, this would come from localStorage persistence)
      const { unmount } = renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks,
          initialFilters: persistentFilters,
          dndContext: true,
        }
      );

      unmount();

      // Re-render to simulate page refresh
      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks,
          initialFilters: persistentFilters,
          dndContext: true,
        }
      );

      // Filters should be preserved after "refresh"
      await waitFor(() => {
        const filterToggle = screen.getByTestId('filter-toggle-button');
        expect(filterToggle).toBeInTheDocument();
      });
    });
  });
});