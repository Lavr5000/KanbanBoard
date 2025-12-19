import { fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Enhanced DragEvent mock for better testing
export class DragEventMock extends Event {
  dataTransfer: DataTransfer;
  clientX: number;
  clientY: number;
  target: Element | null;

  constructor(type: string, options: DragEventInit = {}) {
    super(type, { bubbles: true, cancelable: true });

    // Create proper DataTransfer mock
    this.dataTransfer = options.dataTransfer || {
      setData: jest.fn(),
      getData: jest.fn(() => ''),
      clearData: jest.fn(),
      files: [],
      items: [],
      types: [],
      dropEffect: 'move',
      effectAllowed: 'move',
      setDragImage: jest.fn(),
    };

    this.clientX = options.clientX || 0;
    this.clientY = options.clientY || 0;
    this.target = options.target || null;
  }
}

// Simulate drag start event
export const simulateDragStart = (element: HTMLElement, options: DragEventInit = {}) => {
  const dragStartEvent = new DragEventMock('dragstart', {
    ...options,
    dataTransfer: {
      setData: jest.fn(),
      getData: jest.fn(),
      clearData: jest.fn(),
      files: [],
      items: [],
      types: ['text/plain'],
      dropEffect: 'move',
      effectAllowed: 'move',
      setDragImage: jest.fn(),
    }
  });

  element.dispatchEvent(dragStartEvent);
  return dragStartEvent;
};

// Simulate drag enter event
export const simulateDragEnter = (element: HTMLElement, options: DragEventInit = {}) => {
  const dragEnterEvent = new DragEventMock('dragenter', options);
  element.dispatchEvent(dragEnterEvent);
  return dragEnterEvent;
};

// Simulate drag over event
export const simulateDragOver = (element: HTMLElement, options: DragEventInit = {}) => {
  const dragOverEvent = new DragEventMock('dragover', {
    ...options,
    preventDefault: jest.fn(),
  });

  // Manually call preventDefault since our mock doesn't inherit it properly
  dragOverEvent.preventDefault();
  element.dispatchEvent(dragOverEvent);
  return dragOverEvent;
};

// Simulate drop event
export const simulateDrop = (element: HTMLElement, options: DragEventInit = {}) => {
  const dropEvent = new DragEventMock('drop', {
    ...options,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  });

  // Manually call these methods
  dropEvent.preventDefault();
  dropEvent.stopPropagation();
  element.dispatchEvent(dropEvent);
  return dropEvent;
};

// Simulate drag end event
export const simulateDragEnd = (element: HTMLElement, options: DragEventInit = {}) => {
  const dragEndEvent = new DragEventMock('dragend', options);
  element.dispatchEvent(dragEndEvent);
  return dragEndEvent;
};

// Complete drag and drop simulation
export const simulateDragDrop = async (
  draggable: HTMLElement,
  droppable: HTMLElement,
  options: {
    onDragStart?: (event: DragEventMock) => void;
    onDragEnter?: (event: DragEventMock) => void;
    onDragOver?: (event: DragEventMock) => void;
    onDrop?: (event: DragEventMock) => void;
    onDragEnd?: (event: DragEventMock) => void;
  } = {}
): Promise<void> => {
  // Start drag
  const dragStartEvent = simulateDragStart(draggable);
  options.onDragStart?.(dragStartEvent);

  // Drag over target
  const dragEnterEvent = simulateDragEnter(droppable);
  options.onDragEnter?.(dragEnterEvent);

  const dragOverEvent = simulateDragOver(droppable);
  options.onDragOver?.(dragOverEvent);

  // Drop on target
  const dropEvent = simulateDrop(droppable);
  options.onDrop?.(dropEvent);

  // End drag
  const dragEndEvent = simulateDragEnd(draggable);
  options.onDragEnd?.(dragEndEvent);

  // Wait for async operations to complete
  await waitFor(() => {
    // Give React time to process state updates
  });
};

// Simulate drag with keyboard (for accessibility testing)
export const simulateKeyboardDrag = async (
  draggable: HTMLElement,
  dropTarget: HTMLElement
): Promise<void> => {
  const user = userEvent.setup();

  // Focus on draggable element
  draggable.focus();

  // Press Space to start dragging
  await user.keyboard('{Space}');

  // Use arrow keys to navigate to drop target
  const rect = dropTarget.getBoundingClientRect();
  const draggableRect = draggable.getBoundingClientRect();

  const deltaX = Math.sign(rect.left - draggableRect.left);
  const deltaY = Math.sign(rect.top - draggableRect.top);

  // Move horizontally
  for (let i = 0; i < Math.abs(deltaX) * 5; i++) {
    await user.keyboard(deltaX > 0 ? '{ArrowRight}' : '{ArrowLeft}');
  }

  // Move vertically
  for (let i = 0; i < Math.abs(deltaY) * 5; i++) {
    await user.keyboard(deltaY > 0 ? '{ArrowDown}' : '{ArrowUp}');
  }

  // Press Space again to drop
  await user.keyboard('{Space}');

  await waitFor(() => {
    // Wait for drag operation to complete
  });
};

// Cancel drag operation
export const simulateDragCancel = async (
  draggable: HTMLElement
): Promise<void> => {
  const user = userEvent.setup();

  // Start drag
  simulateDragStart(draggable);

  // Press Escape to cancel
  await user.keyboard('{Escape}');

  // Simulate drag end with cancellation
  simulateDragEnd(draggable, { cancelable: true });

  await waitFor(() => {
    // Wait for cancellation to process
  });
};

// Advanced drag simulation with multiple waypoints
export const simulateComplexDrag = async (
  draggable: HTMLElement,
  waypoints: HTMLElement[],
  finalTarget: HTMLElement
): Promise<void> => {
  // Start drag
  simulateDragStart(draggable);

  // Drag through waypoints
  for (const waypoint of waypoints) {
    simulateDragEnter(waypoint);
    simulateDragOver(waypoint);

    // Small delay to simulate realistic movement
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Final drop
  simulateDrop(finalTarget);
  simulateDragEnd(draggable);

  await waitFor(() => {
    // Wait for complex drag to complete
  });
};

// Test helper to verify drag operation results
export const verifyDragResult = (
  sourceContainer: HTMLElement,
  targetContainer: HTMLElement,
  draggedElement: HTMLElement,
  moved: boolean = true
) => {
  // Check if element moved from source to target
  const sourceContains = sourceContainer.contains(draggedElement);
  const targetContains = targetContainer.contains(draggedElement);

  if (moved) {
    expect(sourceContains).toBe(false);
    expect(targetContains).toBe(true);
  } else {
    expect(sourceContains).toBe(true);
    expect(targetContains).toBe(false);
  }
};

// Mock DnD context for testing
export const createMockDndContext = () => ({
  sensors: [],
  collisionDetection: jest.fn(),
  onDragStart: jest.fn(),
  onDragMove: jest.fn(),
  onDragEnd: jest.fn(),
  onDragCancel: jest.fn(),
});

// Test utility to count draggable elements
export const countDraggableElements = (container: HTMLElement) => {
  return container.querySelectorAll('[draggable="true"]').length;
};

// Test utility to find droppable zones
export const findDroppableZones = (container: HTMLElement) => {
  return container.querySelectorAll('[data-droppable="true"]');
};

// Test utility to get drag handles
export const getDragHandles = (container: HTMLElement) => {
  return container.querySelectorAll('[data-testid*="drag-handle"]');
};

// Performance testing utilities
export const measureDragPerformance = async (
  dragOperation: () => Promise<void>
) => {
  const start = performance.now();
  await dragOperation();
  const end = performance.now();

  return {
    duration: end - start,
    isPerformant: (end - start) < 100 // Threshold for performant drag operations
  };
};

// Visual feedback testing
export const checkDragVisualFeedback = (
  element: HTMLElement,
  isDragging: boolean
) => {
  if (isDragging) {
    expect(element).toHaveStyle({ opacity: '0.5' });
  } else {
    expect(element).not.toHaveStyle({ opacity: '0.5' });
  }
};

// Export default drag simulation function
export default simulateDragDrop;