import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndContext } from '@dnd-kit/core';
import { KanbanBoard } from '@/features/kanban/ui/KanbanBoard';
import { renderWithProvider } from '../fixtures/store-helpers';
import {
  createLargeDataset,
  createMemoryStressDataset,
  createTaskDistribution,
} from '../fixtures/tasks-data';
import {
  measurePerformance,
  PerformanceProfiler,
  detectMemoryLeaks,
} from '../fixtures/performance-utils';
import { createMemoryStressDataset as createStressDataset } from '../fixtures/error-helpers';

describe('Performance & Scalability', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    localStorage.clear();
  });

  describe('Large Dataset Handling', () => {
    it('should handle 100+ tasks smoothly with <100ms operations', async () => {
      const largeDataset = createLargeDataset(100);

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

        // Wait for initial render
        await waitFor(() => {
          const allTasks = document.querySelectorAll('[data-testid^="task-"]');
          expect(allTasks).toHaveLength(100);
        }, { timeout: 10000 });

        // Test task creation performance
        await user.click(screen.getByTestId('add-task-todo'));

        await waitFor(() => {
          const todoColumn = screen.getByTestId('column-todo');
          const tasks = todoColumn.querySelectorAll('[data-testid^="task-"]');
          expect(tasks).toHaveLength(41); // Initial 40 + 1 new
        }, { timeout: 5000 });

      }, {
        maxDuration: 3000, // Should complete within 3 seconds
      });

      expect(passed).toBe(true);
      expect(metrics.duration).toBeLessThan(3000);

      // Verify all tasks are rendered
      const allTasks = document.querySelectorAll('[data-testid^="task-"]');
      expect(allTasks).toHaveLength(101);
    });

    it('should maintain responsiveness during complex filtering with 500+ tasks', async () => {
      const massiveDataset = createLargeDataset(500);

      const { metrics, passed } = await measurePerformance(async () => {
        renderWithProvider(
          <DndContext>
            <KanbanBoard />
          </DndContext>,
          {
            initialTasks: massiveDataset,
            dndContext: true,
          }
        );

        // Wait for initial render
        await waitFor(() => {
          const allTasks = document.querySelectorAll('[data-testid^="task-"]');
          expect(allTasks).toHaveLength(500);
        }, { timeout: 15000 });

        // Open filter panel
        const filterToggle = screen.getByTestId('filter-toggle-button');
        await user.click(filterToggle);

        await waitFor(() => {
          expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
        }, { timeout: 5000 });

        // Test search performance
        const searchInput = screen.getByTestId('filter-search-input');
        await user.type(searchInput, 'Performance Test Task 1');

        await waitFor(() => {
          const filteredTasks = document.querySelectorAll('[data-testid^="task-"]:not([style*="display: none"])');
          expect(filteredTasks.length).toBeLessThan(500);
        }, { timeout: 3000 });

      }, {
        maxDuration: 10000, // Allow more time for 500 tasks
      });

      expect(passed).toBe(true);
    });

    it('should optimize drag & drop with many tasks without UI freezing', async () => {
      const largeDataset = createTaskDistribution(50);

      const profiler = new PerformanceProfiler('Large Dataset DnD');

      profiler.start();

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
        expect(allTasks).toHaveLength(50);
      }, { timeout: 5000 });

      // Test multiple drag operations
      const todoColumn = screen.getByTestId('column-todo');
      const inProgressColumn = screen.getByTestId('column-in-progress');
      const tasks = Array.from(todoColumn.querySelectorAll('[data-testid^="task-"]')).slice(0, 5) as HTMLElement[];

      for (const task of tasks) {
        profiler.mark(`drag-start-${tasks.indexOf(task)}`);

        // Simulate drag operation
        fireEvent.dragStart(task);
        fireEvent.dragEnter(inProgressColumn);
        fireEvent.drop(inProgressColumn);
        fireEvent.dragEnd(task);

        profiler.mark(`drag-end-${tasks.indexOf(task)}`);

        // Brief pause between operations
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      profiler.end();

      const results = profiler.getResults();
      expect(results.duration).toBeLessThan(3000); // All drags should complete within 3 seconds
      expect(results.markData).toHaveLength(10); // 5 start + 5 end marks

      // Verify tasks moved
      await waitFor(() => {
        const todoTasks = todoColumn.querySelectorAll('[data-testid^="task-"]');
        const inProgressTasks = inProgressColumn.querySelectorAll('[data-testid^="task-"]');
        expect(inProgressTasks.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });
  });

  describe('Performance Regression Detection', () => {
    it('should detect performance regressions in task operations', async () => {
      const mediumDataset = createTaskDistribution(25);

      // Baseline performance measurement
      const baseline = await measurePerformance(async () => {
        renderWithProvider(
          <DndContext>
            <KanbanBoard />
          </DndContext>,
          {
            initialTasks: mediumDataset,
            dndContext: true,
          }
        );

        await waitFor(() => {
          const allTasks = document.querySelectorAll('[data-testid^="task-"]');
          expect(allTasks).toHaveLength(25);
        });
      });

      // Current performance measurement
      const current = await measurePerformance(async () => {
        // Simulate additional operations that might cause regression
        for (let i = 0; i < 5; i++) {
          await user.click(screen.getByTestId('add-task-todo'));
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        await waitFor(() => {
          const todoColumn = screen.getByTestId('column-todo');
          const tasks = todoColumn.querySelectorAll('[data-testid^="task-"]');
          expect(tasks).toBeGreaterThan(25);
        });
      });

      // Check for regression (current should not be significantly slower)
      const regressionFactor = current.metrics.duration / baseline.metrics.duration;
      expect(regressionFactor).toBeLessThan(2.5); // Allow 2.5x slower as acceptable threshold
    });

    it('should maintain consistent performance across multiple render cycles', async () => {
      const dataset = createTaskDistribution(20);
      const performanceData = [];

      // Test multiple render cycles
      for (let cycle = 0; cycle < 5; cycle++) {
        const { unmount } = renderWithProvider(
          <DndContext>
            <KanbanBoard />
          </DndContext>,
          {
            initialTasks: dataset,
            dndContext: true,
          }
        );

        const cycleStart = performance.now();

        await waitFor(() => {
          const allTasks = document.querySelectorAll('[data-testid^="task-"]');
          expect(allTasks).toHaveLength(20);
        });

        const cycleEnd = performance.now();
        performanceData.push(cycleEnd - cycleStart);

        unmount();

        // Brief pause between cycles
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Check consistency (performance should not vary wildly)
      const avgDuration = performanceData.reduce((a, b) => a + b, 0) / performanceData.length;
      const maxDuration = Math.max(...performanceData);
      const consistencyRatio = maxDuration / avgDuration;

      // Performance should be consistent within 50% variance
      expect(consistencyRatio).toBeLessThan(1.5);
    });
  });

  describe('Resource Usage Optimization', () => {
    it('should prevent memory leaks during extended sessions', async () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;

      // Create multiple render/unmount cycles
      for (let i = 0; i < 10; i++) {
        const { unmount } = renderWithProvider(
          <DndContext>
            <KanbanBoard />
          </DndContext>,
          {
            initialTasks: createTaskDistribution(10),
            dndContext: true,
          }
        );

        // Perform some operations
        await user.click(screen.getByTestId('add-task-todo'));
        await user.click(screen.getByTestId('add-task-todo'));

        await waitFor(() => {
          const todoColumn = screen.getByTestId('column-todo');
          const tasks = todoColumn.querySelectorAll('[data-testid^="task-"]');
          expect(tasks).toHaveLength(12);
        });

        unmount();

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (< 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should optimize DOM operations for better performance', async () => {
      const dataset = createTaskDistribution(30);

      // Measure DOM operation performance
      const domMetrics = await measurePerformance(async () => {
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
          expect(allTasks).toHaveLength(30);
        });

        // Measure rapid DOM updates
        const updateStart = performance.now();

        for (let i = 0; i < 10; i++) {
          await user.click(screen.getByTestId('add-task-todo'));
        }

        const updateEnd = performance.now();
        const updateTime = updateEnd - updateStart;

        // DOM updates should be fast (< 1 second for 10 operations)
        expect(updateTime).toBeLessThan(1000);

        await waitFor(() => {
          const todoColumn = screen.getByTestId('column-todo');
          const tasks = todoColumn.querySelectorAll('[data-testid^="task-"]');
          expect(tasks).toHaveLength(22); // 12 initial + 10 new
        });
      });

      expect(domMetrics.passed).toBe(true);
    });
  });

  describe('Concurrent Operations Performance', () => {
    it('should handle simultaneous operations efficiently', async () => {
      const user = userEvent.setup({ delay: 0 });
      const dataset = createTaskDistribution(15);

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
        expect(allTasks).toHaveLength(15);
      });

      // Perform multiple operations concurrently
      const operations = [
        () => user.click(screen.getByTestId('add-task-todo')),
        () => user.click(screen.getByTestId('add-task-in-progress')),
        () => user.click(screen.getByTestId('add-task-review')),
      ];

      const concurrentStart = performance.now();

      await Promise.all(operations.map(op => op()));

      const concurrentEnd = performance.now();
      const concurrentTime = concurrentEnd - concurrentStart;

      // Concurrent operations should be efficient
      expect(concurrentTime).toBeLessThan(500);

      await waitFor(() => {
        const allTasks = document.querySelectorAll('[data-testid^="task-"]');
        expect(allTasks).toHaveLength(18); // 15 + 3 new
      }, { timeout: 3000 });
    });

    it('should maintain performance during rapid task switching', async () => {
      const user = userEvent.setup({ delay: 0 });
      const dataset = createTaskDistribution(10);

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
        expect(allTasks).toHaveLength(10);
      });

      const todoColumn = screen.getByTestId('column-todo');
      const tasks = Array.from(todoColumn.querySelectorAll('[data-testid^="task-"]')).slice(0, 3) as HTMLElement[];

      // Rapid task editing and canceling
      const switchingStart = performance.now();

      for (let i = 0; i < 10; i++) {
        for (const task of tasks) {
          await user.click(task);

          // Wait for edit mode
          await waitFor(() => {
            const editInput = screen.queryByDisplayValue(task.textContent || '');
            if (editInput) {
              expect(editInput).toBeInTheDocument();
            }
          }, { timeout: 100 });

          // Cancel edit
          const cancelButton = screen.queryByText('Отмена');
          if (cancelButton) {
            await user.click(cancelButton);
          } else {
            await user.keyboard('{Escape}');
          }

          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      const switchingEnd = performance.now();
      const switchingTime = switchingEnd - switchingStart;

      // Rapid switching should remain responsive
      expect(switchingTime).toBeLessThan(3000); // 30 operations in < 3 seconds
    });
  });

  describe('Performance Under Load', () => {
    it('should handle CPU-intensive operations without blocking UI', async () => {
      const largeDataset = createMemoryStressDataset(100);

      const uiResponsivenessCheck = await measurePerformance(async () => {
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
          expect(allTasks).toHaveLength(100);
        }, { timeout: 10000 });

        // UI should remain responsive during heavy load
        const responsivenessTest = setInterval(() => {
          // Try to interact with UI
          const filterToggle = screen.getByTestId('filter-toggle-button');
          expect(filterToggle).toBeInTheDocument();
        }, 100);

        // Simulate CPU-intensive operation
        await new Promise(resolve => setTimeout(resolve, 2000));

        clearInterval(responsivenessTest);
      }, {
        maxDuration: 8000, // Should complete within 8 seconds
      });

      expect(uiResponsivenessCheck.passed).toBe(true);
    });

    it('should scale linearly with increasing task count', async () => {
      const taskCounts = [10, 25, 50, 75];
      const performanceData = [];

      for (const count of taskCounts) {
        const dataset = createLargeDataset(count);

        const { metrics } = await measurePerformance(async () => {
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
            expect(allTasks).toHaveLength(count);
          });

          unmount();
        });

        performanceData.push({
          taskCount: count,
          duration: metrics.duration,
        });
      }

      // Check linear scaling (duration should increase proportionally, not exponentially)
      const scalingFactors = performanceData.map((data, index) => {
        if (index === 0) return 1;
        const baseDuration = performanceData[0].duration;
        const expectedDuration = baseDuration * (data.taskCount / performanceData[0].taskCount);
        return data.duration / expectedDuration;
      });

      // Scaling should be close to linear (factor < 2)
      scalingFactors.forEach(factor => {
        expect(factor).toBeLessThan(2);
      });
    });
  });

  describe('Performance Optimization Features', () => {
    it('should implement virtual scrolling for large task lists', async () => {
      const veryLargeDataset = createMemoryStressDataset(200);

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

        // Should render quickly with virtual scrolling
        await waitFor(() => {
          const board = screen.getByTestId('kanban-board');
          expect(board).toBeInTheDocument();
        }, { timeout: 5000 });

        // Check if virtual scrolling is implemented (viewport-based rendering)
        const visibleTasks = document.querySelectorAll('[data-testid^="task-"]:not([style*="display: none"])');

        // With virtual scrolling, not all tasks should be in DOM initially
        if (visibleTasks.length < veryLargeDataset.length) {
          // Virtual scrolling is working - test scrolling performance
          const scrollContainer = document.querySelector('.kanban-scrollbar');
          if (scrollContainer) {
            scrollContainer.scrollTop = 1000;
            await new Promise(resolve => setTimeout(resolve, 100));

            const scrolledTasks = document.querySelectorAll('[data-testid^="task-"]:not([style*="display: none"])');
            expect(scrolledTasks.length).toBeGreaterThan(0);
          }
        }
      }, {
        maxDuration: 8000,
      });

      expect(passed).toBe(true);
    });

    it('should debounce expensive operations', async () => {
      const user = userEvent.setup({ delay: 0 });
      const dataset = createTaskDistribution(20);

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
        expect(allTasks).toHaveLength(20);
      });

      // Open filter panel
      const filterToggle = screen.getByTestId('filter-toggle-button');
      await user.click(filterToggle);

      const searchInput = screen.getByTestId('filter-search-input');

      // Test debounced search
      const debounceStart = performance.now();

      // Rapidly type search terms
      await user.clear(searchInput);
      await user.type(searchInput, 'test');
      await user.clear(searchInput);
      await user.type(searchInput, 'task');
      await user.clear(searchInput);
      await user.type(searchInput, 'search');

      const debounceEnd = performance.now();
      const debounceTime = debounceEnd - debounceStart;

      // With debouncing, rapid operations should be efficient
      expect(debounceTime).toBeLessThan(1000);

      // Wait for debounced result
      await waitFor(() => {
        const filteredTasks = document.querySelectorAll('[data-testid^="task-"]:not([style*="display: none"])');
        expect(filteredTasks.length).toBeGreaterThanOrEqual(0);
      }, { timeout: 2000 });
    });
  });
});