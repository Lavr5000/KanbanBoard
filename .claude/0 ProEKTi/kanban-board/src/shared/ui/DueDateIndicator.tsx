import React from 'react';
import { Calendar, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface DueDateIndicatorProps {
  dueDate?: string;
  startDate?: string;
  size?: 'xs' | 'sm' | 'md';
  showStatus?: boolean;
  showDaysCount?: boolean;
  className?: string;
}

export const DueDateIndicator = ({
  dueDate,
  startDate,
  size = 'sm',
  showStatus = true,
  showDaysCount = true,
  className = ''
}: DueDateIndicatorProps) => {
  if (!dueDate) {
    return null;
  }

  const sizeClasses = {
    xs: 'text-[8px]',
    sm: 'text-[9px]',
    md: 'text-xs'
  };

  const iconSize = {
    xs: 10,
    sm: 12,
    md: 14
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
      });
    } catch {
      return dateString;
    }
  };

  const now = new Date();
  const due = new Date(dueDate);
  const daysDiff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Status calculation
  const isOverdue = daysDiff < 0;
  const isDueToday = daysDiff === 0;
  const isDueTomorrow = daysDiff === 1;
  const isDueSoon = daysDiff >= 1 && daysDiff <= 3;
  const isDueThisWeek = daysDiff > 3 && daysDiff <= 7;
  const isDueLater = daysDiff > 7;

  let statusColor = 'text-gray-400';
  let bgColor = 'bg-gray-500/10';
  let borderColor = 'border-gray-500/30';
  let statusText = '';
  let Icon = Calendar;

  if (isOverdue) {
    statusColor = 'text-red-400';
    bgColor = 'bg-red-500/10';
    borderColor = 'border-red-500/30';
    statusText = 'Просрочено';
    Icon = AlertTriangle;
  } else if (isDueToday) {
    statusColor = 'text-orange-400';
    bgColor = 'bg-orange-500/10';
    borderColor = 'border-orange-500/30';
    statusText = 'Сегодня';
    Icon = Clock;
  } else if (isDueTomorrow) {
    statusColor = 'text-yellow-400';
    bgColor = 'bg-yellow-500/10';
    borderColor = 'border-yellow-500/30';
    statusText = 'Завтра';
    Icon = Clock;
  } else if (isDueSoon) {
    statusColor = 'text-yellow-300';
    bgColor = 'bg-yellow-500/10';
    borderColor = 'border-yellow-500/30';
    statusText = `Через ${daysDiff} дня`;
    Icon = Clock;
  } else if (isDueThisWeek) {
    statusColor = 'text-blue-400';
    bgColor = 'bg-blue-500/10';
    borderColor = 'border-blue-500/30';
    statusText = `Через ${daysDiff} дней`;
    Icon = Calendar;
  } else {
    statusColor = 'text-gray-400';
    bgColor = 'bg-gray-500/10';
    borderColor = 'border-gray-500/30';
    statusText = `Через ${daysDiff} дней`;
    Icon = Calendar;
  }

  // Special case for completed tasks (can be determined by status)
  const isCompleted = false; // This would come from task.status === 'done'
  if (isCompleted) {
    statusColor = 'text-green-400';
    bgColor = 'bg-green-500/10';
    borderColor = 'border-green-500/30';
    statusText = 'Завершено';
    Icon = CheckCircle;
  }

  return (
    <div className={`flex items-center gap-1 ${statusColor} ${className}`}>
      <Icon size={iconSize[size]} className={statusColor} />
      <span className={`${sizeClasses[size]} font-medium`}>
        {formatDate(dueDate)}
      </span>
      {showDaysCount && !isCompleted && (
        <span className={`${sizeClasses[size]} ${statusColor} opacity-70`}>
          ({isOverdue ? `-${Math.abs(daysDiff)}` : `+${daysDiff}`}д)
        </span>
      )}
      {showStatus && statusText && (
        <span className={`${sizeClasses[size]} px-1.5 py-0.5 rounded-full ${bgColor} ${borderColor} border ${statusColor}`}>
          {statusText}
        </span>
      )}
    </div>
  );
};

interface CompactDueDateProps {
  dueDate?: string;
  onClick?: () => void;
  className?: string;
}

export const CompactDueDate = ({ dueDate, onClick, className = '' }: CompactDueDateProps) => {
  if (!dueDate) {
    return null;
  }

  const now = new Date();
  const due = new Date(dueDate);
  const daysDiff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const isOverdue = daysDiff < 0;
  const isDueToday = daysDiff === 0;
  const isDueSoon = daysDiff >= 1 && daysDiff <= 3;

  let colorClass = 'text-gray-400';
  if (isOverdue) colorClass = 'text-red-400 font-medium';
  else if (isDueToday) colorClass = 'text-orange-400 font-medium';
  else if (isDueSoon) colorClass = 'text-yellow-400';

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div
      className={`flex items-center gap-1 text-[9px] cursor-pointer hover:bg-white/5 p-1 rounded transition-colors ${colorClass} ${className}`}
      onClick={onClick}
    >
      <Calendar size={10} />
      <span>{formatDate(dueDate)}</span>
      {isOverdue && (
        <span className="text-red-500 ml-1">!</span>
      )}
      {isDueToday && (
        <span className="text-orange-400 ml-1">●</span>
      )}
    </div>
  );
};