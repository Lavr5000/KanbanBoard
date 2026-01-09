/**
 * Tests for useSwipeGestures hook
 * Тестирование хука обработки свайп-жестов
 */

import { renderHook, act } from '@testing-library/react';
import { useSwipeGestures, useMouseSwipeGestures } from '@/features/swipe-handler/hooks/useSwipeGestures';

describe('useSwipeGestures', () => {
  beforeEach(() => {
    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      value: jest.fn().mockReturnValue(true),
    });
  });

  describe('Basic Swipe Detection', () => {
    it('should detect swipe right', () => {
      const onSwipeRight = jest.fn();

      const { result } = renderHook(() =>
        useSwipeGestures({
          onSwipeRight,
          threshold: 60,
        })
      );

      // Simulate touch start
      act(() => {
        result.current.onTouchStart({
          changedTouches: [{ screenX: 100, screenY: 100 }],
        } as unknown as React.TouchEvent);
      });

      // Simulate touch move
      act(() => {
        result.current.onTouchMove({
          changedTouches: [{ screenX: 200, screenY: 100 }],
        } as unknown as React.TouchEvent);
      });

      // Simulate touch end (swipe right: deltaX = 100 > threshold of 60)
      act(() => {
        result.current.onTouchEnd({
          changedTouches: [{ screenX: 200, screenY: 100 }],
          preventDefault: jest.fn(),
        } as unknown as React.TouchEvent);
      });

      expect(onSwipeRight).toHaveBeenCalled();
    });

    it('should detect swipe left', () => {
      const onSwipeLeft = jest.fn();

      const { result } = renderHook(() =>
        useSwipeGestures({
          onSwipeLeft,
          threshold: 60,
        })
      );

      act(() => {
        result.current.onTouchStart({
          changedTouches: [{ screenX: 200, screenY: 100 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.onTouchMove({
          changedTouches: [{ screenX: 100, screenY: 100 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.onTouchEnd({
          changedTouches: [{ screenX: 100, screenY: 100 }],
          preventDefault: jest.fn(),
        } as unknown as React.TouchEvent);
      });

      expect(onSwipeLeft).toHaveBeenCalled();
    });

    it('should detect swipe up', () => {
      const onSwipeUp = jest.fn();

      const { result } = renderHook(() =>
        useSwipeGestures({
          onSwipeUp,
          threshold: 60,
        })
      );

      act(() => {
        result.current.onTouchStart({
          changedTouches: [{ screenX: 100, screenY: 200 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.onTouchMove({
          changedTouches: [{ screenX: 100, screenY: 100 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.onTouchEnd({
          changedTouches: [{ screenX: 100, screenY: 100 }],
          preventDefault: jest.fn(),
        } as unknown as React.TouchEvent);
      });

      expect(onSwipeUp).toHaveBeenCalled();
    });

    it('should detect swipe down', () => {
      const onSwipeDown = jest.fn();

      const { result } = renderHook(() =>
        useSwipeGestures({
          onSwipeDown,
          threshold: 60,
        })
      );

      act(() => {
        result.current.onTouchStart({
          changedTouches: [{ screenX: 100, screenY: 100 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.onTouchMove({
          changedTouches: [{ screenX: 100, screenY: 200 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.onTouchEnd({
          changedTouches: [{ screenX: 100, screenY: 200 }],
          preventDefault: jest.fn(),
        } as unknown as React.TouchEvent);
      });

      expect(onSwipeDown).toHaveBeenCalled();
    });
  });

  describe('Threshold Behavior', () => {
    it('should not trigger swipe if below threshold', () => {
      const onSwipeRight = jest.fn();

      const { result } = renderHook(() =>
        useSwipeGestures({
          onSwipeRight,
          threshold: 60,
        })
      );

      act(() => {
        result.current.onTouchStart({
          changedTouches: [{ screenX: 100, screenY: 100 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.onTouchMove({
          changedTouches: [{ screenX: 130, screenY: 100 }], // Only 30px, below 60 threshold
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.onTouchEnd({
          changedTouches: [{ screenX: 130, screenY: 100 }],
          preventDefault: jest.fn(),
        } as unknown as React.TouchEvent);
      });

      expect(onSwipeRight).not.toHaveBeenCalled();
    });

    it('should respect custom threshold', () => {
      const onSwipeRight = jest.fn();

      const { result } = renderHook(() =>
        useSwipeGestures({
          onSwipeRight,
          threshold: 30, // Lower threshold
        })
      );

      act(() => {
        result.current.onTouchStart({
          changedTouches: [{ screenX: 100, screenY: 100 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.onTouchMove({
          changedTouches: [{ screenX: 135, screenY: 100 }], // 35px, above 30 threshold
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.onTouchEnd({
          changedTouches: [{ screenX: 135, screenY: 100 }],
          preventDefault: jest.fn(),
        } as unknown as React.TouchEvent);
      });

      expect(onSwipeRight).toHaveBeenCalled();
    });
  });

  describe('onSwipeMove Callback', () => {
    it('should call onSwipeMove with delta values', () => {
      const onSwipeMove = jest.fn();

      const { result } = renderHook(() =>
        useSwipeGestures({
          onSwipeMove,
        })
      );

      act(() => {
        result.current.onTouchStart({
          changedTouches: [{ screenX: 100, screenY: 100 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.onTouchMove({
          changedTouches: [{ screenX: 150, screenY: 120 }],
        } as unknown as React.TouchEvent);
      });

      expect(onSwipeMove).toHaveBeenCalledWith(50, 20);
    });

    it('should not call onSwipeMove for small movements (< 5px)', () => {
      const onSwipeMove = jest.fn();

      const { result } = renderHook(() =>
        useSwipeGestures({
          onSwipeMove,
        })
      );

      act(() => {
        result.current.onTouchStart({
          changedTouches: [{ screenX: 100, screenY: 100 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.onTouchMove({
          changedTouches: [{ screenX: 102, screenY: 101 }], // Only 2px horizontal, 1px vertical
        } as unknown as React.TouchEvent);
      });

      expect(onSwipeMove).not.toHaveBeenCalled();
    });
  });

  describe('Dominant Axis Detection', () => {
    it('should trigger horizontal swipe when deltaX > deltaY', () => {
      const onSwipeRight = jest.fn();
      const onSwipeDown = jest.fn();

      const { result } = renderHook(() =>
        useSwipeGestures({
          onSwipeRight,
          onSwipeDown,
          threshold: 60,
        })
      );

      act(() => {
        result.current.onTouchStart({
          changedTouches: [{ screenX: 100, screenY: 100 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.onTouchMove({
          changedTouches: [{ screenX: 200, screenY: 130 }], // deltaX=100, deltaY=30
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.onTouchEnd({
          changedTouches: [{ screenX: 200, screenY: 130 }],
          preventDefault: jest.fn(),
        } as unknown as React.TouchEvent);
      });

      expect(onSwipeRight).toHaveBeenCalled();
      expect(onSwipeDown).not.toHaveBeenCalled();
    });

    it('should trigger vertical swipe when deltaY > deltaX', () => {
      const onSwipeRight = jest.fn();
      const onSwipeDown = jest.fn();

      const { result } = renderHook(() =>
        useSwipeGestures({
          onSwipeRight,
          onSwipeDown,
          threshold: 60,
        })
      );

      act(() => {
        result.current.onTouchStart({
          changedTouches: [{ screenX: 100, screenY: 100 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.onTouchMove({
          changedTouches: [{ screenX: 130, screenY: 200 }], // deltaX=30, deltaY=100
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.onTouchEnd({
          changedTouches: [{ screenX: 130, screenY: 200 }],
          preventDefault: jest.fn(),
        } as unknown as React.TouchEvent);
      });

      expect(onSwipeDown).toHaveBeenCalled();
      expect(onSwipeRight).not.toHaveBeenCalled();
    });
  });

  describe('Haptic Feedback', () => {
    it('should trigger haptic feedback on successful swipe', () => {
      const onSwipeRight = jest.fn();

      const { result } = renderHook(() =>
        useSwipeGestures({
          onSwipeRight,
          threshold: 60,
        })
      );

      act(() => {
        result.current.onTouchStart({
          changedTouches: [{ screenX: 100, screenY: 100 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.onTouchMove({
          changedTouches: [{ screenX: 200, screenY: 100 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.onTouchEnd({
          changedTouches: [{ screenX: 200, screenY: 100 }],
          preventDefault: jest.fn(),
        } as unknown as React.TouchEvent);
      });

      expect(navigator.vibrate).toHaveBeenCalledWith(10);
    });
  });
});

describe('useMouseSwipeGestures', () => {
  it('should detect mouse swipe right', () => {
    const onSwipeRight = jest.fn();

    const { result } = renderHook(() =>
      useMouseSwipeGestures({
        onSwipeRight,
        threshold: 60,
      })
    );

    act(() => {
      result.current.onMouseDown({
        clientX: 100,
        clientY: 100,
      } as unknown as React.MouseEvent);
    });

    act(() => {
      result.current.onMouseUp({
        clientX: 200, // deltaX = 100 > threshold of 60
        clientY: 100,
      } as unknown as React.MouseEvent);
    });

    expect(onSwipeRight).toHaveBeenCalled();
  });

  it('should detect mouse swipe left', () => {
    const onSwipeLeft = jest.fn();

    const { result } = renderHook(() =>
      useMouseSwipeGestures({
        onSwipeLeft,
        threshold: 60,
      })
    );

    act(() => {
      result.current.onMouseDown({
        clientX: 200,
        clientY: 100,
      } as unknown as React.MouseEvent);
    });

    act(() => {
      result.current.onMouseUp({
        clientX: 100,
        clientY: 100,
      } as unknown as React.MouseEvent);
    });

    expect(onSwipeLeft).toHaveBeenCalled();
  });

  it('should not trigger if not dragging', () => {
    const onSwipeRight = jest.fn();

    const { result } = renderHook(() =>
      useMouseSwipeGestures({
        onSwipeRight,
        threshold: 60,
      })
    );

    // Call mouseUp without mouseDown first
    act(() => {
      result.current.onMouseUp({
        clientX: 200,
        clientY: 100,
      } as unknown as React.MouseEvent);
    });

    expect(onSwipeRight).not.toHaveBeenCalled();
  });
});
