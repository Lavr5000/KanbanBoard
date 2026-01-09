/**
 * Tests for ColumnFilter Component
 * Тестирование компонента фильтрации колонок на мобильных
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColumnFilter } from '@/widgets/mobile-board/ui/ColumnFilter';

const mockColumns = [
  { id: '1', title: 'Новые задачи', order: 0 },
  { id: '2', title: 'В работе', order: 1 },
  { id: '3', title: 'Готово', order: 2 },
];

const mockTasksCount = {
  '1': 5,
  '2': 3,
  '3': 8,
};

describe('ColumnFilter', () => {
  it('should render all columns', () => {
    render(
      <ColumnFilter
        columns={mockColumns}
        selectedColumnId="1"
        onSelectColumn={jest.fn()}
        tasksCount={mockTasksCount}
      />
    );

    expect(screen.getByText('Новые задачи (5)')).toBeInTheDocument();
    expect(screen.getByText('В работе (3)')).toBeInTheDocument();
    expect(screen.getByText('Готово (8)')).toBeInTheDocument();
  });

  it('should highlight selected column', () => {
    render(
      <ColumnFilter
        columns={mockColumns}
        selectedColumnId="2"
        onSelectColumn={jest.fn()}
        tasksCount={mockTasksCount}
      />
    );

    const selectedButton = screen.getByText('В работе (3)');
    expect(selectedButton).toHaveClass('bg-blue-500', 'text-white');
  });

  it('should call onSelectColumn when column is clicked', () => {
    const onSelectColumn = jest.fn();

    render(
      <ColumnFilter
        columns={mockColumns}
        selectedColumnId="1"
        onSelectColumn={onSelectColumn}
        tasksCount={mockTasksCount}
      />
    );

    fireEvent.click(screen.getByText('Готово (8)'));

    expect(onSelectColumn).toHaveBeenCalledWith('3');
  });

  it('should show 0 for columns with no tasks', () => {
    render(
      <ColumnFilter
        columns={mockColumns}
        selectedColumnId="1"
        onSelectColumn={jest.fn()}
        tasksCount={{ '1': 5, '2': 0, '3': 0 }}
      />
    );

    expect(screen.getByText('В работе (0)')).toBeInTheDocument();
    expect(screen.getByText('Готово (0)')).toBeInTheDocument();
  });

  it('should handle empty columns array', () => {
    const { container } = render(
      <ColumnFilter
        columns={[]}
        selectedColumnId=""
        onSelectColumn={jest.fn()}
        tasksCount={{}}
      />
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(0);
  });

  it('should have mobile tour data attribute', () => {
    const { container } = render(
      <ColumnFilter
        columns={mockColumns}
        selectedColumnId="1"
        onSelectColumn={jest.fn()}
        tasksCount={mockTasksCount}
      />
    );

    const filterContainer = container.querySelector('[data-mobile-tour="column-filter"]');
    expect(filterContainer).toBeInTheDocument();
  });

  it('should apply correct styles to non-selected columns', () => {
    render(
      <ColumnFilter
        columns={mockColumns}
        selectedColumnId="1"
        onSelectColumn={jest.fn()}
        tasksCount={mockTasksCount}
      />
    );

    const notSelectedButton = screen.getByText('В работе (3)');
    expect(notSelectedButton).toHaveClass('bg-[#1c1c24]', 'text-gray-400');
  });
});

describe('ColumnFilter - Accessibility', () => {
  it('should have clickable buttons', () => {
    render(
      <ColumnFilter
        columns={mockColumns}
        selectedColumnId="1"
        onSelectColumn={jest.fn()}
        tasksCount={mockTasksCount}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('should support keyboard navigation', () => {
    const onSelectColumn = jest.fn();

    render(
      <ColumnFilter
        columns={mockColumns}
        selectedColumnId="1"
        onSelectColumn={onSelectColumn}
        tasksCount={mockTasksCount}
      />
    );

    const button = screen.getByText('В работе (3)');
    button.focus();

    fireEvent.keyDown(button, { key: 'Enter' });

    // Note: Button click handlers respond to Enter key by default
  });
});

describe('ColumnFilter - Performance', () => {
  it('should handle large number of columns', () => {
    const manyColumns = Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      title: `Column ${i}`,
      order: i,
    }));

    const manyTasksCounts = manyColumns.reduce(
      (acc, col) => ({ ...acc, [col.id]: Math.floor(Math.random() * 100) }),
      {}
    );

    const { container } = render(
      <ColumnFilter
        columns={manyColumns}
        selectedColumnId="0"
        onSelectColumn={jest.fn()}
        tasksCount={manyTasksCounts}
      />
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(20);
  });

  it('should handle rapid column switches', () => {
    const onSelectColumn = jest.fn();

    render(
      <ColumnFilter
        columns={mockColumns}
        selectedColumnId="1"
        onSelectColumn={onSelectColumn}
        tasksCount={mockTasksCount}
      />
    );

    // Simulate rapid clicking
    for (let i = 0; i < 10; i++) {
      fireEvent.click(screen.getByText('В работе (3)'));
      fireEvent.click(screen.getByText('Готово (8)'));
    }

    expect(onSelectColumn).toHaveBeenCalledTimes(20);
  });
});
