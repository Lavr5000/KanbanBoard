import React, { useState } from 'react';
import { TaskFilters, TaskStatus, Priority } from '@/shared/types/task';
import { Search, Filter, X, RotateCcw } from 'lucide-react';

interface FilterPanelProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  taskCount: number;
}

const statusLabels: Record<TaskStatus, string> = {
  'todo': 'Новая задача',
  'in-progress': 'Выполняется',
  'review': 'Ожидает проверки',
  'testing': 'Тестирование',
  'done': 'Готово'
};

const priorityLabels: Record<Priority, string> = {
  'urgent': 'Срочно',
  'high': 'Высокий',
  'medium': 'Средний',
  'low': 'Низкий'
};

const priorityColors: Record<Priority, string> = {
  'urgent': 'bg-red-500',
  'high': 'bg-orange-500',
  'medium': 'bg-yellow-500',
  'low': 'bg-green-500'
};

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange, taskCount }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (updates: Partial<TaskFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const handlePriorityToggle = (priority: Priority) => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter(p => p !== priority)
      : [...filters.priorities, priority];
    handleFilterChange({ priorities: newPriorities });
  };

  const handleStatusToggle = (status: TaskStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    handleFilterChange({ statuses: newStatuses });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      priorities: [],
      statuses: [],
      dateRange: {
        start: undefined,
        end: undefined,
        hasDueDate: undefined
      }
    });
  };

  const hasActiveFilters = !!(
    filters.search ||
    filters.priorities.length > 0 ||
    filters.statuses.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end ||
    filters.dateRange.hasDueDate
  );

  return (
    <div data-testid="filter-panel" className="bg-white/5 backdrop-blur-md rounded-lg p-4 mb-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-blue-400" />
          <h3 data-testid="filter-panel-title" className="text-white font-medium">Фильтры</h3>
          {hasActiveFilters && (
            <span data-testid="filter-task-count" className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">
              {taskCount} задач
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              data-testid="filter-clear-button"
              onClick={handleClearFilters}
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
              title="Сбросить все фильтры"
            >
              <RotateCcw size={14} />
            </button>
          )}
          <button
            data-testid="filter-toggle-button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
          >
            <X size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">Поиск</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                data-testid="filter-search-input"
                type="text"
                placeholder="Название или описание задачи..."
                className="w-full bg-white/5 text-white border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm outline-none focus:border-blue-400/50 transition-all placeholder-gray-500"
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
              />
            </div>
          </div>

          {/* Priority Filters */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">Приоритет</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(priorityLabels) as Priority[]).map((priority) => (
                <button
                  key={priority}
                  data-testid={`priority-${priority}`}
                  onClick={() => handlePriorityToggle(priority)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    filters.priorities.includes(priority)
                      ? 'text-white ring-2 ring-white/50'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                  style={{
                    backgroundColor: filters.priorities.includes(priority)
                      ? `${priorityColors[priority]}33`
                      : 'transparent'
                  }}
                >
                  <span className={`w-2 h-2 rounded-full ${priorityColors[priority]}`}></span>
                  {priorityLabels[priority]}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">Статус</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(statusLabels) as TaskStatus[]).map((status) => (
                <button
                  key={status}
                  data-testid={`status-${status}`}
                  onClick={() => handleStatusToggle(status)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    filters.statuses.includes(status)
                      ? 'bg-blue-500/30 text-blue-300 ring-2 ring-blue-400/50'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {statusLabels[status]}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filters */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">Даты</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasDueDate"
                  checked={!!filters.dateRange.hasDueDate}
                  onChange={(e) => handleFilterChange({
                    dateRange: { ...filters.dateRange, hasDueDate: e.target.checked }
                  })}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-400/50 focus:ring-2"
                />
                <label htmlFor="hasDueDate" className="text-gray-300 text-sm">
                  Только с датой выполнения
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  placeholder="От"
                  className="bg-white/5 text-white border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-400/50 transition-all"
                  value={filters.dateRange.start || ''}
                  onChange={(e) => handleFilterChange({
                    dateRange: { ...filters.dateRange, start: e.target.value || undefined }
                  })}
                />
                <input
                  type="date"
                  placeholder="До"
                  className="bg-white/5 text-white border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-400/50 transition-all"
                  value={filters.dateRange.end || ''}
                  onChange={(e) => handleFilterChange({
                    dateRange: { ...filters.dateRange, end: e.target.value || undefined }
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};