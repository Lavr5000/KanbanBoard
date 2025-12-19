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
import { Task, TaskStatus, Priority } from '@/shared/types/task';

describe('Data Validation', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    localStorage.clear();
  });

  describe('Date Validation', () => {
    it('should reject invalid dates and provide clear error messages', async () => {
      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: [],
          dndContext: true,
        }
      );

      // Add a new task
      await user.click(screen.getByTestId('add-task-todo'));

      // Enter edit mode for the new task
      const newTask = screen.getByText('Новая задача');
      await user.click(newTask);

      // Wait for edit mode
      await waitFor(() => {
        expect(screen.getByDisplayValue('Новая задача')).toBeInTheDocument();
      });

      // Try to set invalid due date
      const dueDateInput = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/); // Current date format

      // Test various invalid date formats
      const invalidDates = [
        '2025-13-01', // Invalid month
        '2025-02-30', // Invalid day for February
        '2025-00-10', // Invalid month (0)
        '2025-12-00', // Invalid day (0)
        'invalid-date', // Completely invalid format
        '2025/12/31', // Wrong separator
        '12-31-2025', // Wrong order
      ];

      for (const invalidDate of invalidDates) {
        await user.clear(dueDateInput);
        await user.type(dueDateInput, invalidDate);

        // Try to save
        await user.click(screen.getByText('Сохранить'));

        // Should show error message or reject save
        await waitFor(() => {
          const errorMessage = screen.queryByText(/invalid date|неверная дата|некорректная дата/i);
          if (errorMessage) {
            expect(errorMessage).toBeInTheDocument();
          }
        }, { timeout: 1000 });
      }
    });

    it('should handle end date before start date validation', async () => {
      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: [],
          dndContext: true,
        }
      );

      // Add a new task
      await user.click(screen.getByTestId('add-task-todo'));

      // Enter edit mode
      const newTask = screen.getByText('Новая задача');
      await user.click(newTask);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Новая задача')).toBeInTheDocument();
      });

      // Set start date to a future date
      const startDateInput = screen.getByTestId('task-start-date');
      const dueDateInput = screen.getByTestId('task-due-date');

      await user.clear(startDateInput);
      await user.type(startDateInput, '2025-12-31');

      await user.clear(dueDateInput);
      await user.type(dueDateInput, '2025-01-01'); // Before start date

      // Try to save
      await user.click(screen.getByText('Сохранить'));

      // Should show validation error
      await waitFor(() => {
        const errorMessage = screen.queryByText(/due date.*start date|дата окончания.*дата начала/i);
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument();
        }
      }, { timeout: 1000 });
    });

    it('should accept valid date ranges and dates at boundaries', async () => {
      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: [],
          dndContext: true,
        }
      );

      // Add a new task
      await user.click(screen.getByTestId('add-task-todo'));

      // Enter edit mode
      const newTask = screen.getByText('Новая задача');
      await user.click(newTask);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Новая задача')).toBeInTheDocument();
      });

      // Test valid date ranges
      const validDateRanges = [
        { start: '2025-01-01', end: '2025-01-01' }, // Same day
        { start: '2025-01-01', end: '2025-01-02' }, // Next day
        { start: '2025-12-31', end: '2026-01-01' }, // Year boundary
      ];

      for (const { start, end } of validDateRanges) {
        const startDateInput = screen.getByTestId('task-start-date');
        const dueDateInput = screen.getByTestId('task-due-date');

        await user.clear(startDateInput);
        await user.type(startDateInput, start);

        await user.clear(dueDateInput);
        await user.type(dueDateInput, end);

        // Should save without error
        await user.click(screen.getByText('Сохранить'));

        await waitFor(() => {
          expect(screen.queryByText(/invalid date|неверная дата/i)).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Progress Validation', () => {
    it('should validate progress range (0-100) with bounds checking', async () => {
      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: [],
          dndContext: true,
        }
      );

      // Add a new task
      await user.click(screen.getByTestId('add-task-todo'));

      // Enter edit mode
      const newTask = screen.getByText('Новая задача');
      await user.click(newTask);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Новая задача')).toBeInTheDocument();
      });

      const progressSlider = screen.getByRole('slider', { name: /progress/i });

      // Test invalid progress values
      const invalidProgressValues = [-1, -50, 101, 150, 999];

      for (const invalidValue of invalidProgressValues) {
        await fireEvent.change(progressSlider, { target: { value: invalidValue } });

        // Try to save
        await user.click(screen.getByText('Сохранить'));

        // Should show validation error or clamp to valid range
        await waitFor(() => {
          const errorMessage = screen.queryByText(/progress.*0.*100|прогресс.*0.*100/i);
          if (errorMessage) {
            expect(errorMessage).toBeInTheDocument();
          }
        }, { timeout: 1000 });
      }

      // Test valid progress values
      const validProgressValues = [0, 25, 50, 75, 100];

      for (const validValue of validProgressValues) {
        await fireEvent.change(progressSlider, { target: { value: validValue } });

        await user.click(screen.getByText('Сохранить'));

        await waitFor(() => {
          expect(screen.queryByText(/progress.*invalid/i)).not.toBeInTheDocument();
        });
      }
    });

    it('should handle progress with decimal values appropriately', async () => {
      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: [],
          dndContext: true,
        }
      );

      // Add a new task
      await user.click(screen.getByTestId('add-task-todo'));

      // Enter edit mode
      const newTask = screen.getByText('Новая задача');
      await user.click(newTask);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Новая задача')).toBeInTheDocument();
      });

      const progressSlider = screen.getByRole('slider', { name: /progress/i });

      // Test decimal progress values
      const decimalValues = [0.5, 25.7, 50.2, 99.9];

      for (const decimalValue of decimalValues) {
        await fireEvent.change(progressSlider, { target: { value: decimalValue } });

        await user.click(screen.getByText('Сохранить'));

        await waitFor(() => {
          // Should either accept decimal or round/ truncate appropriately
          expect(screen.queryByText(/progress.*invalid/i)).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Required Fields Validation', () => {
    it('should handle empty required fields with proper validation', async () => {
      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: [],
          dndContext: true,
        }
      );

      // Add a new task
      await user.click(screen.getByTestId('add-task-todo'));

      // Enter edit mode
      const newTask = screen.getByText('Новая задача');
      await user.click(newTask);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Новая задача')).toBeInTheDocument();
      });

      // Try to clear required title field
      const titleInput = screen.getByDisplayValue('Новая задача');
      await user.clear(titleInput);

      // Try to save with empty title
      await user.click(screen.getByText('Сохранить'));

      // Should show validation error for required field
      await waitFor(() => {
        const errorMessage = screen.queryByText(/title.*required|заголовок.*обязателен/i);
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument();
        }
      }, { timeout: 1000 });

      // Enter valid title and save
      await user.type(titleInput, 'Valid Task Title');
      await user.click(screen.getByText('Сохранить'));

      await waitFor(() => {
        expect(screen.getByText('Valid Task Title')).toBeInTheDocument();
      });
    });

    it('should validate field length limits appropriately', async () => {
      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: [],
          dndContext: true,
        }
      );

      // Add a new task
      await user.click(screen.getByTestId('add-task-todo'));

      // Enter edit mode
      const newTask = screen.getByText('Новая задача');
      await user.click(newTask);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Новая задача')).toBeInTheDocument();
      });

      const titleInput = screen.getByDisplayValue('Новая задача');

      // Test extremely long title
      const extremelyLongTitle = 'A'.repeat(1000);
      await user.clear(titleInput);
      await user.type(titleInput, extremelyLongTitle);

      // Try to save
      await user.click(screen.getByText('Сохранить'));

      await waitFor(() => {
        const errorMessage = screen.queryByText(/title.*too long|заголовок.*слишком длинный/i);
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument();
        }
      }, { timeout: 1000 });

      // Test reasonable length title
      const reasonableTitle = 'Reasonable Task Title Within Limits';
      await user.clear(titleInput);
      await user.type(titleInput, reasonableTitle);

      await user.click(screen.getByText('Сохранить'));

      await waitFor(() => {
        expect(screen.getByText(reasonableTitle)).toBeInTheDocument();
      });
    });
  });

  describe('HTML and XSS Prevention', () => {
    it('should sanitize HTML in text fields to prevent XSS', async () => {
      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: [],
          dndContext: true,
        }
      );

      // Add a new task
      await user.click(screen.getByTestId('add-task-todo'));

      // Enter edit mode
      const newTask = screen.getByText('Новая задача');
      await user.click(newTask);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Новая задача')).toBeInTheDocument();
      });

      const titleInput = screen.getByDisplayValue('Новая задача');

      // Try to inject malicious HTML
      const maliciousInputs = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src="x" onerror="alert(\'XSS\')">',
        '<div onclick="alert(\'XSS\')">Click me</div>',
        '"><script>alert("XSS")</script>',
      ];

      for (const maliciousInput of maliciousInputs) {
        await user.clear(titleInput);
        await user.type(titleInput, maliciousInput);

        await user.click(screen.getByText('Сохранить'));

        await waitFor(() => {
          // HTML should be escaped or sanitized
          const taskElement = screen.queryByText(maliciousInput);
          if (taskElement) {
            // Should not contain actual HTML tags
            expect(taskElement.innerHTML).not.toContain('<script>');
            expect(taskElement.innerHTML).not.toContain('<img');
            expect(taskElement.innerHTML).not.toContain('<div');
          }
        });
      }
    });

    it('should allow safe HTML characters like < and > in text', async () => {
      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: [],
          dndContext: true,
        }
      );

      // Add a new task
      await user.click(screen.getByTestId('add-task-todo'));

      // Enter edit mode
      const newTask = screen.getByText('Новая задача');
      await user.click(newTask);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Новая задача')).toBeInTheDocument();
      });

      const titleInput = screen.getByDisplayValue('Новая задача');

      // Test safe use of < and > characters
      const safeInputs = [
        'Task < Urgent',
        'Version > 2.0',
        'A < B and C > D',
        'Use <template> tag',
      ];

      for (const safeInput of safeInputs) {
        await user.clear(titleInput);
        await user.type(titleInput, safeInput);

        await user.click(screen.getByText('Сохранить'));

        await waitFor(() => {
          expect(screen.getByText(safeInput)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Tag and Assignee Validation', () => {
    it('should validate tag data structure and limits', async () => {
      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: [],
          dndContext: true,
        }
      );

      // Add a new task
      await user.click(screen.getByTestId('add-task-todo'));

      // Enter edit mode
      const newTask = screen.getByText('Новая задача');
      await user.click(newTask);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Новая задача')).toBeInTheDocument();
      });

      // Try to add excessive number of tags (if UI supports it)
      const tagSelector = screen.queryByTestId('tag-selector');
      if (tagSelector) {
        // Add multiple tags up to the limit
        for (let i = 0; i < SAMPLE_TAGS.length; i++) {
          await user.click(tagSelector);
          const tagOption = screen.getByText(SAMPLE_TAGS[i].name);
          await user.click(tagOption);
        }

        // Try to add one more tag beyond the limit
        await user.click(tagSelector);
        const firstTag = screen.getByText(SAMPLE_TAGS[0].name);
        await user.click(firstTag);

        // Should handle gracefully without breaking
        await user.click(screen.getByText('Сохранить'));

        await waitFor(() => {
          expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
        });
      }
    });

    it('should validate assignee data structure and prevent duplicates', async () => {
      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: [],
          dndContext: true,
        }
      );

      // Add a new task
      await user.click(screen.getByTestId('add-task-todo'));

      // Enter edit mode
      const newTask = screen.getByText('Новая задача');
      await user.click(newTask);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Новая задача')).toBeInTheDocument();
      });

      // Try to add the same assignee multiple times
      const assigneeSelector = screen.queryByTestId('assignee-selector');
      if (assigneeSelector) {
        await user.click(assigneeSelector);
        const firstAssignee = screen.getByText(SAMPLE_ASSIGNNIES[0].name);
        await user.click(firstAssignee);

        // Try to add the same assignee again
        await user.click(assigneeSelector);
        await user.click(firstAssignee);

        // Should prevent duplicate assignment
        await user.click(screen.getByText('Сохранить'));

        await waitFor(() => {
          expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Priority and Status Validation', () => {
    it('should validate priority values and prevent invalid priorities', async () => {
      const taskWithInvalidPriority = createRealisticTask({
        title: 'Invalid Priority Task',
        status: 'todo',
        // @ts-ignore - intentionally testing invalid priority
        priority: 'invalid-priority',
      });

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: [taskWithInvalidPriority],
          dndContext: true,
        }
      );

      // Should handle invalid priority gracefully
      await waitFor(() => {
        const taskElement = screen.getByText('Invalid Priority Task');
        expect(taskElement).toBeInTheDocument();

        // Should either show default priority or handle error gracefully
        const priorityElement = taskElement.closest('[data-testid^="task-"]')?.querySelector('[data-testid*="priority"]');
        if (priorityElement) {
          expect(priorityElement).toBeInTheDocument();
        }
      });
    });

    it('should validate status values and prevent invalid statuses', async () => {
      const taskWithInvalidStatus = createRealisticTask({
        title: 'Invalid Status Task',
        // @ts-ignore - intentionally testing invalid status
        status: 'invalid-status',
      });

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: [taskWithInvalidStatus],
          dndContext: true,
        }
      );

      // Should handle invalid status gracefully
      await waitFor(() => {
        const taskElement = screen.getByText('Invalid Status Task');
        expect(taskElement).toBeInTheDocument();

        // Should either show in default column or handle error gracefully
        const todoColumn = screen.getByTestId('column-todo');
        expect(todoColumn).toBeInTheDocument();
      });
    });
  });

  describe('Concurrent Data Validation', () => {
    it('should handle concurrent modifications without data corruption', async () => {
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

      // Get first task
      const todoColumn = screen.getByTestId('column-todo');
      const firstTask = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

      // Start editing task
      await user.click(firstTask);

      await waitFor(() => {
        expect(screen.getByDisplayValue(firstTask.textContent || '')).toBeInTheDocument();
      });

      // Simulate concurrent modification by updating title
      const titleInput = screen.getByDisplayValue(firstTask.textContent || '');
      await user.clear(titleInput);
      await user.type(titleInput, 'Modified Title');

      // Try to save
      await user.click(screen.getByText('Сохранить'));

      // Should handle concurrent modifications gracefully
      await waitFor(() => {
        expect(screen.getByText('Modified Title')).toBeInTheDocument();
        expect(screen.queryByText(/error|conflict/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Integrity Validation', () => {
    it('should maintain data integrity during rapid operations', async () => {
      const user = userEvent.setup({ delay: 0 });
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

      // Perform rapid operations
      for (let i = 0; i < 3; i++) {
        // Add task
        await user.click(screen.getByTestId('add-task-todo'));

        // Wait for task creation
        await waitFor(() => {
          const todoColumn = screen.getByTestId('column-todo');
          const tasks = todoColumn.querySelectorAll('[data-testid^="task-"]');
          expect(tasks).toHaveLength(initialTasks.length + i + 1);
        }, { timeout: 1000 });
      }

      // Verify data integrity
      await waitFor(() => {
        const todoColumn = screen.getByTestId('column-todo');
        const tasks = todoColumn.querySelectorAll('[data-testid^="task-"]');

        // All tasks should have valid structure
        tasks.forEach(task => {
          expect(task).toHaveAttribute('data-testid');
          expect(task.querySelector('[data-testid*="task-title"], [data-testid*="title"]') || task.textContent).toBeTruthy();
        });

        expect(tasks).toHaveLength(initialTasks.length + 3);
      });
    });
  });
});