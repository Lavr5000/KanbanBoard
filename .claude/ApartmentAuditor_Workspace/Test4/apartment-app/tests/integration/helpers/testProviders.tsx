/**
 * Test Providers Wrapper
 *
 * Provides all necessary providers for integration tests including:
 * - React Query
 * - Zustand stores
 * - SafeAreaProvider
 * - GestureHandlerRootView
 */

import React, { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUIStore, useProjectStore, useCheckpointStore } from '../../../services/store';

// Create a new QueryClient for each test to avoid state leakage
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0, // Previously cacheTime
    },
    mutations: {
      retry: false,
    },
  },
});

interface AllTheProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

/**
 * Wrapper component that provides all necessary providers
 * for integration testing
 */
export const AllTheProviders = ({
  children,
  queryClient = createTestQueryClient()
}: AllTheProvidersProps) => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

/**
 * Custom render function that includes all providers
 * Use this instead of RTL's render for integration tests
 */
export const renderWithProviders = (
  ui: ReactElement,
  options: {
    queryClient?: QueryClient;
    initialStoreState?: any;
  } = {}
) => {
  const { queryClient, initialStoreState } = options;

  // Reset all stores before rendering
  const projectStore = useProjectStore.getState();
  const checkpointStore = useCheckpointStore.getState();
  const uiStore = useUIStore.getState();

  // Reset store states
  projectStore.projects = [];
  projectStore.activeProjectId = null;
  checkpointStore.changes = {};
  checkpointStore.projectId = null;
  uiStore.finishMode = 'draft';
  uiStore.activeTab = 'objects';
  uiStore.isLoading = false;

  // Set initial store state if provided
  if (initialStoreState) {
    if (initialStoreState.project) {
      Object.assign(projectStore, initialStoreState.project);
    }
    if (initialStoreState.checkpoint) {
      Object.assign(checkpointStore, initialStoreState.checkpoint);
    }
    if (initialStoreState.ui) {
      Object.assign(uiStore, initialStoreState.ui);
    }
  }

  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders
        {...props}
        queryClient={queryClient || createTestQueryClient()}
      />
    ),
    ...options,
  });
};

/**
 * Create a test with providers and store state
 * Helper function for common test setup
 */
export const createTestWithProviders = (
  component: ReactElement,
  {
    initialStoreState,
    queryClient,
  }: {
    initialStoreState?: any;
    queryClient?: QueryClient;
  } = {}
) => {
  const testQueryClient = queryClient || createTestQueryClient();

  const rendered = renderWithProviders(component, {
    queryClient: testQueryClient,
    initialStoreState,
  });

  return {
    ...rendered,
    // Expose query client for test assertions
    queryClient: testQueryClient,
    // Expose stores for direct state inspection
    stores: {
      project: useProjectStore.getState(),
      checkpoint: useCheckpointStore.getState(),
      ui: useUIStore.getState(),
    },
  };
};

/**
 * Cleanup function to reset stores after tests
 * Call this in afterEach if needed
 */
export const cleanupTestProviders = () => {
  // Reset all Zustand stores
  const projectStore = useProjectStore.getState();
  const checkpointStore = useCheckpointStore.getState();
  const uiStore = useUIStore.getState();

  projectStore.projects = [];
  projectStore.activeProjectId = null;
  checkpointStore.changes = {};
  checkpointStore.projectId = null;
  uiStore.finishMode = 'draft';
  uiStore.activeTab = 'objects';
  uiStore.isLoading = false;

  // Clear any pending QueryClient operations
  jest.clearAllTimers();
};

export default AllTheProviders;