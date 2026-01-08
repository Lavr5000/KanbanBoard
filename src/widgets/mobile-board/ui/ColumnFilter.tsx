'use client';

import { Column as UIColumn } from '@/entities/task/model/types';

interface ColumnFilterProps {
  columns: UIColumn[];
  selectedColumnId: string;
  onSelectColumn: (columnId: string) => void;
  tasksCount: Record<string, number>; // columnId -> count
}

export function ColumnFilter({
  columns,
  selectedColumnId,
  onSelectColumn,
  tasksCount,
}: ColumnFilterProps) {
  const totalTasks = Object.values(tasksCount).reduce((sum, count) => sum + count, 0);

  return (
    <div
      data-mobile-tour="column-filter"
      className="sticky top-0 bg-[#121218] z-10 pb-3 border-b border-gray-800"
    >
      <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-hide">
        {/* "All" option */}
        <button
          onClick={() => onSelectColumn('all')}
          className={`
            px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
            ${selectedColumnId === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-[#1c1c24] text-gray-400 hover:bg-[#252530]'
            }
          `}
        >
          Все ({totalTasks})
        </button>

        {/* Column filters */}
        {columns.map((column) => (
          <button
            key={column.id}
            onClick={() => onSelectColumn(String(column.id))}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
              ${selectedColumnId === String(column.id)
                ? 'bg-blue-500 text-white'
                : 'bg-[#1c1c24] text-gray-400 hover:bg-[#252530]'
              }
            `}
          >
            {column.title} ({tasksCount[String(column.id)] || 0})
          </button>
        ))}
      </div>
    </div>
  );
}
