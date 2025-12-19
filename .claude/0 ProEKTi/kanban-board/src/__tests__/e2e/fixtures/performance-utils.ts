// Performance measurement utilities for E2E testing

export interface PerformanceMetrics {
  duration: number;
  memoryUsage?: number;
  renderCount?: number;
  operationsPerSecond?: number;
}

export interface PerformanceThresholds {
  maxDuration: number;
  maxMemoryIncrease?: number;
  minOperationsPerSecond?: number;
}

// Measure performance of async operations
export const measurePerformance = async <T>(
  operation: () => Promise<T>,
  thresholds?: Partial<PerformanceThresholds>
): Promise<{ result: T; metrics: PerformanceMetrics; passed: boolean }> => {
  const start = performance.now();
  const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

  const result = await operation();

  const end = performance.now();
  const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;

  const metrics: PerformanceMetrics = {
    duration: end - start,
    memoryUsage: finalMemory - initialMemory,
  };

  const defaultThresholds: PerformanceThresholds = {
    maxDuration: 1000, // 1 second default
    maxMemoryIncrease: 10 * 1024 * 1024, // 10MB default
    minOperationsPerSecond: 60, // 60 ops/sec default
  };

  const finalThresholds = { ...defaultThresholds, ...thresholds };

  const passed =
    metrics.duration <= finalThresholds.maxDuration &&
    (!metrics.memoryUsage || metrics.memoryUsage <= (finalThresholds.maxMemoryIncrease || Infinity));

  return { result, metrics, passed };
};

// Measure performance of synchronous operations
export const measureSyncPerformance = <T>(
  operation: () => T,
  iterations: number = 1,
  thresholds?: Partial<PerformanceThresholds>
): { result: T[]; metrics: PerformanceMetrics; passed: boolean } => {
  const start = performance.now();
  const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

  const results: T[] = [];
  for (let i = 0; i < iterations; i++) {
    results.push(operation());
  }

  const end = performance.now();
  const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;

  const metrics: PerformanceMetrics = {
    duration: end - start,
    memoryUsage: finalMemory - initialMemory,
    operationsPerSecond: iterations / ((end - start) / 1000),
  };

  const defaultThresholds: PerformanceThresholds = {
    maxDuration: 1000,
    maxMemoryIncrease: 10 * 1024 * 1024,
    minOperationsPerSecond: 60,
  };

  const finalThresholds = { ...defaultThresholds, ...thresholds };

  const passed =
    metrics.duration <= finalThresholds.maxDuration &&
    (!metrics.memoryUsage || metrics.memoryUsage <= (finalThresholds.maxMemoryIncrease || Infinity)) &&
    (!metrics.operationsPerSecond || metrics.operationsPerSecond >= (finalThresholds.minOperationsPerSecond || 0));

  return { result: results, metrics, passed };
};

// Jest matcher for performance assertions
export const toBePerformant = (
  received: PerformanceMetrics,
  thresholds: PerformanceThresholds
) => {
  const durationCheck = received.duration <= thresholds.maxDuration;
  const memoryCheck = !received.memoryUsage || received.memoryUsage <= (thresholds.maxMemoryIncrease || Infinity);
  const opsCheck = !received.operationsPerSecond || received.operationsPerSecond >= (thresholds.minOperationsPerSecond || 0);

  if (durationCheck && memoryCheck && opsCheck) {
    return {
      message: () => `Performance metrics are within acceptable thresholds`,
      pass: true,
    };
  }

  const issues = [];
  if (!durationCheck) issues.push(`duration ${received.duration.toFixed(2)}ms exceeds threshold of ${thresholds.maxDuration}ms`);
  if (!memoryCheck && received.memoryUsage) issues.push(`memory usage ${(received.memoryUsage / 1024 / 1024).toFixed(2)}MB exceeds threshold of ${(thresholds.maxMemoryIncrease! / 1024 / 1024).toFixed(2)}MB`);
  if (!opsCheck && received.operationsPerSecond) issues.push(`operations per second ${received.operationsPerSecond.toFixed(2)} below threshold of ${thresholds.minOperationsPerSecond}`);

  return {
    message: () => `Performance issues detected: ${issues.join(', ')}`,
    pass: false,
  };
};

// Mock performance.now for consistent testing
export const createMockPerformance = (defaultDuration: number = 50) => {
  let currentTime = 0;

  return {
    now: () => {
      currentTime += defaultDuration;
      return currentTime;
    },
    reset: () => {
      currentTime = 0;
    },
    setNextDuration: (duration: number) => {
      currentTime += duration;
    },
  };
};

// Memory leak detection
export const detectMemoryLeaks = async (
  operation: () => Promise<void>,
  iterations: number = 5
): Promise<{ hasLeak: boolean; memoryGrowth: number[] }> => {
  const memoryReadings: number[] = [];

  for (let i = 0; i < iterations; i++) {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const beforeMemory = (performance as any).memory?.usedJSHeapSize || 0;
    await operation();

    // Force garbage collection again
    if (global.gc) {
      global.gc();
    }

    const afterMemory = (performance as any).memory?.usedJSHeapSize || 0;
    memoryReadings.push(afterMemory - beforeMemory);

    // Small delay between iterations
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Check if memory growth is consistently positive
  const hasLeak = memoryReadings.every(reading => reading > 0);

  return {
    hasLeak,
    memoryGrowth: memoryReadings,
  };
};

// Batch performance testing
export const runPerformanceSuite = async (
  tests: Array<{
    name: string;
    operation: () => Promise<void>;
    thresholds?: Partial<PerformanceThresholds>;
  }>
) => {
  const results = [];

  for (const test of tests) {
    try {
      const { metrics, passed } = await measurePerformance(
        test.operation,
        test.thresholds
      );

      results.push({
        name: test.name,
        metrics,
        passed,
        error: null,
      });
    } catch (error) {
      results.push({
        name: test.name,
        metrics: { duration: 0 },
        passed: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
};

// Performance regression detection
export const detectPerformanceRegression = (
  currentMetrics: PerformanceMetrics,
  baselineMetrics: PerformanceMetrics,
  tolerancePercent: number = 10
): { hasRegression: boolean; regressionPercent: number } => {
  const durationIncrease = ((currentMetrics.duration - baselineMetrics.duration) / baselineMetrics.duration) * 100;

  let memoryIncrease = 0;
  if (currentMetrics.memoryUsage && baselineMetrics.memoryUsage) {
    memoryIncrease = ((currentMetrics.memoryUsage - baselineMetrics.memoryUsage) / baselineMetrics.memoryUsage) * 100;
  }

  const hasRegression = durationIncrease > tolerancePercent || memoryIncrease > tolerancePercent;
  const regressionPercent = Math.max(durationIncrease, memoryIncrease);

  return {
    hasRegression,
    regressionPercent,
  };
};

// Performance profiling utility
export class PerformanceProfiler {
  private measurements: Array<{ name: string; duration: number; timestamp: number }> = [];

  start(name: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.measurements.push({
        name,
        duration,
        timestamp: endTime,
      });
    };
  }

  getMeasurement(name: string): { name: string; duration: number; timestamp: number } | undefined {
    return this.measurements.find(m => m.name === name);
  }

  getAllMeasurements(): Array<{ name: string; duration: number; timestamp: number }> {
    return [...this.measurements];
  }

  getTotalDuration(): number {
    return this.measurements.reduce((total, m) => total + m.duration, 0);
  }

  getAverageDuration(): number {
    return this.measurements.length > 0 ? this.getTotalDuration() / this.measurements.length : 0;
  }

  reset(): void {
    this.measurements = [];
  }

  getReport(): string {
    if (this.measurements.length === 0) {
      return 'No performance measurements recorded.';
    }

    const report = [
      'Performance Profile Report',
      '==========================',
      `Total measurements: ${this.measurements.length}`,
      `Total duration: ${this.getTotalDuration().toFixed(2)}ms`,
      `Average duration: ${this.getAverageDuration().toFixed(2)}ms`,
      '',
      'Individual measurements:',
      ...this.measurements.map(m => `  ${m.name}: ${m.duration.toFixed(2)}ms`),
    ];

    return report.join('\n');
  }
}

// ===== ADVANCED PERFORMANCE UTILITIES (Phase 4) =====

export interface AdvancedPerformanceMetrics extends PerformanceMetrics {
  renderTime?: number;
  domNodes?: number;
  eventListeners?: number;
  memoryPressure?: number;
  frameRate?: number;
}

export interface ScalabilityMetrics {
  datasetSize: number;
  renderDuration: number;
  operationDuration: number;
  memoryUsage: number;
  scalability: number; // operations per second per 100 items
}

export interface MemoryLeakResults {
  leaked: boolean;
  avgMemoryIncrease: number;
  maxMemoryIncrease: number;
  samples: number[];
  growthRate: number;
}

// Enhanced memory leak detector for Phase 4
export class MemoryLeakDetector {
  private samples: number[] = [];
  private startTime: number = 0;
  private name: string;

  constructor(name: string = 'Memory Leak Detection') {
    this.name = name;
  }

  start(): void {
    this.startTime = performance.now();
    this.samples = [];

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }

  check(): { leaked: boolean; currentIncrease: number } {
    const currentMemory = (performance as any).memory?.usedJSHeapSize || 0;
    this.samples.push(currentMemory);

    if (this.samples.length < 2) {
      return { leaked: false, currentIncrease: 0 };
    }

    const initialMemory = this.samples[0];
    const currentIncrease = currentMemory - initialMemory;
    const leaked = currentIncrease > 5 * 1024 * 1024; // 5MB threshold

    return { leaked, currentIncrease };
  }

  mark(name: string): void {
    const currentMemory = (performance as any).memory?.usedJSHeapSize || 0;
    this.samples.push(currentMemory);
  }

  end(): MemoryLeakResults {
    if (this.samples.length < 2) {
      return {
        leaked: false,
        avgMemoryIncrease: 0,
        maxMemoryIncrease: 0,
        samples: [],
        growthRate: 0,
      };
    }

    const initialMemory = this.samples[0];
    const finalMemory = this.samples[this.samples.length - 1];
    const maxMemory = Math.max(...this.samples);

    const increases = this.samples.slice(1).map((sample, index) => sample - this.samples[index]);
    const avgIncrease = increases.reduce((sum, inc) => sum + inc, 0) / increases.length;

    const duration = performance.now() - this.startTime;
    const growthRate = (finalMemory - initialMemory) / duration;

    return {
      leaked: (finalMemory - initialMemory) > 10 * 1024 * 1024, // 10MB threshold
      avgMemoryIncrease: avgIncrease,
      maxMemoryIncrease: maxMemory - initialMemory,
      samples: this.samples,
      growthRate,
    };
  }

  getResults(): MemoryLeakResults {
    return this.end();
  }

  reset(): void {
    this.samples = [];
    this.startTime = 0;
  }
}

// Enhanced performance measurement for Phase 4
export const measureAdvancedPerformance = async <T>(
  operation: () => Promise<T>,
  options: {
    includeDOMMetrics?: boolean;
    includeMemoryMetrics?: boolean;
    includeFrameRate?: boolean;
    thresholds?: Partial<PerformanceThresholds>;
  } = {}
): Promise<{ result: T; metrics: AdvancedPerformanceMetrics; passed: boolean }> => {
  const {
    includeDOMMetrics = false,
    includeMemoryMetrics = true,
    includeFrameRate = false,
    thresholds
  } = options;

  const start = performance.now();
  const initialMemory = includeMemoryMetrics ? (performance as any).memory?.usedJSHeapSize || 0 : 0;
  const initialDOMNodes = includeDOMMetrics ? document.querySelectorAll('*').length : 0;

  // Frame rate measurement
  let frameCount = 0;
  let frameStartTime = 0;
  let frameRate = 0;

  if (includeFrameRate) {
    frameStartTime = performance.now();
    const countFrame = () => {
      frameCount++;
      if (performance.now() - frameStartTime < 1000) {
        requestAnimationFrame(countFrame);
      } else {
        frameRate = frameCount;
      }
    };
    requestAnimationFrame(countFrame);
  }

  const result = await operation();

  const end = performance.now();
  const finalMemory = includeMemoryMetrics ? (performance as any).memory?.usedJSHeapSize || 0 : 0;
  const finalDOMNodes = includeDOMMetrics ? document.querySelectorAll('*').length : 0;

  const metrics: AdvancedPerformanceMetrics = {
    duration: end - start,
    memoryUsage: finalMemory - initialMemory,
    renderTime: end - start, // Simplified - actual render time would need more complex measurement
    domNodes: finalDOMNodes - initialDOMNodes,
    frameRate,
  };

  const defaultThresholds: PerformanceThresholds = {
    maxDuration: 3000, // More lenient for advanced operations
    maxMemoryIncrease: 50 * 1024 * 1024, // 50MB
    minOperationsPerSecond: 30, // Lower threshold for complex operations
  };

  const finalThresholds = { ...defaultThresholds, ...thresholds };

  const passed =
    metrics.duration <= finalThresholds.maxDuration &&
    (!metrics.memoryUsage || metrics.memoryUsage <= (finalThresholds.maxMemoryIncrease || Infinity));

  return { result, metrics, passed };
};

// Scalability testing utility
export const measureScalability = async (
  datasetSizes: number[],
  operation: (size: number) => Promise<void>
): Promise<ScalabilityMetrics[]> => {
  const results: ScalabilityMetrics[] = [];

  for (const size of datasetSizes) {
    const start = performance.now();
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

    await operation(size);

    const end = performance.now();
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;

    results.push({
      datasetSize: size,
      renderDuration: end - start,
      operationDuration: end - start, // Simplified
      memoryUsage: finalMemory - initialMemory,
      scalability: (size / ((end - start) / 1000)) * 100, // ops per 100 items per second
    });
  }

  return results;
};

// Memory usage optimization testing
export const testMemoryOptimization = async (
  operations: Array<{
    name: string;
    operation: () => Promise<void>;
    expectedMemoryLimit: number; // in bytes
  }>
): Promise<Array<{ name: string; memoryUsage: number; withinLimit: boolean }>> => {
  const results = [];

  for (const test of operations) {
    // Force garbage collection before test
    if (global.gc) {
      global.gc();
    }

    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    await test.operation();

    // Force garbage collection after test
    if (global.gc) {
      global.gc();
    }

    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryUsage = finalMemory - initialMemory;
    const withinLimit = memoryUsage <= test.expectedMemoryLimit;

    results.push({
      name: test.name,
      memoryUsage,
      withinLimit,
    });
  }

  return results;
};

// Concurrent performance testing
export const measureConcurrentPerformance = async <T>(
  operations: Array<() => Promise<T>>,
  maxConcurrency: number = 5
): Promise<{
  results: T[];
  metrics: AdvancedPerformanceMetrics;
  concurrency: number;
  throughput: number;
}> => {
  const start = performance.now();
  const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

  // Execute operations concurrently with limited concurrency
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const operation of operations) {
    const promise = operation().then(result => {
      results.push(result);
    });

    executing.push(promise);

    // Limit concurrency
    if (executing.length >= maxConcurrency) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === Promise.race(executing)), 1);
    }
  }

  await Promise.all(executing);

  const end = performance.now();
  const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;

  const metrics: AdvancedPerformanceMetrics = {
    duration: end - start,
    memoryUsage: finalMemory - initialMemory,
    operationsPerSecond: operations.length / ((end - start) / 1000),
  };

  return {
    results,
    metrics,
    concurrency: Math.min(maxConcurrency, operations.length),
    throughput: operations.length / ((end - start) / 1000),
  };
};

// Resource usage monitoring
export interface ResourceUsageMetrics {
  cpuUsage?: number;
  memoryUsage: number;
  domNodes: number;
  eventListeners: number;
  networkRequests?: number;
}

export const monitorResourceUsage = (duration: number = 5000): Promise<ResourceUsageMetrics> => {
  return new Promise((resolve) => {
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const startNodes = document.querySelectorAll('*').length;
    let maxMemory = startMemory;
    let requestCount = 0;

    // Monitor resource usage over time
    const interval = setInterval(() => {
      const currentMemory = (performance as any).memory?.usedJSHeapSize || 0;
      maxMemory = Math.max(maxMemory, currentMemory);
    }, 100);

    // Count network requests (simplified)
    const originalFetch = global.fetch;
    global.fetch = (...args) => {
      requestCount++;
      return originalFetch(...args);
    };

    setTimeout(() => {
      clearInterval(interval);
      global.fetch = originalFetch;

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const finalNodes = document.querySelectorAll('*').length;

      resolve({
        memoryUsage: finalMemory - startMemory,
        domNodes: finalNodes - startNodes,
        eventListeners: 0, // Would need more complex tracking
        networkRequests: requestCount,
        maxMemory: maxMemory - startMemory,
      } as any);
    }, duration);
  });
};

// Performance threshold validator
export const validatePerformanceThresholds = (
  metrics: AdvancedPerformanceMetrics,
  thresholds: Partial<PerformanceThresholds>
): { valid: boolean; violations: string[] } => {
  const violations: string[] = [];
  const defaultThresholds = {
    maxDuration: 3000,
    maxMemoryIncrease: 50 * 1024 * 1024,
    minOperationsPerSecond: 30,
  };

  const finalThresholds = { ...defaultThresholds, ...thresholds };

  if (metrics.duration > finalThresholds.maxDuration!) {
    violations.push(`Duration ${metrics.duration.toFixed(2)}ms exceeds threshold ${finalThresholds.maxDuration}ms`);
  }

  if (metrics.memoryUsage && metrics.memoryUsage > (finalThresholds.maxMemoryIncrease || Infinity)) {
    violations.push(`Memory usage ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB exceeds threshold ${((finalThresholds.maxMemoryIncrease || 0) / 1024 / 1024).toFixed(2)}MB`);
  }

  if (metrics.operationsPerSecond && metrics.operationsPerSecond < (finalThresholds.minOperationsPerSecond || 0)) {
    violations.push(`Operations per second ${metrics.operationsPerSecond.toFixed(2)} below threshold ${finalThresholds.minOperationsPerSecond}`);
  }

  return {
    valid: violations.length === 0,
    violations,
  };
};

// Export enhanced performance utilities
export const advancedPerformanceUtils = {
  measureAdvancedPerformance,
  measureScalability,
  testMemoryOptimization,
  measureConcurrentPerformance,
  monitorResourceUsage,
  validatePerformanceThresholds,
  MemoryLeakDetector,
};

// Export default performance utilities (enhanced)
export default {
  measurePerformance,
  measureSyncPerformance,
  toBePerformant,
  detectMemoryLeaks,
  runPerformanceSuite,
  PerformanceProfiler,
  ...advancedPerformanceUtils,
};