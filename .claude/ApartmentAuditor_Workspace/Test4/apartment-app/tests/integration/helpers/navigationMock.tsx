/**
 * Navigation Mock Helpers
 *
 * Utilities for testing Expo Router navigation in integration tests.
 * Provides helpers to:
 * - Track navigation calls
 * - Assert navigation sequences
 * - Mock route parameters
 */

import { useRouter, useLocalSearchParams } from 'expo-router';

// Track navigation calls globally
export interface NavigationCall {
  method: 'push' | 'replace' | 'back' | 'navigate';
  pathname?: string;
  params?: any;
  timestamp: number;
}

class NavigationTracker {
  private calls: NavigationCall[] = [];
  private currentRoute: { pathname: string; params: any } = {
    pathname: '/',
    params: {},
  };

  /**
   * Record a navigation call
   */
  recordCall(call: Omit<NavigationCall, 'timestamp'>) {
    this.calls.push({
      ...call,
      timestamp: Date.now(),
    });

    // Update current route for push/replace/navigate
    if (call.pathname) {
      this.currentRoute = {
        pathname: call.pathname,
        params: call.params || {},
      };
    }

    // For back navigation, we don't know the previous route without history
    // In real app this would be handled by router state
    if (call.method === 'back') {
      this.currentRoute.pathname = '/'; // Default fallback
    }
  }

  /**
   * Get all navigation calls
   */
  getCalls(): NavigationCall[] {
    return [...this.calls];
  }

  /**
   * Get calls for a specific method
   */
  getCallsByMethod(method: NavigationCall['method']): NavigationCall[] {
    return this.calls.filter(call => call.method === method);
  }

  /**
   * Get the current route state
   */
  getCurrentRoute() {
    return { ...this.currentRoute };
  }

  /**
   * Clear all navigation history
   */
  clear() {
    this.calls = [];
    this.currentRoute = { pathname: '/', params: {} };
  }

  /**
   * Assert that a specific navigation call was made
   */
  expectNavigationCall(
    method: NavigationCall['method'],
    pathname?: string,
    params?: any
  ) {
    const matchingCalls = this.calls.filter(
      call => call.method === method &&
      (!pathname || call.pathname === pathname) &&
      (!params || JSON.stringify(call.params) === JSON.stringify(params))
    );

    if (matchingCalls.length === 0) {
      const callDetails = [];
      if (pathname) callDetails.push(`pathname: "${pathname}"`);
      if (params) callDetails.push(`params: ${JSON.stringify(params)}`);

      throw new Error(
        `Expected navigation call: ${method}(${callDetails.join(', ')}) not found. ` +
        `Actual calls: ${JSON.stringify(this.calls, null, 2)}`
      );
    }

    return matchingCalls;
  }

  /**
   * Assert navigation sequence
   */
  expectNavigationSequence(expectedCalls: Array<{
    method: NavigationCall['method'];
    pathname?: string;
    params?: any;
  }>) {
    if (this.calls.length < expectedCalls.length) {
      throw new Error(
        `Expected ${expectedCalls.length} navigation calls, but got ${this.calls.length}`
      );
    }

    expectedCalls.forEach((expected, index) => {
      const actual = this.calls[index];

      if (actual.method !== expected.method) {
        throw new Error(
          `Navigation call ${index + 1}: expected method "${expected.method}", ` +
          `got "${actual.method}"`
        );
      }

      if (expected.pathname && actual.pathname !== expected.pathname) {
        throw new Error(
          `Navigation call ${index + 1}: expected pathname "${expected.pathname}", ` +
          `got "${actual.pathname}"`
        );
      }

      if (expected.params && JSON.stringify(actual.params) !== JSON.stringify(expected.params)) {
        throw new Error(
          `Navigation call ${index + 1}: expected params ${JSON.stringify(expected.params)}, ` +
          `got ${JSON.stringify(actual.params)}`
        );
      }
    });
  }
}

// Global navigation tracker instance
export const navigationTracker = new NavigationTracker();

// Mock router functions that use the tracker
export const createMockRouter = () => ({
  push: jest.fn((pathname: string, params?: any) => {
    navigationTracker.recordCall({ method: 'push', pathname, params });
  }),
  replace: jest.fn((pathname: string, params?: any) => {
    navigationTracker.recordCall({ method: 'replace', pathname, params });
  }),
  back: jest.fn(() => {
    navigationTracker.recordCall({ method: 'back' });
  }),
  navigate: jest.fn((pathname: string, params?: any) => {
    navigationTracker.recordCall({ method: 'navigate', pathname, params });
  }),
});

// Mock search params function
export const createMockSearchParams = (params: any = {}) => () => params;

/**
 * Setup navigation mocks for testing
 * Call this in beforeEach of your tests
 */
export const setupNavigationMocks = (
  initialPathname: string = '/',
  initialParams: any = {}
) => {
  // Clear previous navigation history
  navigationTracker.clear();

  // Mock useRouter
  const mockRouter = createMockRouter();
  (useRouter as jest.Mock).mockReturnValue(mockRouter);

  // Mock useLocalSearchParams
  const mockSearchParams = createMockSearchParams(initialParams);
  (useLocalSearchParams as jest.Mock).mockImplementation(mockSearchParams);

  return {
    mockRouter,
    tracker: navigationTracker,
    currentPath: initialPathname,
    params: initialParams,
  };
};

/**
 * Create mock navigation for specific scenarios
 */
export const createScenarioMocks = {
  // Starting from objects list
  objectsList: () => setupNavigationMocks('/(tabs)/objects'),

  // Starting from project detail
  projectDetail: (projectId: string) =>
    setupNavigationMocks('/(tabs)/objects/[id]', { id: projectId }),

  // Starting from category checklist
  categoryChecklist: (projectId: string, categoryId: string) =>
    setupNavigationMocks('/(tabs)/objects/[id]/check/[categoryId]', {
      id: projectId,
      categoryId
    }),

  // Starting from checkpoint detail
  checkpointDetail: (projectId: string, categoryId: string, checkpointId: string) =>
    setupNavigationMocks('/(tabs)/objects/[id]/check/[categoryId]/[checkpointId]', {
      id: projectId,
      categoryId,
      checkpointId
    }),
};

export default navigationTracker;