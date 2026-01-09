/**
 * Tests for useMediaQuery hook
 * Тестирование хука определения типа устройства
 */

import { renderHook, act } from '@testing-library/react';
import { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop } from '@/shared/lib/useMediaQuery';

describe('useMediaQuery', () => {
  let matchMediaMock: jest.Mock;
  let listeners: { [query: string]: ((e: MediaQueryListEvent) => void)[] };

  beforeEach(() => {
    listeners = {};

    matchMediaMock = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn((event: string, cb: (e: MediaQueryListEvent) => void) => {
        if (!listeners[query]) listeners[query] = [];
        listeners[query].push(cb);
      }),
      removeEventListener: jest.fn((event: string, cb: (e: MediaQueryListEvent) => void) => {
        if (listeners[query]) {
          listeners[query] = listeners[query].filter(l => l !== cb);
        }
      }),
      dispatchEvent: jest.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return default value initially', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)', { defaultValue: true }));

    expect(result.current).toBe(false); // matchMedia returns false by default
  });

  it('should return initial value when initializeWithValue is true', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: true,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    const { result } = renderHook(() =>
      useMediaQuery('(max-width: 768px)', { initializeWithValue: true })
    );

    expect(result.current).toBe(true);
  });

  it('should update when media query changes', () => {
    const query = '(max-width: 768px)';
    let changeHandler: ((e: MediaQueryListEvent) => void) | null = null;

    matchMediaMock.mockImplementation((q: string) => ({
      matches: false,
      media: q,
      addEventListener: jest.fn((event: string, cb: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') changeHandler = cb;
      }),
      removeEventListener: jest.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery(query));

    expect(result.current).toBe(false);

    // Simulate media query change
    if (changeHandler) {
      act(() => {
        changeHandler!({ matches: true } as MediaQueryListEvent);
      });
    }

    expect(result.current).toBe(true);
  });

  it('should cleanup listener on unmount', () => {
    const removeEventListener = jest.fn();
    matchMediaMock.mockImplementation(() => ({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener,
    }));

    const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'));

    unmount();

    expect(removeEventListener).toHaveBeenCalled();
  });
});

describe('useIsMobile', () => {
  it('should use correct breakpoint (max-width: 767px)', () => {
    const matchMediaMock = jest.fn().mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(matchMediaMock).toHaveBeenCalledWith('(max-width: 767px)');
    expect(result.current).toBe(true);
  });
});

describe('useIsTablet', () => {
  it('should use correct breakpoint (768px - 1023px)', () => {
    const matchMediaMock = jest.fn().mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });

    const { result } = renderHook(() => useIsTablet());

    expect(matchMediaMock).toHaveBeenCalledWith('(min-width: 768px) and (max-width: 1023px)');
    expect(result.current).toBe(true);
  });
});

describe('useIsDesktop', () => {
  it('should use correct breakpoint (min-width: 1024px)', () => {
    const matchMediaMock = jest.fn().mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });

    const { result } = renderHook(() => useIsDesktop());

    expect(matchMediaMock).toHaveBeenCalledWith('(min-width: 1024px)');
    expect(result.current).toBe(true);
  });
});

describe('Device Detection Combinations', () => {
  it('should correctly identify mobile device', () => {
    // Mock mobile screen
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn((query: string) => ({
        matches: query === '(max-width: 767px)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    });

    const { result: mobileResult } = renderHook(() => useIsMobile());
    const { result: tabletResult } = renderHook(() => useIsTablet());
    const { result: desktopResult } = renderHook(() => useIsDesktop());

    expect(mobileResult.current).toBe(true);
    expect(tabletResult.current).toBe(false);
    expect(desktopResult.current).toBe(false);
  });

  it('should correctly identify tablet device', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn((query: string) => ({
        matches: query === '(min-width: 768px) and (max-width: 1023px)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    });

    const { result: mobileResult } = renderHook(() => useIsMobile());
    const { result: tabletResult } = renderHook(() => useIsTablet());
    const { result: desktopResult } = renderHook(() => useIsDesktop());

    expect(mobileResult.current).toBe(false);
    expect(tabletResult.current).toBe(true);
    expect(desktopResult.current).toBe(false);
  });

  it('should correctly identify desktop device', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn((query: string) => ({
        matches: query === '(min-width: 1024px)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    });

    const { result: mobileResult } = renderHook(() => useIsMobile());
    const { result: tabletResult } = renderHook(() => useIsTablet());
    const { result: desktopResult } = renderHook(() => useIsDesktop());

    expect(mobileResult.current).toBe(false);
    expect(tabletResult.current).toBe(false);
    expect(desktopResult.current).toBe(true);
  });
});
