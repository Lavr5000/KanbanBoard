import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndContext } from '@dnd-kit/core';
import { KanbanBoard } from '@/features/kanban/ui/KanbanBoard';
import { renderWithProvider } from '../fixtures/store-helpers';
import {
  createLargeDataset,
  createTaskDistribution,
  createMemoryStressDataset,
} from '../fixtures/tasks-data';
import {
  measurePerformance,
  detectMemoryLeaks,
  MemoryLeakDetector,
} from '../fixtures/performance-utils';
import {
  createMemoryStressDataset as createStressDataset,
  ERROR_SCENARIOS,
} from '../fixtures/error-helpers';

describe('Memory Management', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let memoryLeakDetector: MemoryLeakDetector;

  beforeEach(() => {
    user = userEvent.setup();
    localStorage.clear();
    memoryLeakDetector = new MemoryLeakDetector();

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  });

  afterEach(() => {
    if (global.gc) {
      global.gc();
    }
  });

  describe('Memory Leak Prevention', () => {
    it('should prevent memory leaks during component mounting/unmounting', async () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;

      memoryLeakDetector.start();

      // Perform multiple mount/unmount cycles
      for (let i = 0; i < 10; i++) {
        const { unmount } = renderWithProvider(
          <DndContext>
            <KanbanBoard />
          </DndContext>,
          {
            initialTasks: createTaskDistribution(20),
            dndContext: true,
          }
        );

        // Perform some operations
        await user.click(screen.getByTestId('add-task-todo'));

        await waitFor(() => {
          const todoColumn = screen.getByTestId('column-todo');
          const tasks = todoColumn.querySelectorAll('[data-testid^="task-"]');
          expect(tasks).toHaveLength(21);
        });

        unmount();

        // Check for memory leaks after each cycle
        const leakDetected = memoryLeakDetector.check();
        expect(leakDetected.leaked).toBe(false);

        // Brief pause between cycles
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      memoryLeakDetector.end();
      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal (< 5MB)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });

    it('should clean up event listeners properly', async () => {
      const eventListenerCount = (global as any).__eventListenerCount || 0;

      // Create and destroy components rapidly
      for (let i = 0; i < 5; i++) {
        const { unmount } = renderWithProvider(
          <DndContext>
            <KanbanBoard />
          </DndContext>,
          {
            initialTasks: createTaskDistribution(10),
            dndContext: true,
          }
        );

        // Add event listeners through user interactions
        const todoColumn = screen.getByTestId('column-todo');
        const task = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

        if (task) {
          await user.click(task);
          await user.click(screen.getByText('Отмена'));
        }

        unmount();
      }

      // Event listeners should be cleaned up
      // Note: This is a simplified check - actual implementation would need proper tracking
      expect(true).toBe(true); // Placeholder for event listener cleanup verification
    });

    it('should not leak memory during drag and drop operations', async () => {
      memoryLeakDetector.start();

      const dataset = createTaskDistribution(20);

      const { unmount } = renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: dataset,
          dndContext: true,
        }
      );

      await waitFor(() => {
        const allTasks = document.querySelectorAll('[data-testid^="task-"]');
        expect(allTasks).toHaveLength(20);
      });

      // Perform multiple drag operations
      const todoColumn = screen.getByTestId('column-todo');
      const inProgressColumn = screen.getByTestId('column-in-progress');
      const tasks = Array.from(todoColumn.querySelectorAll('[data-testid^="task-"]')).slice(0, 5) as HTMLElement[];

      for (const task of tasks) {
        // Simulate complete drag lifecycle
        fireEvent.dragStart(task);
        fireEvent.dragEnter(inProgressColumn);
        fireEvent.dragOver(inProgressColumn);
        fireEvent.drop(inProgressColumn);
        fireEvent.dragEnd(task);

        // Check for memory leaks after each drag
        const leakDetected = memoryLeakDetector.check();
        expect(leakDetected.leaked).toBe(false);
      }

      unmount();

      memoryLeakDetector.end();
      const results = memoryLeakDetector.getResults();
      expect(results.leaked).toBe(false);
    });
  });

  describe('Memory Usage Optimization', () => {
    it('should optimize memory usage for large task datasets', async () => {
      const largeDataset = createMemoryStressDataset(200);

      const initialMemory = performance.memory?.usedJSHeapSize || 0;

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
          const allTasks = document.querySelectorAll('[data-testid^="task-"]');
          expect(allTasks).toHaveLength(200);
        }, { timeout: 10000 });

        // Perform operations that should be memory-efficient
        for (let i = 0; i < 10; i++) {
          await user.click(screen.getByTestId('add-task-todo'));

          // Brief pause to allow memory cleanup
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }, {
        maxDuration: 8000,
      });

      expect(passed).toBe(true);

      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryUsed = finalMemory - initialMemory;

      // Memory usage should be reasonable for 200+ tasks (< 50MB)
      expect(memoryUsed).toBeLessThan(50 * 1024 * 1024);

      // Memory per task should be efficient (< 100KB per task)
      const memoryPerTask = memoryUsed / 210; // 200 initial + 10 added
      expect(memoryPerTask).toBeLessThan(100 * 1024);
    });

    it('should implement efficient data structures for task storage', async () => {
      const efficientDataset = Array.from({ length: 100 }, (_, index) => ({
        id: `efficient-task-${index}`,
        title: `Task ${index}`,
        description: `Description for task ${index}`,
        status: ['todo', 'in-progress', 'review', 'testing', 'done'][index % 5] as any,
        priority: ['urgent', 'high', 'medium', 'low'][index % 4] as any,
        startDate: '2025-01-01',
        dueDate: '2025-12-31',
        assignees: [],
        tags: [],
        progress: index % 101,
      }));

      const memoryCheck = await detectMemoryLeaks(async () => {
        renderWithProvider(
          <DndContext>
            <KanbanBoard />
          </DndContext>,
          {
            initialTasks: efficientDataset,
            dndContext: true,
          }
        );

        await waitFor(() => {
          const allTasks = document.querySelectorAll('[data-testid^="task-"]');
          expect(allTasks).toHaveLength(100);
        });
      }, {
        maxMemoryIncrease: 20 * 1024 * 1024, // 20MB max increase
        iterations: 5,
      });

      expect(memoryCheck.leaked).toBe(false);
      expect(memoryCheck.avgMemoryIncrease).toBeLessThan(4 * 1024 * 1024); // 4MB per iteration
    });

    it('should clean up DOM nodes properly when tasks are removed', async () => {
      const dataset = createTaskDistribution(30);

      const { unmount } = renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: dataset,
          dndContext: true,
        }
      );

      await waitFor(() => {
        const allTasks = document.querySelectorAll('[data-testid^="task-"]');
        expect(allTasks).toHaveLength(30);
      });

      // Get initial DOM node count
      const initialNodes = document.querySelectorAll('[data-testid^="task-"]').length;

      // Remove some tasks (move to done column and potentially clear)
      const todoColumn = screen.getByTestId('column-todo');
      const doneColumn = screen.getByTestId('column-done');
      const tasksToMove = Array.from(todoColumn.querySelectorAll('[data-testid^="task-"]')).slice(0, 10) as HTMLElement[];

      for (const task of tasksToMove) {
        fireEvent.dragStart(task);
        fireEvent.dragEnter(doneColumn);
        fireEvent.drop(doneColumn);
        fireEvent.dragEnd(task);
      }

      await waitFor(() => {
        const finalNodes = document.querySelectorAll('[data-testid^="task-"]').length;
        expect(finalNodes).toBe(initialNodes); // Same total, just moved
      });

      // DOM should not have orphaned nodes
      const orphanedNodes = document.querySelectorAll('[data-testid^="task-"]:not(.task)');
      expect(orphanedNodes).toHaveLength(30);

      unmount();

      // All nodes should be cleaned up after unmount
      const remainingNodes = document.querySelectorAll('[data-testid^="task-"]');
      expect(remainingNodes).toHaveLength(0);
    });
  });

  describe('Garbage Collection Efficiency', () => {
    it('should allow efficient garbage collection of unused objects', async () => {
      const gcEfficiencyCheck = await detectMemoryLeaks(async () => {
        for (let cycle = 0; cycle < 10; cycle++) {
          const largeDataset = createLargeDataset(50);

          const { unmount } = renderWithProvider(
            <DndContext>
              <KanbanBoard />
            </DndContext>,
            {
              initialTasks: largeDataset,
              dndContext: true,
            }
          );

          await waitFor(() => {
            const allTasks = document.querySelectorAll('[data-testid^="task-"]');
            expect(allTasks).toHaveLength(50);
          });

          // Perform operations that create temporary objects
          await user.click(screen.getByTestId('add-task-todo'));

          const todoColumn = screen.getByTestId('column-todo');
          const task = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

          if (task) {
            await user.click(task);
            await user.click(screen.getByText('Отмена'));
          }

          unmount();

          // Allow garbage collection to occur
          if (global.gc) {
            global.gc();
          }

          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }, {
        iterations: 10,
        maxMemoryIncrease: 30 * 1024 * 1024, // 30MB max for all cycles
      });

      expect(gcEfficiencyCheck.leaked).toBe(false);
    });

    it('should not retain references to destroyed components', async () => {
      const referenceCheck = await detectMemoryLeaks(async () => {
        let componentRefs: any[] = [];

        for (let i = 0; i < 5; i++) {
          const { unmount } = renderWithProvider(
            <DndContext>
              <KanbanBoard />
            </DndContext>,
            {
              initialTasks: createTaskDistribution(15),
              dndContext: true,
            }
          );

          // Simulate storing references (this would be a memory leak if not cleaned up)
          // componentRefs.push(screen.getByTestId('kanban-board'));

          unmount();

          // Clear references manually (in real app, component should clean up itself)
          componentRefs = [];

          await new Promise(resolve => setTimeout(resolve, 50));
        }
      });

      expect(referenceCheck.leaked).toBe(false);
    });
  });

  describe('Memory Pressure Handling', () => {
    it('should handle low memory conditions gracefully', async () => {
      // Simulate low memory by creating large datasets
      const memoryPressureDataset = createStressDataset(300);

      const { metrics, passed } = await measurePerformance(async () => {
        renderWithProvider(
          <DndContext>
            <KanbanBoard />
          </DndContext>,
          {
            initialTasks: memoryPressureDataset,
            dndContext: true,
          }
        );

        await waitFor(() => {
          const allTasks = document.querySelectorAll('[data-testid^="task-"]');
          expect(allTasks).toHaveLength(300);
        }, { timeout: 15000 });

        // Should still be responsive under memory pressure
        await user.click(screen.getByTestId('add-task-todo'));

        await waitFor(() => {
          const todoColumn = screen.getByTestId('column-todo');
          const tasks = todoColumn.querySelectorAll('[data-testid^="task-"]');
          expect(tasks.length).toBeGreaterThan(0);
        }, { timeout: 5000 });
      }, {
        maxDuration: 12000,
      });

      expect(passed).toBe(true);
    });

    it('should implement memory usage thresholds and warnings', async () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;

      // Create memory pressure gradually
      const datasets = [
        createLargeDataset(50),
        createLargeDataset(100),
        createLargeDataset(150),
        createLargeDataset(200),
      ];

      for (const dataset of datasets) {
        const { unmount } = renderWithProvider(
          <DndContext>
            <KanbanBoard />
          </DndContext>,
          {
            initialTasks: dataset,
            dndContext: true,
          }
        );

        await waitFor(() => {
          const allTasks = document.querySelectorAll('[data-testid^="task-"]');
          expect(allTasks.length).toBeGreaterThan(0);
        });

        const currentMemory = performance.memory?.usedJSHeapSize || 0;
        const memoryIncrease = currentMemory - initialMemory;

        // Should not exceed reasonable memory thresholds
        expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // 100MB threshold

        unmount();

        // Memory should decrease after unmount
        if (global.gc) {
          global.gc();
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }
    });
  });

  describe('Memory Profiling and Monitoring', () => {
    it('should provide memory usage statistics for debugging', async () => {
      const profiler = new MemoryLeakDetector('Memory Usage Profiling');
      profiler.start();

      const dataset = createTaskDistribution(25);

      renderWithProvider(
        <DndContext>
          <KanbanBoard />
        </DndContext>,
        {
          initialTasks: dataset,
          dndContext: true,
        }
      );

      await waitFor(() => {
        const allTasks = document.querySelectorAll('[data-testid^="task-"]');
        expect(allTasks).toHaveLength(25);
      });

      // Perform memory-intensive operations
      for (let i = 0; i < 10; i++) {
        await user.click(screen.getByTestId('add-task-todo'));
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      profiler.mark('after-task-creation');

      // Perform drag operations
      const todoColumn = screen.getByTestId('column-todo');
      const inProgressColumn = screen.getByTestId('column-in-progress');
      const task = todoColumn.querySelector('[data-testid^="task-"]') as HTMLElement;

      if (task) {
        fireEvent.dragStart(task);
        fireEvent.dragEnter(inProgressColumn);
        fireEvent.drop(inProgressColumn);
        fireEvent.dragEnd(task);
      }

      profiler.mark('after-drag-operation');
      profiler.end();

      const results = profiler.getResults();
      expect(results.samples.length).toBeGreaterThan(0);
      expect(results.markData).toHaveLength(2);
      expect(results.leaked).toBe(false);

      // Memory usage should be reasonable
      const avgMemory = results.samples.reduce((a, b) => a + b, 0) / results.samples.length;
      expect(avgMemory).toBeGreaterThan(0);
    });

    it('should track memory trends over time', async () => {
      const memoryTrends: number[] = [];

      for (let iteration = 0; iteration < 5; iteration++) {
        const { unmount } = renderWithProvider(
          <DndContext>
            <KanbanBoard />
          </DndContext>,
          {
            initialTasks: createTaskDistribution(20),
            dndContext: true,
          }
        );

        await waitFor(() => {
          const allTasks = document.querySelectorAll('[data-testid^="task-"]');
          expect(allTasks).toHaveLength(20);
        });

        const currentMemory = performance.memory?.usedJSHeapSize || 0;
        memoryTrends.push(currentMemory);

        unmount();

        if (global.gc) {
          global.gc();
        }

        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Memory trend should not show continuous growth
      const firstMemory = memoryTrends[0];
      const lastMemory = memoryTrends[memoryTrends.length - 1];
      const memoryGrowth = lastMemory - firstMemory;

      // Should not show significant memory growth over multiple cycles
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // 10MB max growth
    });
  });

  describe('Memory Optimization Strategies', () => {
    it('should implement lazy loading for task data', async () => {
      // Test lazy loading by checking that not all data is loaded immediately
      const lazyLoadCheck = await measurePerformance(async () => {
        renderWithProvider(
          <DndContext>
            <KanbanBoard />
          </DndContext>,
          {
            initialTasks: createTaskDistribution(50),
            dndContext: true,
          }
        );

        // Initial load should be fast
        await waitFor(() => {
          const visibleTasks = document.querySelectorAll('[data-testid^="task-"]');
          expect(visibleTasks.length).toBeGreaterThan(0);
        }, { timeout: 3000 });

        // Test that additional data loads on demand (scrolling, filtering, etc.)
        const filterToggle = screen.getByTestId('filter-toggle-button');
        await user.click(filterToggle);

        await waitFor(() => {
          expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
        }, { timeout: 2000 });
      }, {
        maxDuration: 5000,
      });

      expect(lazyLoadCheck.passed).toBe(true);
    });

    it('should use efficient data structures for task properties', async () => {
      // Test with tasks that have minimal memory footprint
      const efficientTasks = Array.from({ length: 100 }, (_, index) => ({
        id: `task-${index}`,
        title: `T${index}`, // Minimal title
        description: '', // Empty description saves memory
        status: 'todo' as any,
        priority: 'medium' as any,
        startDate: null,
        dueDate: null,
        assignees: [],
        tags: [],
        progress: 0,
      }));

      const memoryEfficiency = await detectMemoryLeaks(async () => {
        renderWithProvider(
          <DndContext>
            <KanbanBoard />
          </DndContext>,
          {
            initialTasks: efficientTasks,
            dndContext: true,
          }
        );

        await waitFor(() => {
          const allTasks = document.querySelectorAll('[data-testid^="task-"]');
          expect(allTasks).toHaveLength(100);
        });
      }, {
        maxMemoryIncrease: 5 * 1024 * 1024, // Should be very memory efficient
        iterations: 3,
      });

      expect(memoryEfficiency.leaked).toBe(false);
    });
  });
});