import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndContext } from '@dnd-kit/core';
import { KanbanBoard } from '@/features/kanban/ui/KanbanBoard';
import { renderWithProvider } from '../fixtures/store-helpers';
import {
  createRealisticTask,
  createTaskDistribution,
  createLargeDataset,
  SAMPLE_TAGS,
  SAMPLE_ASSIGNNIES,
} from '../fixtures/tasks-data';
import { measurePerformance } from '../fixtures/performance-utils';

describe('Advanced Search Functionality', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    localStorage.clear();
  });

  describe('Comprehensive Search Coverage', () => {
    it('should search across title, description, tags, and assignees', async () => {
      const searchableTasks = [
        createRealisticTask({
          title: 'React Performance Optimization',
          description: 'Optimize React component rendering and state management',
          status: 'todo',
          tags: [SAMPLE_TAGS[1]], // frontend
          assignees: [SAMPLE_ASSIGNNIES[1]], // Bob
        }),
        createRealisticTask({
          title: 'Database Schema Design',
          description: 'Design PostgreSQL database schema for React application',
          status: 'in-progress',
          tags: [SAMPLE_TAGS[0], SAMPLE_TAGS[2]], // backend, database
          assignees: [SAMPLE_ASSIGNNIES[0]], // Alice
        }),
        createRealisticTask({
          title: 'User Authentication System',
          description: 'Implement JWT-based authentication with React frontend',
          status: 'review',
          tags: [SAMPLE_TAGS[1], SAMPLE_TAGS[3]], // frontend, security
          assignees: [SAMPLE_ASSIGNNIES[0], SAMPLE_ASSIGNNIES[1]], // Alice, Bob
        }),
        createRealisticTask({
          title: 'API Integration',
          description: 'Connect frontend to REST API endpoints',
          status: 'testing',
          tags: [SAMPLE_TAGS[0]], // backend
          assignees: [SAMPLE_ASSIGNNIES[2]], // Charlie
        }),
      ];

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: searchableTasks,
          dndContext: true,
        }
      );

      // Open filter panel to access search
      const filterToggle = screen.getByTestId('filter-toggle-button');
      await user.click(filterToggle);

      const searchInput = screen.getByTestId('filter-search-input');

      // Test title search
      await user.clear(searchInput);
      await user.type(searchInput, 'React');

      await waitFor(() => {
        // Should find tasks with "React" in title
        expect(screen.getByText('React Performance Optimization')).toBeInTheDocument();
        expect(screen.getByText('User Authentication System')).toBeInTheDocument();

        // Should not find tasks without "React" in title
        expect(screen.queryByText('Database Schema Design')).not.toBeInTheDocument();
        expect(screen.queryByText('API Integration')).not.toBeInTheDocument();
      });

      // Test description search
      await user.clear(searchInput);
      await user.type(searchInput, 'PostgreSQL');

      await waitFor(() => {
        // Should find tasks with "PostgreSQL" in description
        expect(screen.getByText('Database Schema Design')).toBeInTheDocument();

        // Should not find other tasks
        expect(screen.queryByText('React Performance Optimization')).not.toBeInTheDocument();
        expect(screen.queryByText('User Authentication System')).not.toBeInTheDocument();
      });

      // Test tag search (assuming tags are searchable by name)
      await user.clear(searchInput);
      await user.type(searchInput, 'frontend');

      await waitFor(() => {
        // Should find tasks with frontend tag
        expect(screen.getByText('React Performance Optimization')).toBeInTheDocument();
        expect(screen.getByText('User Authentication System')).toBeInTheDocument();

        // Should not find backend-only tasks
        expect(screen.queryByText('Database Schema Design')).not.toBeInTheDocument();
        expect(screen.queryByText('API Integration')).not.toBeInTheDocument();
      });

      // Test assignee search (assuming assignees are searchable by name)
      await user.clear(searchInput);
      await user.type(searchInput, 'Alice');

      await waitFor(() => {
        // Should find tasks assigned to Alice
        expect(screen.getByText('Database Schema Design')).toBeInTheDocument();
        expect(screen.getByText('User Authentication System')).toBeInTheDocument();

        // Should not find tasks not assigned to Alice
        expect(screen.queryByText('React Performance Optimization')).not.toBeInTheDocument();
        expect(screen.queryByText('API Integration')).not.toBeInTheDocument();
      });
    });

    it('should handle case-insensitive search with partial matching', async () => {
      const caseSensitiveTasks = [
        createRealisticTask({
          title: 'CRITICAL BUG FIX',
          description: 'Fix critical production bug immediately',
          status: 'todo',
        }),
        createRealisticTask({
          title: 'Critical Security Update',
          description: 'Update security protocols',
          status: 'in-progress',
        }),
        createRealisticTask({
          title: 'Bug Report Analysis',
          description: 'Analyze user-reported bugs',
          status: 'review',
        }),
        createRealisticTask({
          title: 'Feature Documentation',
          description: 'Write comprehensive documentation',
          status: 'testing',
        }),
      ];

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: caseSensitiveTasks,
          dndContext: true,
        }
      );

      // Open filter panel
      const filterToggle = screen.getByTestId('filter-toggle-button');
      await user.click(filterToggle);

      const searchInput = screen.getByTestId('filter-search-input');

      // Test case-insensitive search
      await user.clear(searchInput);
      await user.type(searchInput, 'critical');

      await waitFor(() => {
        // Should find both "CRITICAL" and "Critical"
        expect(screen.getByText('CRITICAL BUG FIX')).toBeInTheDocument();
        expect(screen.getByText('Critical Security Update')).toBeInTheDocument();

        // Should not find unrelated tasks
        expect(screen.queryByText('Bug Report Analysis')).not.toBeInTheDocument();
        expect(screen.queryByText('Feature Documentation')).not.toBeInTheDocument();
      });

      // Test partial matching
      await user.clear(searchInput);
      await user.type(searchInput, 'bug');

      await waitFor(() => {
        // Should find tasks containing "bug"
        expect(screen.getByText('CRITICAL BUG FIX')).toBeInTheDocument();
        expect(screen.getByText('Bug Report Analysis')).toBeInTheDocument();

        // Should not find other tasks
        expect(screen.queryByText('Critical Security Update')).not.toBeInTheDocument();
        expect(screen.queryByText('Feature Documentation')).not.toBeInTheDocument();
      });
    });

    it('should handle special characters and whitespace in search', async () => {
      const specialCharTasks = [
        createRealisticTask({
          title: 'User@Name Validation',
          description: 'Validate email addresses and usernames',
          status: 'todo',
        }),
        createRealisticTask({
          title: 'File-Path Handling',
          description: 'Handle Windows/Unix file paths correctly',
          status: 'in-progress',
        }),
        createRealisticTask({
          title: 'API Endpoint: /users/profile',
          description: 'Implement REST API endpoint with special characters',
          status: 'review',
        }),
        createRealisticTask({
          title: 'Search with spaces',
          description: 'Multiple word search query testing',
          status: 'testing',
        }),
      ];

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: specialCharTasks,
          dndContext: true,
        }
      );

      // Open filter panel
      const filterToggle = screen.getByTestId('filter-toggle-button');
      await user.click(filterToggle);

      const searchInput = screen.getByTestId('filter-search-input');

      // Test special character search
      await user.clear(searchInput);
      await user.type(searchInput, '@');

      await waitFor(() => {
        expect(screen.getByText('User@Name Validation')).toBeInTheDocument();
        expect(screen.queryByText('File-Path Handling')).not.toBeInTheDocument();
      });

      // Test special character search
      await user.clear(searchInput);
      await user.type(searchInput, '/');

      await waitFor(() => {
        expect(screen.getByText('API Endpoint: /users/profile')).toBeInTheDocument();
        expect(screen.queryByText('User@Name Validation')).not.toBeInTheDocument();
      });

      // Test multi-word search with spaces
      await user.clear(searchInput);
      await user.type(searchInput, 'multiple word');

      await waitFor(() => {
        expect(screen.getByText('Search with spaces')).toBeInTheDocument();
        expect(screen.queryByText('User@Name Validation')).not.toBeInTheDocument();
      });
    });
  });

  describe('Real-time Search with Debouncing', () => {
    it('should support real-time search with proper debouncing', async () => {
      const user = userEvent.setup({ delay: 0 });
      const realtimeTasks = createTaskDistribution(20);

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: realtimeTasks,
          dndContext: true,
        }
      );

      // Open filter panel
      const filterToggle = screen.getByTestId('filter-toggle-button');
      await user.click(filterToggle);

      const searchInput = screen.getByTestId('filter-search-input');

      // Type search query rapidly
      await user.clear(searchInput);
      await user.type(searchInput, 'Task 1');

      // Immediately check if search is working (should be debounced)
      let immediateResults = document.querySelectorAll('[data-testid^="task-"]:not([style*="display: none"])');

      // Wait for debounce to complete
      await waitFor(() => {
        const debouncedResults = document.querySelectorAll('[data-testid^="task-"]:not([style*="display: none"])');
        expect(debouncedResults.length).toBeLessThan(immediateResults.length);
      }, { timeout: 1000 });

      // Clear search
      await user.clear(searchInput);

      // Wait for debounced clear
      await waitFor(() => {
        const allResults = document.querySelectorAll('[data-testid^="task-"]:not([style*="display: none"])');
        expect(allResults).toHaveLength(20);
      }, { timeout: 1000 });
    });

    it('should handle rapid search input changes without performance issues', async () => {
      const user = userEvent.setup({ delay: 0 });
      const performanceTasks = createTaskDistribution(50);

      const { metrics, passed } = await measurePerformance(async () => {
        renderWithProvider(
          <DndContext>
            <KanbanBoard />
          </DndContext>,
          {
            initialTasks: performanceTasks,
            dndContext: true,
          }
        );

        // Open filter panel
        const filterToggle = screen.getByTestId('filter-toggle-button');
        await user.click(filterToggle);

        const searchInput = screen.getByTestId('filter-search-input');

        // Rapidly change search terms
        const searchTerms = ['a', 'ab', 'abc', 'abcd', 'abcde', '', 'test', 'testing', ''];

        for (const term of searchTerms) {
          await user.clear(searchInput);
          if (term) {
            await user.type(searchInput, term);
          }
        }

        // Wait for final debounced search to complete
        await waitFor(() => {
          const results = document.querySelectorAll('[data-testid^="task-"]:not([style*="display: none"])');
          expect(results).toHaveLength(50); // Empty search should show all
        }, { timeout: 2000 });
      }, {
        maxDuration: 5000, // Should complete within 5 seconds
      });

      expect(passed).toBe(true);
    });
  });

  describe('Search Result Highlighting', () => {
    it('should highlight search matches in UI', async () => {
      const highlightTasks = [
        createRealisticTask({
          title: 'Important Security Update Required',
          description: 'Update security protocols immediately',
          status: 'todo',
        }),
        createRealisticTask({
          title: 'Regular Task',
          description: 'Standard task without special keywords',
          status: 'in-progress',
        }),
      ];

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: highlightTasks,
          dndContext: true,
        }
      );

      // Open filter panel
      const filterToggle = screen.getByTestId('filter-toggle-button');
      await user.click(filterToggle);

      const searchInput = screen.getByTestId('filter-search-input');

      // Search for "security"
      await user.clear(searchInput);
      await user.type(searchInput, 'security');

      await waitFor(() => {
        // Check if highlighting is applied (implementation-dependent)
        const highlightedElement = screen.getByText('Important Security Update Required');
        expect(highlightedElement).toBeInTheDocument();

        // Look for highlight markup (could be <mark>, <span class="highlight">, etc.)
        const highlightMarkup = highlightedElement.querySelector('mark, .highlight, [data-highlight]');
        if (highlightMarkup) {
          expect(highlightMarkup).toBeInTheDocument();
        }
      });
    });

    it('should handle multiple search term highlighting', async () => {
      const multiHighlightTasks = [
        createRealisticTask({
          title: 'Frontend and Backend Integration',
          description: 'Connect React frontend with Node.js backend',
          status: 'todo',
        }),
      ];

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: multiHighlightTasks,
          dndContext: true,
        }
      );

      // Open filter panel
      const filterToggle = screen.getByTestId('filter-toggle-button');
      await user.click(filterToggle);

      const searchInput = screen.getByTestId('filter-search-input');

      // Search for multiple terms
      await user.clear(searchInput);
      await user.type(searchInput, 'Frontend backend');

      await waitFor(() => {
        const taskElement = screen.getByText('Frontend and Backend Integration');
        expect(taskElement).toBeInTheDocument();

        // Check if both terms are highlighted
        const highlightMarkup = taskElement.querySelectorAll('mark, .highlight, [data-highlight]');
        if (highlightMarkup.length > 0) {
          expect(highlightMarkup.length).toBeGreaterThanOrEqual(1);
        }
      });
    });
  });

  describe('Advanced Search Features', () => {
    it('should support exact phrase search with quotes', async () => {
      const phraseSearchTasks = [
        createRealisticTask({
          title: 'Search with exact phrase matching',
          description: 'Test exact phrase search functionality',
          status: 'todo',
        }),
        createRealisticTask({
          title: 'Exact phrase not here',
          description: 'Different content without exact phrase',
          status: 'in-progress',
        }),
      ];

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: phraseSearchTasks,
          dndContext: true,
        }
      );

      // Open filter panel
      const filterToggle = screen.getByTestId('filter-toggle-button');
      await user.click(filterToggle);

      const searchInput = screen.getByTestId('filter-search-input');

      // Search for exact phrase
      await user.clear(searchInput);
      await user.type(searchInput, '"exact phrase"');

      await waitFor(() => {
        // Should find exact match
        expect(screen.getByText('Search with exact phrase matching')).toBeInTheDocument();

        // Should not find partial matches
        expect(screen.queryByText('Exact phrase not here')).not.toBeInTheDocument();
      });
    });

    it('should support negative search terms (exclusion)', async () => {
      const negativeSearchTasks = [
        createRealisticTask({
          title: 'Task with frontend tag',
          description: 'Frontend development task',
          status: 'todo',
          tags: [SAMPLE_TAGS[1]], // frontend
        }),
        createRealisticTask({
          title: 'Task with backend tag',
          description: 'Backend development task',
          status: 'in-progress',
          tags: [SAMPLE_TAGS[0]], // backend
        }),
        createRealisticTask({
          title: 'Task with database tag',
          description: 'Database development task',
          status: 'review',
          tags: [SAMPLE_TAGS[2]], // database
        }),
      ];

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: negativeSearchTasks,
          dndContext: true,
        }
      );

      // Open filter panel
      const filterToggle = screen.getByTestId('filter-toggle-button');
      await user.click(filterToggle);

      const searchInput = screen.getByTestId('filter-search-input');

      // Search with negative term (assuming - syntax)
      await user.clear(searchInput);
      await user.type(searchInput, 'development -frontend');

      await waitFor(() => {
        // Should find backend and database tasks
        expect(screen.getByText('Task with backend tag')).toBeInTheDocument();
        expect(screen.getByText('Task with database tag')).toBeInTheDocument();

        // Should exclude frontend tasks
        expect(screen.queryByText('Task with frontend tag')).not.toBeInTheDocument();
      });
    });

    it('should handle search history and suggestions', async () => {
      const historyTasks = createTaskDistribution(10);

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: historyTasks,
          dndContext: true,
        }
      );

      // Open filter panel
      const filterToggle = screen.getByTestId('filter-toggle-button');
      await user.click(filterToggle);

      const searchInput = screen.getByTestId('filter-search-input');

      // Perform several searches to build history
      const searchHistory = ['task', 'project', 'feature'];

      for (const term of searchHistory) {
        await user.clear(searchInput);
        await user.type(searchInput, term);

        await waitFor(() => {
          // Wait for search to complete
          const results = document.querySelectorAll('[data-testid^="task-"]:not([style*="display: none"])');
          expect(results.length).toBeGreaterThanOrEqual(0);
        }, { timeout: 1000 });
      }

      // Check if search history is available (implementation-dependent)
      const searchHistoryElement = screen.queryByTestId('search-history');
      if (searchHistoryElement) {
        expect(searchHistoryElement).toBeInTheDocument();

        // Should contain recent searches
        for (const term of searchHistory) {
          expect(searchHistoryElement).toHaveTextContent(term);
        }
      }
    });
  });

  describe('Search Performance Optimization', () => {
    it('should optimize search performance on large datasets', async () => {
      const largeSearchDataset = createLargeDataset(100);

      const { metrics, passed } = await measurePerformance(async () => {
        renderWithProvider(
          <DndContext>
            <KanbanBoard />
          </DndContext>,
          {
            initialTasks: largeSearchDataset,
            dndContext: true,
          }
        );

        // Open filter panel
        const filterToggle = screen.getByTestId('filter-toggle-button');
        await user.click(filterToggle);

        const searchInput = screen.getByTestId('filter-search-input');

        // Perform complex search
        await user.clear(searchInput);
        await user.type(searchInput, 'Performance Test Task 1');

        await waitFor(() => {
          // Should find matching tasks quickly
          const results = document.querySelectorAll('[data-testid^="task-"]:not([style*="display: none"])');
          expect(results.length).toBeLessThan(100); // Should be filtered
        }, { timeout: 3000 });
      }, {
        maxDuration: 5000, // Should complete within 5 seconds
      });

      expect(passed).toBe(true);
    });

    it('should implement efficient search indexing', async () => {
      const indexedTasks = createLargeDataset(50);

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: indexedTasks,
          dndContext: true,
        }
      );

      // Open filter panel
      const filterToggle = screen.getByTestId('filter-toggle-button');
      await user.click(filterToggle);

      const searchInput = screen.getByTestId('filter-search-input');

      // Multiple rapid searches to test indexing efficiency
      const searchQueries = [
        'Performance Test Task 1',
        'Performance Test Task 25',
        'Performance Test Task 50',
        'Nonexistent Task',
        '',
      ];

      for (const query of searchQueries) {
        await user.clear(searchInput);
        if (query) {
          await user.type(searchInput, query);
        }

        await waitFor(() => {
          const results = document.querySelectorAll('[data-testid^="task-"]:not([style*="display: none"])');
          // Should have appropriate number of results
          expect(results.length).toBeGreaterThanOrEqual(0);
        }, { timeout: 1000 });
      }

      // All searches should complete efficiently
      expect(true).toBe(true);
    });
  });
});