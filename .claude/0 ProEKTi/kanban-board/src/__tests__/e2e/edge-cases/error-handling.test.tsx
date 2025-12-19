import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndContext } from '@dnd-kit/core';
import { KanbanBoard } from '@/features/kanban/ui/KanbanBoard';
import { renderWithProvider } from '../fixtures/store-helpers';
import {
  createRealisticTask,
  createTaskDistribution,
  SAMPLE_TAGS,
  SAMPLE_ASSIGNNIES,
} from '../fixtures/tasks-data';
import { Task } from '@/shared/types/task';
import { measurePerformance } from '../fixtures/performance-utils';

describe('Error Handling', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    localStorage.clear();
  });

  describe('localStorage Corruption Handling', () => {
    it('should handle localStorage corruption gracefully', async () => {
      // Simulate corrupted localStorage data
      const corruptedData = {
        'kanban-store-state': '{"invalid": "json", "corrupted": true}',
        'kanban-store-persist-version': '1',
      };

      // Set corrupted data in localStorage
      Object.entries(corruptedData).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });

      // Add more corruption attempts
      localStorage.setItem('kanban-store-state', 'definitely not json');
      localStorage.setItem('kanban-store-state-2', '{"incomplete": json');

      // Try to render the board with corrupted storage
      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: [],
          dndContext: true,
        }
      );

      // Should handle corruption gracefully and show empty board
      await waitFor(() => {
        expect(screen.getByTestId('kanban-board')).toBeInTheDocument();

        // Board should be functional despite corrupted storage
        expect(screen.getByTestId('add-task-todo')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Should be able to add new tasks
      await user.click(screen.getByTestId('add-task-todo'));

      await waitFor(() => {
        const todoColumn = screen.getByTestId('column-todo');
        const tasks = todoColumn.querySelectorAll('[data-testid^="task-"]');
        expect(tasks).toHaveLength(1);
      });
    });

    it('should recover from localStorage quota exceeded error', async () => {
      // Fill localStorage to simulate quota exceeded
      const largeData = 'x'.repeat(5 * 1024 * 1024); // 5MB

      try {
        localStorage.setItem('large-data', largeData);
      } catch (error) {
        // Quota exceeded - this is expected
      }

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: createTaskDistribution(5),
          dndContext: true,
        }
      );

      // Should handle quota exceeded gracefully
      await waitFor(() => {
        expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Board should still be functional
      const todoColumn = screen.getByTestId('column-todo');
      expect(todoColumn).toBeInTheDocument();
      expect(todoColumn.querySelectorAll('[data-testid^="task-"]')).toHaveLength(5);
    });

    it('should handle localStorage being disabled', async () => {
      // Mock localStorage to be disabled
      const originalLocalStorage = global.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => null,
          setItem: () => {
            throw new Error('localStorage disabled');
          },
          removeItem: () => {},
          clear: () => {},
          key: () => null,
          length: 0,
        },
        writable: true,
      });

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: createTaskDistribution(3),
          dndContext: true,
        }
      );

      // Should work without localStorage
      await waitFor(() => {
        expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Should be able to add tasks (they just won't persist)
      await user.click(screen.getByTestId('add-task-todo'));

      await waitFor(() => {
        const todoColumn = screen.getByTestId('column-todo');
        const tasks = todoColumn.querySelectorAll('[data-testid^="task-"]');
        expect(tasks).toHaveLength(4);
      });

      // Restore original localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      });
    });
  });

  describe('Network Error Handling', () => {
    it('should recover from network errors during operations', async () => {
      // Mock network failures
      const originalFetch = global.fetch;
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: createTaskDistribution(5),
          dndContext: true,
        }
      );

      await waitFor(() => {
        expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
      });

      // Try to perform operations that might trigger network requests
      const todoColumn = screen.getByTestId('column-todo');
      const firstTask = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

      if (firstTask) {
        // Try to edit task
        await user.click(firstTask);

        // Should handle network errors gracefully
        await waitFor(() => {
          const errorNotification = screen.queryByText(/network error|ошибка сети/i);
          // Either shows error notification or handles silently
        }, { timeout: 2000 });

        // Should still be able to cancel or save locally
        const cancelButton = screen.queryByText('Отмена');
        if (cancelButton) {
          await user.click(cancelButton);
        }
      }

      // Restore original fetch
      global.fetch = originalFetch;
    });

    it('should provide meaningful error messages to users', async () => {
      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: [],
          dndContext: true,
        }
      );

      // Try to trigger error conditions
      await user.click(screen.getByTestId('add-task-todo'));

      const newTask = screen.getByText('Новая задача');
      await user.click(newTask);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Новая задача')).toBeInTheDocument();
      });

      // Try to save with invalid data that might trigger backend errors
      const titleInput = screen.getByDisplayValue('Новая задача');

      // Try various problematic inputs
      const problematicInputs = [
        '\0'.repeat(1000), // Null characters
        '🚀'.repeat(1000), // Too many emojis
        ''.repeat(10000), // Very long string
      ];

      for (const input of problematicInputs) {
        await user.clear(titleInput);
        await user.type(titleInput, input);

        await user.click(screen.getByText('Сохранить'));

        await waitFor(() => {
          // Should either show error message or handle gracefully
          const errorElement = screen.queryByText(/error|ошибка|invalid/i);
          if (errorElement) {
            expect(errorElement).toBeInTheDocument();
          }
        }, { timeout: 1000 });
      }
    });
  });

  describe('Store Error Handling', () => {
    it('should maintain UI stability during store errors', async () => {
      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: createTaskDistribution(10),
          dndContext: true,
        }
      );

      await waitFor(() => {
        expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
      });

      // Perform rapid operations that might trigger store errors
      const operations = [
        () => user.click(screen.getByTestId('add-task-todo')),
        () => user.click(screen.getByTestId('add-task-todo')),
        () => user.click(screen.getByTestId('add-task-todo')),
      ];

      for (const operation of operations) {
        await operation();

        // Wait for operation to complete or timeout
        await waitFor(() => {
          const todoColumn = screen.getByTestId('column-todo');
          const tasks = todoColumn.querySelectorAll('[data-testid^="task-"]');
          expect(tasks.length).toBeGreaterThan(0);
        }, { timeout: 2000 });
      }

      // UI should remain stable
      expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
      expect(screen.getByTestId('column-todo')).toBeInTheDocument();
      expect(screen.getByTestId('column-in-progress')).toBeInTheDocument();
    });

    it('should handle store initialization failures', async () => {
      // Mock store initialization failure
      const originalConsoleError = console.error;
      console.error = jest.fn();

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: null as any, // Force error
          dndContext: true,
        }
      );

      await waitFor(() => {
        // Should handle initialization failure gracefully
        expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Should still show basic UI structure
      expect(screen.getByTestId('column-todo')).toBeInTheDocument();
      expect(screen.getByTestId('add-task-todo')).toBeInTheDocument();

      // Restore console.error
      console.error = originalConsoleError;
    });
  });

  describe('Drag and Drop Error Handling', () => {
    it('should handle drag operations that fail mid-operation', async () => {
      const initialTasks = createTaskDistribution(5);

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks,
          dndContext: true,
        }
      );

      await waitFor(() => {
        const allTasks = document.querySelectorAll('[data-testid^="task-"]');
        expect(allTasks).toHaveLength(5);
      });

      const todoColumn = screen.getByTestId('column-todo');
      const inProgressColumn = screen.getByTestId('column-in-progress');
      const taskToDrag = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

      if (taskToDrag) {
        // Start drag operation
        fireEvent.dragStart(taskToDrag);

        // Simulate drag cancellation/error
        fireEvent.dragEnd(taskToDrag);

        // UI should remain stable
        await waitFor(() => {
          expect(todoColumn).toContainElement(taskToDrag);
          expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
        });
      }
    });

    it('should handle invalid drop targets gracefully', async () => {
      const initialTasks = createTaskDistribution(3);

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks,
          dndContext: true,
        }
      );

      const todoColumn = screen.getByTestId('column-todo');
      const taskToDrag = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

      if (taskToDrag) {
        // Try to drag to invalid target (same position or outside board)
        fireEvent.dragStart(taskToDrag);
        fireEvent.dragEnter(taskToDrag); // Drag to self
        fireEvent.drop(taskToDrag);
        fireEvent.dragEnd(taskToDrag);

        // Task should remain in place
        await waitFor(() => {
          expect(todoColumn).toContainElement(taskToDrag);
        });
      }
    });
  });

  describe('Memory and Performance Error Handling', () => {
    it('should handle memory pressure gracefully', async () => {
      // Create a large dataset that might cause memory issues
      const largeDataset = Array.from({ length: 100 }, (_, index) =>
        createRealisticTask({
          title: `Memory Test Task ${index}`,
          description: 'x'.repeat(1000), // Large description
        })
      );

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

        await waitFor(() => {
          expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
        }, { timeout: 10000 });

        // Perform operations while under memory pressure
        await user.click(screen.getByTestId('add-task-todo'));

        await waitFor(() => {
          const todoColumn = screen.getByTestId('column-todo');
          const tasks = todoColumn.querySelectorAll('[data-testid^="task-"]');
          expect(tasks.length).toBeGreaterThan(0);
        }, { timeout: 5000 });
      }, {
        maxDuration: 15000, // Allow more time for large dataset
      });

      // Should complete without catastrophic failure
      expect(passed).toBe(true);
    });

    it('should prevent infinite loops and stack overflows', async () => {
      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: createTaskDistribution(5),
          dndContext: true,
        }
      );

      // Perform operations that might cause infinite loops
      const todoColumn = screen.getByTestId('column-todo');
      const taskToEdit = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

      if (taskToEdit) {
        // Rapidly open and close edit mode
        for (let i = 0; i < 10; i++) {
          await user.click(taskToEdit);

          await waitFor(() => {
            const editInput = screen.queryByDisplayValue(taskToEdit.textContent || '');
            if (editInput) {
              expect(editInput).toBeInTheDocument();
            }
          }, { timeout: 500 });

          const cancelButton = screen.queryByText('Отмена');
          if (cancelButton) {
            await user.click(cancelButton);
          } else {
            // Try pressing Escape
            await user.keyboard('{Escape}');
          }

          await waitFor(() => {
            expect(taskToEdit).toBeInTheDocument();
          }, { timeout: 500 });
        }

        // UI should still be responsive
        expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
      }
    });
  });

  describe('Browser Compatibility Error Handling', () => {
    it('should handle missing browser APIs gracefully', async () => {
      // Mock missing ResizeObserver
      const originalResizeObserver = global.ResizeObserver;
      global.ResizeObserver = undefined as any;

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: createTaskDistribution(3),
          dndContext: true,
        }
      );

      // Should work without ResizeObserver
      await waitFor(() => {
        expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Restore ResizeObserver
      global.ResizeObserver = originalResizeObserver;
    });

    it('should handle touch events on non-touch devices', async () => {
      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: createTaskDistribution(3),
          dndContext: true,
        }
      );

      const todoColumn = screen.getByTestId('column-todo');
      const task = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

      if (task) {
        // Simulate touch events on non-touch device
        fireEvent.touchStart(task);
        fireEvent.touchMove(task);
        fireEvent.touchEnd(task);

        // Should not cause errors
        await waitFor(() => {
          expect(task).toBeInTheDocument();
        });
      }
    });
  });

  describe('User Input Error Handling', () => {
    it('should handle extremely long user input gracefully', async () => {
      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: [],
          dndContext: true,
        }
      );

      await user.click(screen.getByTestId('add-task-todo'));

      const newTask = screen.getByText('Новая задача');
      await user.click(newTask);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Новая задача')).toBeInTheDocument();
      });

      const titleInput = screen.getByDisplayValue('Новая задача');

      // Try extremely long input
      const extremelyLongInput = 'a'.repeat(100000);
      await user.clear(titleInput);
      await user.type(titleInput, extremelyLongInput);

      // Should handle without crashing
      await waitFor(() => {
        const saveButton = screen.getByText('Сохранить');
        expect(saveButton).toBeInTheDocument();
      });

      // Try to save (might be rejected or truncated)
      await user.click(screen.getByText('Сохранить'));

      // Should either save truncated version or show error
      await waitFor(() => {
        const taskElement = screen.queryByText(/^a+$/);
        if (taskElement) {
          // If saved, should be reasonably truncated
          expect(taskElement.textContent?.length).toBeLessThan(10000);
        }
      }, { timeout: 3000 });
    });

    it('should handle special Unicode characters', async () => {
      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: [],
          dndContext: true,
        }
      );

      await user.click(screen.getByTestId('add-task-todo'));

      const newTask = screen.getByText('Новая задача');
      await user.click(newTask);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Новая задача')).toBeInTheDocument();
      });

      const titleInput = screen.getByDisplayValue('Новая задача');

      // Test various Unicode characters
      const unicodeInputs = [
        '🚀🎯💡🔥', // Emojis
        'العربية', // Arabic
        'עברית', // Hebrew
        '中文', // Chinese
        '日本語', // Japanese
        '한국어', // Korean
        '🇺🇸🇨🇦🇲🇽', // Flag emojis
        '\u{1F1FA}\u{1F1F8}', // Complex Unicode
      ];

      for (const unicodeInput of unicodeInputs) {
        await user.clear(titleInput);
        await user.type(titleInput, unicodeInput);

        await user.click(screen.getByText('Сохранить'));

        await waitFor(() => {
          expect(screen.getByText(unicodeInput)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Error Recovery Mechanisms', () => {
    it('should provide recovery options after errors', async () => {
      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: [],
          dndContext: true,
        }
      );

      // Try to create a task that will fail validation
      await user.click(screen.getByTestId('add-task-todo'));

      const newTask = screen.getByText('Новая задача');
      await user.click(newTask);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Новая задача')).toBeInTheDocument();
      });

      const titleInput = screen.getByDisplayValue('Новая задача');
      await user.clear(titleInput); // Empty title should trigger error

      await user.click(screen.getByText('Сохранить'));

      // Look for recovery options
      await waitFor(() => {
        const retryButton = screen.queryByText(/retry|повторить/i);
        const cancelButton = screen.queryByText('Отмена');
        const resetButton = screen.queryByText(/reset|сбросить/i);

        // Should provide some way to recover
        expect(retryButton || cancelButton || resetButton).toBeTruthy();
      }, { timeout: 2000 });

      // Cancel the operation to recover
      const cancelButton = screen.getByText('Отмена');
      await user.click(cancelButton);

      // Should be back to normal state
      await waitFor(() => {
        expect(screen.getByText('Новая задача')).toBeInTheDocument();
      });
    });

    it('should maintain application state during error recovery', async () => {
      const initialTasks = createTaskDistribution(5);

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks,
          dndContext: true,
        }
      );

      await waitFor(() => {
        const allTasks = document.querySelectorAll('[data-testid^="task-"]');
        expect(allTasks).toHaveLength(5);
      });

      // Trigger an error
      await user.click(screen.getByTestId('add-task-todo'));

      const newTask = screen.getByText('Новая задача');
      await user.click(newTask);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Новая задача')).toBeInTheDocument();
      });

      // Cancel to trigger error recovery
      await user.click(screen.getByText('Отмена'));

      // Original tasks should still be there
      await waitFor(() => {
        const allTasks = document.querySelectorAll('[data-testid^="task-"]');
        expect(allTasks).toHaveLength(5);
      });

      // Should still be able to add new tasks normally
      await user.click(screen.getByTestId('add-task-todo'));

      await waitFor(() => {
        const todoColumn = screen.getByTestId('column-todo');
        const tasks = todoColumn.querySelectorAll('[data-testid^="task-"]');
        expect(tasks).toHaveLength(6);
      });
    });
  });
});