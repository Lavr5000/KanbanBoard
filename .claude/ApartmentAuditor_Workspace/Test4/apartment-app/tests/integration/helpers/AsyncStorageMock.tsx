/**
 * AsyncStorage Mock with State
 *
 * Enhanced AsyncStorage mock that maintains state between calls
 * for testing persistence scenarios in integration tests.
 */

export interface MockStorageState {
  [key: string]: string | null;
}

class AsyncStorageMock {
  private storage: MockStorageState = {};
  private operationLog: Array<{
    operation: 'setItem' | 'getItem' | 'removeItem' | 'multiSet' | 'multiGet' | 'clear';
    key?: string;
    keys?: string[];
    value?: string | null;
    values?: [string, string | null][];
    timestamp: number;
  }> = [];

  /**
   * Clear all storage and operation log
   */
  clear(): Promise<void> {
    this.storage = {};
    this.operationLog = [];
    return Promise.resolve();
  }

  /**
   * Get item from storage
   */
  getItem(key: string): Promise<string | null> {
    this.operationLog.push({
      operation: 'getItem',
      key,
      value: this.storage[key] ?? null,
      timestamp: Date.now(),
    });

    return Promise.resolve(this.storage[key] ?? null);
  }

  /**
   * Set item in storage
   */
  setItem(key: string, value: string): Promise<void> {
    this.storage[key] = value;
    this.operationLog.push({
      operation: 'setItem',
      key,
      value,
      timestamp: Date.now(),
    });

    return Promise.resolve();
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): Promise<void> {
    delete this.storage[key];
    this.operationLog.push({
      operation: 'removeItem',
      key,
      timestamp: Date.now(),
    });

    return Promise.resolve();
  }

  /**
   * Set multiple items
   */
  multiSet(keyValuePairs: [string, string][]): Promise<void> {
    keyValuePairs.forEach(([key, value]) => {
      this.storage[key] = value;
    });

    this.operationLog.push({
      operation: 'multiSet',
      keys: keyValuePairs.map(([key]) => key),
      values: keyValuePairs,
      timestamp: Date.now(),
    });

    return Promise.resolve();
  }

  /**
   * Get multiple items
   */
  multiGet(keys: string[]): Promise<[string, string | null][]> {
    const results = keys.map(key => [key, this.storage[key] ?? null] as [string, string | null]);

    this.operationLog.push({
      operation: 'multiGet',
      keys,
      values: results,
      timestamp: Date.now(),
    });

    return Promise.resolve(results);
  }

  /**
   * Get all keys in storage
   */
  getAllKeys(): Promise<string[]> {
    const keys = Object.keys(this.storage);
    this.operationLog.push({
      operation: 'getAllKeys',
      keys,
      timestamp: Date.now(),
    });

    return Promise.resolve(keys);
  }

  /**
   * Get current storage state (for testing)
   */
  getStorageState(): MockStorageState {
    return { ...this.storage };
  }

  /**
   * Set initial storage state (for test setup)
   */
  setStorageState(state: MockStorageState): void {
    this.storage = { ...state };
  }

  /**
   * Get operation log (for testing)
   */
  getOperationLog() {
    return [...this.operationLog];
  }

  /**
   * Clear operation log (for test setup)
   */
  clearOperationLog(): void {
    this.operationLog = [];
  }

  /**
   * Assert that a specific operation was called
   */
  expectOperation(
    operation: string,
    key?: string,
    value?: string | null
  ) {
    const matchingOps = this.operationLog.filter(
      op => op.operation === operation &&
      (!key || op.key === key) &&
      (value === undefined || op.value === value)
    );

    if (matchingOps.length === 0) {
      throw new Error(
        `Expected AsyncStorage operation: ${operation}(${key ? `key: "${key}"` : ''}${value !== undefined ? `, value: "${value}"` : ''}) not found. ` +
        `Operation log: ${JSON.stringify(this.operationLog, null, 2)}`
      );
    }

    return matchingOps;
  }

  /**
   * Assert that data was persisted correctly
   */
  expectPersisted(key: string, expectedValue: string) {
    const actualValue = this.storage[key];
    if (actualValue !== expectedValue) {
      throw new Error(
        `Expected persisted data for key "${key}": "${expectedValue}", but got "${actualValue}"`
      );
    }
  }

  /**
   * Simulate app restart by resetting memory but keeping AsyncStorage
   * Useful for testing persistence across app sessions
   */
  simulateAppRestart(): void {
    // Keep the storage state but clear operation log
    // This simulates starting the app fresh but with persisted data
    this.clearOperationLog();
  }

  /**
   * Get store data in parsed format
   */
  getParsedStoreData<T = any>(key: string): T | null {
    const value = this.storage[key];
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch (error) {
      throw new Error(`Failed to parse stored data for key "${key}": ${error}`);
    }
  }

  /**
   * Set store data in parsed format
   */
  setParsedStoreData<T = any>(key: string, data: T): void {
    const value = JSON.stringify(data);
    this.setItem(key, value);
  }
}

// Create global mock instance
export const mockAsyncStorage = new AsyncStorageMock();

// Setup Jest mock to use our instance
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn((key: string, value: string) => mockAsyncStorage.setItem(key, value)),
  getItem: jest.fn((key: string) => mockAsyncStorage.getItem(key)),
  removeItem: jest.fn((key: string) => mockAsyncStorage.removeItem(key)),
  multiSet: jest.fn((keyValuePairs: [string, string][]) => mockAsyncStorage.multiSet(keyValuePairs)),
  multiGet: jest.fn((keys: string[]) => mockAsyncStorage.multiGet(keys)),
  getAllKeys: jest.fn(() => mockAsyncStorage.getAllKeys()),
  clear: jest.fn(() => mockAsyncStorage.clear()),
}));

/**
 * Setup AsyncStorage mock for testing
 * Call this in beforeEach to ensure clean state
 */
export const setupAsyncStorageMock = (initialState?: MockStorageState) => {
  mockAsyncStorage.clear();

  if (initialState) {
    mockAsyncStorage.setStorageState(initialState);
  }

  return mockAsyncStorage;
};

/**
 * Create common test scenarios for AsyncStorage
 */
export const createStorageScenarios = {
  // Fresh app with no persisted data
  freshApp: () => setupAsyncStorageMock(),

  // App with existing projects
  withExistingProjects: (projects: any[]) => {
    return setupAsyncStorageMock({
      'project-store': JSON.stringify({
        state: { projects, activeProjectId: null },
        version: 0
      })
    });
  },

  // App with checkpoint changes
  withCheckpointChanges: (projectId: string, changes: any) => {
    return setupAsyncStorageMock({
      'checkpoint-store': JSON.stringify({
        state: { changes, projectId },
        version: 0
      })
    });
  },

  // App with UI state
  withUIState: (uiState: any) => {
    return setupAsyncStorageMock({
      'ui-store': JSON.stringify({
        state: uiState,
        version: 0
      })
    });
  },
};

export default mockAsyncStorage;