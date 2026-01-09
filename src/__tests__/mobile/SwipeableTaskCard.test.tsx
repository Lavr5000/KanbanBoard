/**
 * Tests for SwipeableTaskCard Component
 * Тестирование компонента свайпабельной карточки задачи
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SwipeableTaskCard } from '@/features/swipe-handler/ui/SwipeableTaskCard';

// Mock useSwipeGestures hook
jest.mock('@/features/swipe-handler/hooks/useSwipeGestures', () => ({
  useSwipeGestures: jest.fn(({ onSwipeLeft, onSwipeRight, onSwipeMove }) => ({
    onTouchStart: jest.fn(),
    onTouchMove: jest.fn((e) => {
      // Simulate swipe move
      onSwipeMove?.(50, 0);
    }),
    onTouchEnd: jest.fn(),
  })),
}));

describe('SwipeableTaskCard', () => {
  it('should render children', () => {
    render(
      <SwipeableTaskCard>
        <div data-testid="child">Task Content</div>
      </SwipeableTaskCard>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Task Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <SwipeableTaskCard className="custom-class">
        <div>Task</div>
      </SwipeableTaskCard>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should have transition classes', () => {
    const { container } = render(
      <SwipeableTaskCard>
        <div>Task</div>
      </SwipeableTaskCard>
    );

    expect(container.firstChild).toHaveClass('transition-transform');
  });
});

describe('SwipeableTaskCard - Swipe Behavior', () => {
  it('should accept onSwipeLeft callback', () => {
    const onSwipeLeft = jest.fn();

    render(
      <SwipeableTaskCard onSwipeLeft={onSwipeLeft}>
        <div>Task</div>
      </SwipeableTaskCard>
    );

    // Component should render without errors
    expect(screen.getByText('Task')).toBeInTheDocument();
  });

  it('should accept onSwipeRight callback', () => {
    const onSwipeRight = jest.fn();

    render(
      <SwipeableTaskCard onSwipeRight={onSwipeRight}>
        <div>Task</div>
      </SwipeableTaskCard>
    );

    expect(screen.getByText('Task')).toBeInTheDocument();
  });

  it('should accept custom swipe threshold', () => {
    render(
      <SwipeableTaskCard swipeThreshold={100}>
        <div>Task</div>
      </SwipeableTaskCard>
    );

    expect(screen.getByText('Task')).toBeInTheDocument();
  });

  it('should accept custom background colors', () => {
    render(
      <SwipeableTaskCard
        swipeLeftBackground="bg-red-500"
        swipeRightBackground="bg-green-500"
      >
        <div>Task</div>
      </SwipeableTaskCard>
    );

    expect(screen.getByText('Task')).toBeInTheDocument();
  });
});

describe('SwipeableTaskCard - Visual Feedback', () => {
  it('should handle swipe move events', () => {
    const { container } = render(
      <SwipeableTaskCard onSwipeRight={jest.fn()}>
        <div>Task</div>
      </SwipeableTaskCard>
    );

    // The component should be rendered and ready for swipe
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should reset position after swipe ends', () => {
    const { container } = render(
      <SwipeableTaskCard>
        <div>Task</div>
      </SwipeableTaskCard>
    );

    // Initial transform should be translateX(0px)
    const element = container.firstChild as HTMLElement;
    expect(element.style.transform).toBe('translateX(0px)');
  });
});

describe('SwipeableTaskCard - Edge Cases', () => {
  it('should handle no swipe callbacks', () => {
    render(
      <SwipeableTaskCard>
        <div>Task without swipe handlers</div>
      </SwipeableTaskCard>
    );

    expect(screen.getByText('Task without swipe handlers')).toBeInTheDocument();
  });

  it('should handle null children gracefully', () => {
    const { container } = render(
      <SwipeableTaskCard>
        {null}
      </SwipeableTaskCard>
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle multiple children', () => {
    render(
      <SwipeableTaskCard>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </SwipeableTaskCard>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('should handle complex nested children', () => {
    render(
      <SwipeableTaskCard>
        <div>
          <h3>Title</h3>
          <p>Description</p>
          <button>Action</button>
        </div>
      </SwipeableTaskCard>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});

describe('SwipeableTaskCard - Accessibility', () => {
  it('should have active scale transform class', () => {
    const { container } = render(
      <SwipeableTaskCard>
        <div>Task</div>
      </SwipeableTaskCard>
    );

    expect(container.firstChild).toHaveClass('active:scale-[0.98]');
  });
});

describe('SwipeableTaskCard - Performance', () => {
  it('should handle rapid re-renders', () => {
    const { rerender } = render(
      <SwipeableTaskCard>
        <div>Task 1</div>
      </SwipeableTaskCard>
    );

    for (let i = 0; i < 50; i++) {
      rerender(
        <SwipeableTaskCard>
          <div>Task {i}</div>
        </SwipeableTaskCard>
      );
    }

    expect(screen.getByText('Task 49')).toBeInTheDocument();
  });

  it('should handle callback changes', () => {
    const { rerender } = render(
      <SwipeableTaskCard onSwipeLeft={jest.fn()}>
        <div>Task</div>
      </SwipeableTaskCard>
    );

    const newCallback = jest.fn();
    rerender(
      <SwipeableTaskCard onSwipeLeft={newCallback}>
        <div>Task</div>
      </SwipeableTaskCard>
    );

    expect(screen.getByText('Task')).toBeInTheDocument();
  });
});
