import React from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

interface DateRangeProps {
  startDate?: string;
  dueDate?: string;
  size?: 'sm' | 'md';
  showIcons?: boolean;
  className?: string;
}

export const DateRange = ({
  startDate,
  dueDate,
  size = 'sm',
  showIcons = true,
  className = ''
}: DateRangeProps) => {
  if (!startDate && !dueDate) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-[9px]',
    md: 'text-xs'
  };

  const iconSize = size === 'sm' ? 10 : 12;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const isOverdue = dueDate && new Date(dueDate) < new Date() && startDate;
  const isStartingSoon = startDate && new Date(startDate) > new Date();

  const getStatusColor = () => {
    if (isOverdue) return 'text-red-400';
    if (isStartingSoon) return 'text-yellow-400';
    return 'text-gray-400';
  };

  return (
    <div className={`flex items-center gap-2 ${sizeClasses[size]} ${className}`}>
      {startDate && (
        <div className="flex items-center gap-1">
          {showIcons && (
            <Clock size={iconSize} className="text-gray-500" />
          )}
          <span className="text-gray-400">Start: {formatDate(startDate)}</span>
        </div>
      )}
      {startDate && dueDate && (
        <span className="text-gray-600">→</span>
      )}
      {dueDate && (
        <div className={`flex items-center gap-1 ${getStatusColor()}`}>
          {showIcons && (
            <Calendar size={iconSize} className={getStatusColor()} />
          )}
          <span>Due: {formatDate(dueDate)}</span>
          {isOverdue && (
            <AlertCircle size={iconSize} className="text-red-500" />
          )}
        </div>
      )}
    </div>
  );
};

interface CompactDateRangeProps {
  startDate?: string;
  dueDate?: string;
  className?: string;
  onClick?: () => void;
}

export const CompactDateRange = ({
  startDate,
  dueDate,
  className = '',
  onClick
}: CompactDateRangeProps) => {
  if (!startDate && !dueDate) {
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const isOverdue = dueDate && new Date(dueDate) < new Date();

  return (
    <div
      className={`flex items-center gap-1 text-[9px] cursor-pointer hover:bg-white/5 p-1 rounded transition-colors ${className}`}
      onClick={onClick}
    >
      {startDate && <span className="text-gray-500">{formatDate(startDate)}</span>}
      {startDate && dueDate && <span className="text-gray-600">-</span>}
      {dueDate && (
        <span className={isOverdue ? 'text-red-400 font-medium' : 'text-gray-400'}>
          {formatDate(dueDate)}
        </span>
      )}
    </div>
  );
};