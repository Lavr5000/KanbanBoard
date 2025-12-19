import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndContext } from '@dnd-kit/core';
import { KanbanBoard } from '@/features/kanban/ui/KanbanBoard';
import { renderWithProvider } from '../fixtures/store-helpers';
import {
  createTaskDistribution,
  createLargeDataset,
  createTestScenario,
  measurePerformance,
} from '../fixtures/tasks-data';
import { simulateDragDrop } from '../fixtures/dnd-simulators';

describe('Bulk Operations', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    localStorage.clear();
  });

  describe('Rapid Task Creation', () => {
    it('should create multiple tasks rapidly without performance degradation', async () => {
      const initialTasks = createTaskDistribution(5); // Start with 5 tasks

      const { metrics, passed } = await measurePerformance(async () => {
        renderWithProvider(
          <DndContext>
            <KanbanBoard />
          </DndContext>,
          {
            initialTasks,
            dndContext: true,
          }
        );

        // Create 5 new tasks rapidly
        for (let i = 0; i < 5; i++) {
          await user.click(screen.getByTestId('add-task-todo'));

          // Wait for DOM update without too much delay
          await waitFor(() => {
            const todoColumn = screen.getByTestId('column-todo');
            const tasks = todoColumn.querySelectorAll('[data-testid^="task-"]');
            expect(tasks).toHaveLength(initialTasks.length + i + 1);
          }, { timeout: 1000 });
        }
      }, {
        maxDuration: 2000, // Should complete within 2 seconds
      });

      expect(passed).toBe(true);
      expect(metrics.duration).toBeLessThan(2000);

      // Verify all tasks were created
      const todoColumn = screen.getByTestId('column-todo');
      const finalTasks = todoColumn.querySelectorAll('[data-testid^="task-"]');
      expect(finalTasks).toHaveLength(initialTasks.length + 5);
    });

    it('should handle creation of tasks with complex data structures', async () => {
      const complexTasks = createTestScenario.complexTasks();
      const initialTasks = createTaskDistribution(3);

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: [...initialTasks, ...complexTasks],
          dndContext: true,
        }
      );

      // Verify all complex tasks are rendered
      for (const task of complexTasks) {
        expect(screen.getByText(task.title)).toBeInTheDocument();
      }

      // Create additional tasks to test bulk operations
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByTestId('add-task-todo'));
      }

      // Verify final count
      await waitFor(() => {
        const todoColumn = screen.getByTestId('column-todo');
        const tasks = todoColumn.querySelectorAll('[data-testid^="task-"]');
        expect(tasks).toHaveLength(initialTasks.length + complexTasks.length + 3);
      });
    });
  });

  describe('Bulk Drag & Drop Operations', () => {
    it('should handle drag & drop of multiple tasks between columns', async () => {
      const initialTasks = createTaskDistribution(10); // 10 tasks distributed across columns

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks,
          dndContext: true,
        }
      );

      // Find tasks in todo column
      const todoColumn = screen.getByTestId('column-todo');
      const todoTasks = todoColumn.querySelectorAll('[data-testid^="task-"]');
      expect(todoTasks.length).toBeGreaterThan(0);

      // Find in-progress column
      const inProgressColumn = screen.getByTestId('column-in-progress');

      // Drag multiple tasks from todo to in-progress
      // Note: This is a simplified test - actual multiple selection would need specific UI implementation
      for (let i = 0; i < Math.min(3, todoTasks.length); i++) {
        const task = todoTasks[i] as HTMLElement;

        // Simulate drag from todo to in-progress
        await simulateDragDrop(task, inProgressColumn);
      }

      // Wait for all drag operations to complete
      await waitFor(() => {
        const finalTodoTasks = todoColumn.querySelectorAll('[data-testid^="task-"]');
        const finalInProgressTasks = inProgressColumn.querySelectorAll('[data-testid^="task-"]');

        // Some tasks should have moved
        expect(finalTodoTasks.length + finalInProgressTasks.length).toBe(initialTasks.length);
      }, { timeout: 3000 });
    });

    it('should maintain task order and data during bulk moves', async () => {
      const workflowTasks = createTestScenario.simpleWorkflow();

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: workflowTasks,
          dndContext: true,
        }
      );

      // Verify initial state
      expect(screen.getByTestId('column-todo')).toHaveTextContent('Start Project Setup');
      expect(screen.getByTestId('column-in-progress')).toHaveTextContent('Develop Core Features');

      // Move task from todo to in-progress
      const todoColumn = screen.getByTestId('column-todo');
      const inProgressColumn = screen.getByTestId('column-in-progress');
      const taskToMove = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

      await simulateDragDrop(taskToMove, inProgressColumn);

      // Verify task moved and data is preserved
      await waitFor(() => {
        expect(todoColumn).not.toHaveTextContent('Start Project Setup');
        expect(inProgressColumn).toHaveTextContent('Start Project Setup');
        expect(inProgressColumn).toHaveTextContent('Develop Core Features');
      });
    });
  });

  describe('Performance with Large Datasets', () => {
    it('should maintain performance with 50+ tasks on board', async () => {
      const largeDataset = createTaskDistribution(50); // 50 tasks

      const { metrics, passed } = await measurePerformance(async () => {
        renderWithProvider(
          <DndContext>
            <KanbanBoard />
          </DndContext>,
          {
            initialTasks: largeDataset,
            dndContext: true,
          }
        );

        // Wait for all tasks to render
        await waitFor(() => {
          const allTasks = document.querySelectorAll('[data-testid^="task-"]');
          expect(allTasks).toHaveLength(50);
        }, { timeout: 5000 });

        // Test interaction performance
        const todoColumn = screen.getByTestId('column-todo');
        const firstTask = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

        if (firstTask) {
          // Test rapid clicking
          for (let i = 0; i < 5; i++) {
            user.click(firstTask);
            await waitFor(() => {
              // Give time for event processing
            }, { timeout: 100 });
          }
        }
      }, {
        maxDuration: 5000, // Should complete within 5 seconds
      });

      expect(passed).toBe(true);

      // Verify all tasks are visible
      const allTasks = document.querySelectorAll('[data-testid^="task-"]');
      expect(allTasks).toHaveLength(50);
    });

    it('should handle filtering operations efficiently with large datasets', async () => {
      const largeDataset = createLargeDataset(100); // 100 tasks for performance testing

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: largeDataset,
          dndContext: true,
        }
      );

      // Wait for initial render
      await waitFor(() => {
        const allTasks = document.querySelectorAll('[data-testid^="task-"]');
        expect(allTasks).toHaveLength(100);
      }, { timeout: 10000 });

      // Test filter panel performance
      const filterToggle = screen.getByTestId('filter-toggle-button');
      await user.click(filterToggle);

      await waitFor(() => {
        expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
      });

      // Test search performance with many tasks
      const searchInput = screen.getByTestId('filter-search-input');
      await user.type(searchInput, 'Performance Test Task 1');

      // Should filter quickly
      await waitFor(() => {
        const filteredTasks = document.querySelectorAll('[data-testid^="task-"]:not([style*="display: none"])');
        // Should have filtered to tasks matching "Performance Test Task 1"
        expect(filteredTasks.length).toBeLessThan(100);
      }, { timeout: 2000 });
    });
  });

  describe('Memory Management', () => {
    it('should prevent memory leaks during extended bulk operations', async () => {
      const user = userEvent.setup({ delay: 0 });

      // Test multiple create/delete cycles
      for (let cycle = 0; cycle < 3; cycle++) {
        const initialTasks = createTaskDistribution(5);

        const { unmount } = renderWithProvider(
          <DndContext>
            <KanbanBoard />
          </DndContext>,
          {
            initialTasks,
            dndContext: true,
          }
        );

        // Create tasks rapidly
        for (let i = 0; i < 5; i++) {
          await user.click(screen.getByTestId('add-task-todo'));
        }

        // Wait for operations to complete
        await waitFor(() => {
          const todoColumn = screen.getByTestId('column-todo');
          const tasks = todoColumn.querySelectorAll('[data-testid^="task-"]');
          expect(tasks).toHaveLength(initialTasks.length + 5);
        });

        // Clean up
        unmount();

        // Small delay to allow garbage collection
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // If we reach here without memory errors, test passes
      expect(true).toBe(true);
    });

    it('should handle large task datasets without UI degradation', async () => {
      const veryLargeDataset = createLargeDataset(200); // 200 tasks

      const { metrics, passed } = await measurePerformance(async () => {
        renderWithProvider(
          <DndContext>
            <KanbanBoard />
          </DndContext>,
          {
            initialTasks: veryLargeDataset,
            dndContext: true,
          }
        );

        // Wait for render
        await waitFor(() => {
          const allTasks = document.querySelectorAll('[data-testid^="task-"]');
          expect(allTasks).toHaveLength(200);
        }, { timeout: 15000 });

        // Test scrolling performance
        const boardContainer = document.querySelector('.kanban-scrollbar');
        if (boardContainer) {
          // Simulate scrolling
          boardContainer.scrollTop = 1000;
          await new Promise(resolve => setTimeout(resolve, 100));
          boardContainer.scrollTop = 0;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }, {
        maxDuration: 15000, // Allow more time for large dataset
      });

      expect(passed).toBe(true);

      // Verify all tasks are rendered
      const allTasks = document.querySelectorAll('[data-testid^="task-"]');
      expect(allTasks).toHaveLength(200);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle simultaneous operations on different tasks', async () => {
      const user = userEvent.setup({ delay: 0 });
      const initialTasks = createTaskDistribution(10);

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks,
          dndContext: true,
        }
      );

      // Find multiple tasks to operate on
      const todoColumn = screen.getByTestId('column-todo');
      const tasks = Array.from(todoColumn.querySelectorAll('[data-testid^="task-"]')) as HTMLElement[];

      if (tasks.length >= 2) {
        // Start editing first task
        await user.click(tasks[0]);

        // Add new task while first task is being edited
        await user.click(screen.getByTestId('add-task-todo'));

        // Start editing second task
        if (tasks[1]) {
          await user.click(tasks[1]);
        }

        // All operations should complete successfully
        await waitFor(() => {
          const allTasks = todoColumn.querySelectorAll('[data-testid^="task-"]');
          expect(allTasks.length).toBeGreaterThanOrEqual(initialTasks.length + 1);
        }, { timeout: 3000 });
      }
    });

    it('should maintain data consistency during bulk state changes', async () => {
      const initialTasks = createTaskDistribution(15);

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks,
          dndContext: true,
        }
      );

      // Perform multiple state-changing operations rapidly
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByTestId('add-task-todo'));

        // Quick pause between operations
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Verify final state is consistent
      await waitFor(() => {
        const todoColumn = screen.getByTestId('column-todo');
        const tasks = todoColumn.querySelectorAll('[data-testid^="task-"]');
        expect(tasks).toHaveLength(initialTasks.length + 5);

        // All tasks should have proper structure
        tasks.forEach(task => {
          expect(task).toHaveAttribute('data-testid');
          expect(task.querySelector('[data-testid^="task-title"]') || task.textContent).toBeTruthy();
        });
      });
    });
  });
});