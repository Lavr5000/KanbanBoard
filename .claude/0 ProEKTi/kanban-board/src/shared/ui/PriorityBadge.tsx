import React from 'react';
import { AlertTriangle, ChevronUp, Minus, ChevronDown } from 'lucide-react';
import { Priority } from '@/shared/types/task';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export const PriorityBadge = ({
  priority,
  size = 'sm',
  showLabel = false,
  className = ''
}: PriorityBadgeProps) => {
  const priorityConfig = {
    urgent: {
      color: 'bg-red-500/20',
      dotColor: 'bg-red-500',
      textColor: 'text-red-400',
      icon: AlertTriangle,
      label: 'Срочный'
    },
    high: {
      color: 'bg-orange-500/20',
      dotColor: 'bg-orange-500',
      textColor: 'text-orange-400',
      icon: ChevronUp,
      label: 'Высокий'
    },
    medium: {
      color: 'bg-amber-500/20',
      dotColor: 'bg-amber-500',
      textColor: 'text-amber-400',
      icon: Minus,
      label: 'Средний'
    },
    low: {
      color: 'bg-emerald-500/20',
      dotColor: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      icon: ChevronDown,
      label: 'Низкий'
    }
  };

  const config = priorityConfig[priority];
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'text-[10px] gap-1 px-1.5 py-0.5',
    sm: 'text-[11px] gap-1.5 px-2 py-0.5',
    md: 'text-xs gap-1.5 px-2 py-1'
  };

  const iconSize = {
    xs: 10,
    sm: 11,
    md: 12
  };

  const dotSize = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2 h-2'
  };

  if (showLabel) {
    return (
      <div className={`inline-flex items-center ${sizeClasses[size]} ${config.color} ${config.textColor} rounded-full font-medium ${className}`}>
        <span className={`${dotSize[size]} ${config.dotColor} rounded-full`}></span>
        <span>{config.label}</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center ${sizeClasses[size]} ${config.color} ${config.textColor} rounded-full font-medium ${className}`}
      title={config.label}
    >
      <Icon size={iconSize[size]} />
    </div>
  );
};

interface PrioritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const PrioritySelector = ({
  value,
  onChange,
  size = 'sm',
  className = ''
}: PrioritySelectorProps) => {
  const priorities: Priority[] = ['urgent', 'high', 'medium', 'low'];

  const priorityStyles = {
    urgent: { active: 'bg-red-500 text-white', inactive: 'bg-white/[0.05] text-text-muted hover:bg-red-500/20 hover:text-red-400' },
    high: { active: 'bg-orange-500 text-white', inactive: 'bg-white/[0.05] text-text-muted hover:bg-orange-500/20 hover:text-orange-400' },
    medium: { active: 'bg-amber-500 text-white', inactive: 'bg-white/[0.05] text-text-muted hover:bg-amber-500/20 hover:text-amber-400' },
    low: { active: 'bg-emerald-500 text-white', inactive: 'bg-white/[0.05] text-text-muted hover:bg-emerald-500/20 hover:text-emerald-400' }
  };

  const labels = {
    urgent: 'Срочный',
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий'
  };

  const buttonSize = size === 'xs' ? 'w-5 h-5' : size === 'sm' ? 'w-6 h-6' : 'w-7 h-7';
  const iconSizeValue = size === 'xs' ? 10 : size === 'sm' ? 12 : 14;

  return (
    <div className={`flex gap-1.5 ${className}`}>
      {priorities.map((priority) => (
        <button
          key={priority}
          onClick={(e) => {
            e.stopPropagation();
            onChange(priority);
          }}
          className={`
            ${buttonSize}
            ${value === priority ? priorityStyles[priority].active : priorityStyles[priority].inactive}
            rounded-full
            flex
            items-center
            justify-center
            transition-all
            duration-150
          `}
          title={labels[priority]}
        >
          {priority === 'urgent' && <AlertTriangle size={iconSizeValue} />}
          {priority === 'high' && <ChevronUp size={iconSizeValue} />}
          {priority === 'medium' && <Minus size={iconSizeValue} />}
          {priority === 'low' && <ChevronDown size={iconSizeValue} />}
        </button>
      ))}
    </div>
  );
};
