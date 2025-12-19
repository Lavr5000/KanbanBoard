import React, { useEffect, ReactNode, ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Task, TaskFilters } from '@/shared/types/task';
import { useKanbanStore } from '@/shared/store/kanbanStore';

// Interface for TestWrapper props
export interface TestWrapperProps {
  children: ReactNode;
  initialTasks?: Task[];
  initialFilters?: TaskFilters;
}

// TestWrapper component that provides real Zustand store with initial data
export const TestWrapper: React.FC<TestWrapperProps> = ({
  children,
  initialTasks = [],
  initialFilters
}) => {
  const { setTasks, clearTasks, setFilters, clearFilters } = useKanbanStore();

  useEffect(() => {
    // Clear existing state
    clearTasks();
    clearFilters();

    // Set initial tasks if provided
    if (initialTasks.length > 0) {
      setTasks(initialTasks);
    }

    // Set initial filters if provided
    if (initialFilters) {
      setFilters(initialFilters);
    }

    // Cleanup function to reset state after unmount
    return () => {
      clearTasks();
      clearFilters();
    };
  }, [initialTasks, initialFilters, setTasks, clearTasks, setFilters, clearFilters]);

  return <>{children}</>;
};

// Custom render function that includes TestWrapper
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialTasks?: Task[];
  initialFilters?: TaskFilters;
}

export const renderWithStore = (
  ui: ReactElement,
  {
    initialTasks,
    initialFilters,
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
    <TestWrapper
      initialTasks={initialTasks}
      initialFilters={initialFilters}
    >
      {children}
    </TestWrapper>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Helper function to reset store state between tests
export const resetStoreState = () => {
  const { clearTasks, clearFilters } = useKanbanStore.getState();
  clearTasks();
  clearFilters();
};

// Helper function to create test filters
export const createTestFilters = (overrides?: Partial<TaskFilters>): TaskFilters => ({
  search: '',
  priorities: [],
  statuses: [],
  dateRange: {
    start: undefined,
    end: undefined,
    hasDueDate: undefined,
  },
  ...overrides
});

// Helper function to wait for store updates
export const waitForStoreUpdate = () => new Promise(resolve => {
  // Small delay to ensure Zustand updates are processed
  setTimeout(resolve, 10);
});

// Hook for accessing store in tests
export const useTestStore = () => {
  return useKanbanStore();
};

// Provider component for multiple test contexts
interface TestProviderProps extends TestWrapperProps {
  // Additional providers can be added here
  dndContext?: boolean;
  suspense?: boolean;
}

export const TestProvider: React.FC<TestProviderProps> = ({
  children,
  initialTasks,
  initialFilters,
  dndContext = false,
  suspense = false
}) => {
  let content = (
    <TestWrapper
      initialTasks={initialTasks}
      initialFilters={initialFilters}
    >
      {children}
    </TestWrapper>
  );

  // Add DndContext if needed
  if (dndContext) {
    // Import DndContext dynamically to avoid test isolation issues
    const { DndContext } = require('@dnd-kit/core');
    content = (
      <DndContext>
        {content}
      </DndContext>
    );
  }

  // Add Suspense if needed
  if (suspense) {
    const { Suspense } = require('react');
    content = (
      <Suspense fallback={<div data-testid="suspense-fallback">Loading...</div>}>
        {content}
      </Suspense>
    );
  }

  return content;
};

// Advanced render with multiple contexts
export const renderWithProvider = (
  ui: ReactElement,
  options: CustomRenderOptions & {
    dndContext?: boolean;
    suspense?: boolean;
  } = {}
) => {
  const {
    initialTasks,
    initialFilters,
    dndContext = false,
    suspense = false,
    ...renderOptions
  } = options;

  const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
    <TestProvider
      initialTasks={initialTasks}
      initialFilters={initialFilters}
      dndContext={dndContext}
      suspense={suspense}
    >
      {children}
    </TestProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Export default TestWrapper
export default TestWrapper;