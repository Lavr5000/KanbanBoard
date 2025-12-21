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
    xs: 'text-[10px]',
    sm: 'text-[11px]',
    md: 'text-xs'
  };

  const iconSize = {
    xs: 11,
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

  const isOverdue = daysDiff < 0;
  const isDueToday = daysDiff === 0;
  const isDueTomorrow = daysDiff === 1;
  const isDueSoon = daysDiff >= 1 && daysDiff <= 3;
  const isDueThisWeek = daysDiff > 3 && daysDiff <= 7;

  let statusColor = 'text-text-muted';
  let bgColor = 'bg-white/[0.03]';
  let statusText = '';
  let Icon = Calendar;

  if (isOverdue) {
    statusColor = 'text-red-400';
    bgColor = 'bg-red-500/10';
    statusText = 'Просрочено';
    Icon = AlertTriangle;
  } else if (isDueToday) {
    statusColor = 'text-orange-400';
    bgColor = 'bg-orange-500/10';
    statusText = 'Сегодня';
    Icon = Clock;
  } else if (isDueTomorrow) {
    statusColor = 'text-amber-400';
    bgColor = 'bg-amber-500/10';
    statusText = 'Завтра';
    Icon = Clock;
  } else if (isDueSoon) {
    statusColor = 'text-amber-300';
    bgColor = 'bg-amber-500/10';
    statusText = `${daysDiff} дн.`;
    Icon = Clock;
  } else if (isDueThisWeek) {
    statusColor = 'text-accent';
    bgColor = 'bg-accent/10';
    statusText = `${daysDiff} дн.`;
    Icon = Calendar;
  } else {
    statusColor = 'text-text-muted';
    bgColor = 'bg-white/[0.03]';
    statusText = `${daysDiff} дн.`;
    Icon = Calendar;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${statusColor} ${className}`}>
      <Icon size={iconSize[size]} />
      <span className={`${sizeClasses[size]} font-medium`}>
        {formatDate(dueDate)}
      </span>
      {showDaysCount && (
        <span className={`${sizeClasses[size]} ${bgColor} px-1.5 py-0.5 rounded ${statusColor}`}>
          {isOverdue ? `−${Math.abs(daysDiff)}` : `+${daysDiff}`}
        </span>
      )}
      {showStatus && statusText && (
        <span className={`${sizeClasses[size]} opacity-70`}>
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

  let colorClass = 'text-text-muted';
  if (isOverdue) colorClass = 'text-red-400';
  else if (isDueToday) colorClass = 'text-orange-400';
  else if (isDueSoon) colorClass = 'text-amber-400';

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
      className={`inline-flex items-center gap-1 text-[10px] cursor-pointer hover:bg-white/[0.03] p-1 rounded transition-colors ${colorClass} ${className}`}
      onClick={onClick}
    >
      <Calendar size={10} />
      <span className="font-medium">{formatDate(dueDate)}</span>
    </div>
  );
};
