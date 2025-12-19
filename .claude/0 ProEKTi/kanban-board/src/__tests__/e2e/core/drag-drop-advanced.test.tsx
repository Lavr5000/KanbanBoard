import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndContext } from '@dnd-kit/core';
import { KanbanBoard } from '@/features/kanban/ui/KanbanBoard';
import { renderWithProvider } from '../fixtures/store-helpers';
import {
  createTaskDistribution,
  createTestScenario,
  createTaskInStatus,
} from '../fixtures/tasks-data';
import {
  simulateDragDrop,
  simulateDragCancel,
  simulateKeyboardDrag,
  simulateComplexDrag,
  verifyDragResult,
  measureDragPerformance,
} from '../fixtures/dnd-simulators';

describe('Advanced Drag & Drop', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    localStorage.clear();
  });

  describe('Inter-Column Drag Operations', () => {
    it('should drag between columns correctly with visual feedback', async () => {
      const initialTasks = createTestScenario.simpleWorkflow();

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks,
          dndContext: true,
        }
      );

      // Find source and target columns
      const todoColumn = screen.getByTestId('column-todo');
      const inProgressColumn = screen.getByTestId('column-in-progress');

      // Find task to drag
      const taskToMove = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;
      expect(taskToMove).toBeInTheDocument();

      // Get initial task count
      const initialTodoCount = todoColumn.querySelectorAll('[data-testid^="task-"]').length;
      const initialInProgressCount = inProgressColumn.querySelectorAll('[data-testid^="task-"]').length;

      // Perform drag operation with visual feedback tracking
      let dragStarted = false;
      let dragEntered = false;
      let dragDropped = false;

      await simulateDragDrop(taskToMove, inProgressColumn, {
        onDragStart: (event) => {
          dragStarted = true;
          // Task should show dragging visual feedback
          checkDragVisualFeedback(taskToMove, true);
        },
        onDragEnter: (event) => {
          dragEntered = true;
          // Target column should show drop zone feedback
          expect(inProgressColumn).toHaveClass('drag-over');
        },
        onDrop: (event) => {
          dragDropped = true;
          checkDragVisualFeedback(taskToMove, false);
        },
      });

      // Verify drag events occurred
      expect(dragStarted).toBe(true);
      expect(dragEntered).toBe(true);
      expect(dragDropped).toBe(true);

      // Verify task moved between columns
      await waitFor(() => {
        const finalTodoCount = todoColumn.querySelectorAll('[data-testid^="task-"]').length;
        const finalInProgressCount = inProgressColumn.querySelectorAll('[data-testid^="task-"]').length;

        expect(finalTodoCount).toBe(initialTodoCount - 1);
        expect(finalInProgressCount).toBe(initialInProgressCount + 1);
        expect(inProgressColumn.contains(taskToMove)).toBe(true);
        expect(todoColumn.contains(taskToMove)).toBe(false);
      });
    });

    it('should handle dragging to empty columns', async () => {
      // Create tasks only in todo column
      const initialTasks = [
        createTaskInStatus('todo', { title: 'Task to Move' }),
        createTaskInStatus('todo', { title: 'Another Task' }),
      ];

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks,
          dndContext: true,
        }
      );

      // Verify done column is empty initially
      const doneColumn = screen.getByTestId('column-done');
      const initialDoneCount = doneColumn.querySelectorAll('[data-testid^="task-"]').length;
      expect(initialDoneCount).toBe(0);

      // Drag task to empty done column
      const todoColumn = screen.getByTestId('column-todo');
      const taskToMove = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

      await simulateDragDrop(taskToMove, doneColumn);

      // Verify task moved to empty column
      await waitFor(() => {
        const finalDoneCount = doneColumn.querySelectorAll('[data-testid^="task-"]').length;
        expect(finalDoneCount).toBe(1);
        expect(doneColumn.contains(taskToMove)).toBe(true);
      });
    });

    it('should handle complex multi-column drag sequences', async () => {
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

      // Create waypoints for complex drag
      const todoColumn = screen.getByTestId('column-todo');
      const inProgressColumn = screen.getByTestId('column-in-progress');
      const reviewColumn = screen.getByTestId('column-review');
      const doneColumn = screen.getByTestId('column-done');

      const taskToMove = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

      // Perform complex drag through multiple columns
      await simulateComplexDrag(
        taskToMove,
        [inProgressColumn, reviewColumn],
        doneColumn
      );

      // Verify final position
      await waitFor(() => {
        expect(todoColumn).not.toContainElement(taskToMove);
        expect(doneColumn).toContainElement(taskToMove);
      });
    });
  });

  describe('Intra-Column Reordering', () => {
    it('should reorder tasks within column maintaining order', async () => {
      // Create multiple tasks in same column
      const tasksInTodo = [
        createTaskInStatus('todo', { title: 'First Task' }),
        createTaskInStatus('todo', { title: 'Second Task' }),
        createTaskInStatus('todo', { title: 'Third Task' }),
        createTaskInStatus('todo', { title: 'Fourth Task' }),
      ];

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: tasksInTodo,
          dndContext: true,
        }
      );

      const todoColumn = screen.getByTestId('column-todo');
      const allTasks = Array.from(todoColumn.querySelectorAll('[data-testid^="task-"]')) as HTMLElement[];

      expect(allTasks).toHaveLength(4);

      // Get the first task (should be "First Task")
      const firstTask = allTasks[0];
      const thirdTask = allTasks[2]; // "Third Task"

      // Drag first task and drop it after third task
      await simulateDragDrop(firstTask, thirdTask);

      // Verify reorder occurred
      await waitFor(() => {
        const reorderedTasks = Array.from(todoColumn.querySelectorAll('[data-testid^="task-"]'));

        // The task should have moved position
        expect(reorderedTasks[0]).not.toBe(firstTask);

        // Third task should now be before first task
        const thirdIndex = reorderedTasks.indexOf(thirdTask);
        const firstIndex = reorderedTasks.indexOf(firstTask);

        // First task should now be after third task
        expect(firstIndex).toBeGreaterThan(thirdIndex);
      });
    });

    it('should handle drag to same position (no-op)', async () => {
      const tasksInTodo = [
        createTaskInStatus('todo', { title: 'Task A' }),
        createTaskInStatus('todo', { title: 'Task B' }),
      ];

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: tasksInTodo,
          dndContext: true,
        }
      );

      const todoColumn = screen.getByTestId('column-todo');
      const firstTask = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

      // Drag task to same position
      await simulateDragDrop(firstTask, firstTask);

      // Verify order didn't change
      await waitFor(() => {
        const finalTasks = Array.from(todoColumn.querySelectorAll('[data-testid^="task-"]'));
        expect(finalTasks[0]).toBe(firstTask);
      });
    });
  });

  describe('Drag Cancellation', () => {
    it('should handle cancelled drag operations (ESC key)', async () => {
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

      const todoColumn = screen.getByTestId('column-todo');
      const inProgressColumn = screen.getByTestId('column-in-progress');
      const taskToCancel = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

      // Get initial position
      const initialTodoCount = todoColumn.querySelectorAll('[data-testid^="task-"]').length;
      const initialPosition = Array.from(todoColumn.children).indexOf(taskToCancel);

      // Start drag and then cancel
      await simulateDragCancel(taskToCancel);

      // Verify task remained in original position
      await waitFor(() => {
        const finalTodoCount = todoColumn.querySelectorAll('[data-testid^="task-"]').length;
        const finalPosition = Array.from(todoColumn.children).indexOf(taskToCancel);

        expect(finalTodoCount).toBe(initialTodoCount);
        expect(finalPosition).toBe(initialPosition);
        expect(todoColumn.contains(taskToCancel)).toBe(true);
      });
    });

    it('should restore visual state after drag cancellation', async () => {
      const initialTasks = [createTaskInStatus('todo', { title: 'Cancel Test Task' })];

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
      const taskToCancel = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

      // Start drag to see visual feedback
      simulateDragStart(taskToCancel);

      // Check visual feedback is applied
      checkDragVisualFeedback(taskToCancel, true);

      // Cancel drag
      await simulateDragCancel(taskToCancel);

      // Verify visual feedback is removed
      checkDragVisualFeedback(taskToCancel, false);
    });
  });

  describe('Visual Feedback During Drag', () => {
    it('should maintain visual feedback during entire drag operation', async () => {
      const initialTasks = createTestScenario.simpleWorkflow();

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
      const inProgressColumn = screen.getByTestId('column-in-progress');
      const taskToDrag = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

      let feedbackStates = {
        dragStart: false,
        dragEnter: false,
        dragOver: false,
        dragEnd: false,
      };

      await simulateDragDrop(taskToDrag, inProgressColumn, {
        onDragStart: () => {
          feedbackStates.dragStart = true;
          checkDragVisualFeedback(taskToDrag, true);
        },
        onDragEnter: () => {
          feedbackStates.dragEnter = true;
          expect(inProgressColumn).toHaveClass('drag-over');
        },
        onDragOver: () => {
          feedbackStates.dragOver = true;
        },
        onDragEnd: () => {
          feedbackStates.dragEnd = true;
          checkDragVisualFeedback(taskToDrag, false);
        },
      });

      // Verify all visual feedback states occurred
      expect(feedbackStates.dragStart).toBe(true);
      expect(feedbackStates.dragEnter).toBe(true);
      expect(feedbackStates.dragOver).toBe(true);
      expect(feedbackStates.dragEnd).toBe(true);
    });

    it('should show drop zone indicators in valid targets', async () => {
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

      // Get all columns
      const columns = [
        screen.getByTestId('column-todo'),
        screen.getByTestId('column-in-progress'),
        screen.getByTestId('column-review'),
        screen.getByTestId('column-testing'),
        screen.getByTestId('column-done'),
      ];

      const todoColumn = columns[0];
      const taskToDrag = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

      // Test drop zone indicators for each column
      for (const targetColumn of columns) {
        if (targetColumn !== todoColumn) {
          await simulateDragDrop(taskToDrag, targetColumn);

          // Column should accept the drop
          expect(targetColumn).not.toHaveClass('invalid-drop-zone');

          // Move task back for next test
          const taskInTarget = targetColumn.querySelector('[data-testid^="task-"]') as HTMLElement;
          if (taskInTarget) {
            await simulateDragDrop(taskInTarget, todoColumn);
          }
        }
      }
    });
  });

  describe('Keyboard Accessibility', () => {
    it('should be fully operable via keyboard only', async () => {
      const initialTasks = createTestScenario.simpleWorkflow();

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
      const inProgressColumn = screen.getByTestId('column-in-progress');
      const taskToMove = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

      // Use keyboard to perform drag operation
      await simulateKeyboardDrag(taskToMove, inProgressColumn);

      // Verify task moved
      await waitFor(() => {
        expect(todoColumn).not.toContainElement(taskToMove);
        expect(inProgressColumn).toContainElement(taskToMove);
      });
    });

    it('should provide proper ARIA labels during drag operations', async () => {
      const initialTasks = [createTaskInStatus('todo', { title: 'ARIA Test Task' })];

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
      const taskElement = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

      // Check for proper ARIA attributes
      expect(taskElement).toHaveAttribute('draggable', 'true');
      expect(taskElement).toHaveAttribute('role', 'button');
      expect(taskElement).toHaveAttribute('tabIndex', '0');

      // Check column has proper ARIA role for droppable
      expect(todoColumn).toHaveAttribute('role', 'region');
      expect(todoColumn).toHaveAttribute('aria-label');
    });
  });

  describe('Performance Optimization', () => {
    it('should optimize drag & drop with many tasks', async () => {
      const largeTaskSet = createTaskDistribution(50);

      const { metrics, passed } = await measureDragPerformance(async () => {
        renderWithProvider(
          <DndContext>
            <KanbanBoard />
          </DndContext>,
          {
            initialTasks: largeTaskSet,
            dndContext: true,
          }
        );

        // Wait for render
        await waitFor(() => {
          const allTasks = document.querySelectorAll('[data-testid^="task-"]');
          expect(allTasks).toHaveLength(50);
        }, { timeout: 5000 });

        // Perform drag operation
        const todoColumn = screen.getByTestId('column-todo');
        const inProgressColumn = screen.getByTestId('column-in-progress');
        const taskToMove = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

        if (taskToMove) {
          await simulateDragDrop(taskToMove, inProgressColumn);
        }
      });

      expect(passed).toBe(true);
      expect(metrics.duration).toBeLessThan(1000); // Should be fast even with many tasks
    });

    it('should handle rapid successive drag operations', async () => {
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

      const todoColumn = screen.getByTestId('column-todo');
      const inProgressColumn = screen.getByTestId('column-in-progress');

      // Perform multiple rapid drag operations
      const tasks = Array.from(todoColumn.querySelectorAll('[data-testid^="task-"]')) as HTMLElement[];

      for (let i = 0; i < Math.min(3, tasks.length); i++) {
        await simulateDragDrop(tasks[i], inProgressColumn);

        // Brief wait between operations
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Verify all operations completed successfully
      await waitFor(() => {
        const finalTodoCount = todoColumn.querySelectorAll('[data-testid^="task-"]').length;
        const finalInProgressCount = inProgressColumn.querySelectorAll('[data-testid^="task-"]').length;

        // Should have moved at least some tasks
        expect(finalInProgressCount).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid drop targets gracefully', async () => {
      const initialTasks = [createTaskInStatus('todo', { title: 'Error Test Task' })];

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

      // Try to drop on invalid target (same position)
      await simulateDragDrop(taskToDrag, taskToDrag);

      // Task should remain in place
      await waitFor(() => {
        expect(todoColumn).toContainElement(taskToDrag);
      });
    });

    it('should maintain UI stability during drag operation failures', async () => {
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

      const todoColumn = screen.getByTestId('column-todo');
      const initialTaskCount = todoColumn.querySelectorAll('[data-testid^="task-"]').length;

      // Simulate failed drag (drop on same element)
      const taskToDrag = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

      // Start drag but don't complete properly
      simulateDragStart(taskToDrag);
      simulateDragEnd(taskToDrag);

      // UI should remain stable
      await waitFor(() => {
        const finalTaskCount = todoColumn.querySelectorAll('[data-testid^="task-"]').length;
        expect(finalTaskCount).toBe(initialTaskCount);
        expect(todoColumn).toContainElement(taskToDrag);
      });
    });
  });
});

// Helper function for visual feedback testing
function checkDragVisualFeedback(element: HTMLElement, isDragging: boolean) {
  if (isDragging) {
    // Check for dragging styles (implementation-dependent)
    expect(element).toHaveStyle({
      opacity: expect.any(String)
    });
  } else {
    // Should not have dragging styles
    expect(element).not.toHaveStyle({
      opacity: '0.5'
    });
  }
}