/**
 * Basic Test Suite
 *
 * Simple test to verify Jest infrastructure is working
 */

describe('Basic Jest Setup', () => {
  test('should add two numbers correctly', () => {
    const result = 2 + 3;
    expect(result).toBe(5);
  });

  test('should handle async operations', async () => {
    const promise = Promise.resolve('test');
    const result = await promise;
    expect(result).toBe('test');
  });

  test('should mock functions correctly', () => {
    const mockFn = jest.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});