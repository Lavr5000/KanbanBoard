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
      color: 'bg-red-500',
      textColor: 'text-red-400',
      borderColor: 'border-red-500',
      icon: AlertTriangle,
      label: 'Срочный'
    },
    high: {
      color: 'bg-orange-500',
      textColor: 'text-orange-400',
      borderColor: 'border-orange-500',
      icon: ChevronUp,
      label: 'Высокий'
    },
    medium: {
      color: 'bg-yellow-500',
      textColor: 'text-yellow-400',
      borderColor: 'border-yellow-500',
      icon: Minus,
      label: 'Средний'
    },
    low: {
      color: 'bg-green-500',
      textColor: 'text-green-400',
      borderColor: 'border-green-500',
      icon: ChevronDown,
      label: 'Низкий'
    }
  };

  const config = priorityConfig[priority];
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'w-4 h-4 text-[10px]',
    sm: 'w-5 h-5 text-[11px]',
    md: 'w-6 h-6 text-xs'
  };

  const iconSize = {
    xs: 8,
    sm: 10,
    md: 12
  };

  if (showLabel) {
    return (
      <div className={`flex items-center gap-1 ${config.textColor} ${className}`}>
        <Icon size={iconSize[size]} />
        <span className="text-[10px] font-medium">{config.label}</span>
      </div>
    );
  }

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${config.color}
        rounded-full
        flex
        items-center
        justify-center
        text-white
        ${className}
      `}
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

  return (
    <div className={`flex gap-1 ${className}`}>
      {priorities.map((priority) => (
        <button
          key={priority}
          onClick={() => onChange(priority)}
          className={`
            ${value === priority
              ? priority === 'urgent' ? 'bg-red-500 text-white' :
                priority === 'high' ? 'bg-orange-500 text-white' :
                priority === 'medium' ? 'bg-yellow-500 text-white' :
                'bg-green-500 text-white'
              : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }
            w-6 h-6
            rounded-full
            flex
            items-center
            justify-center
            transition-colors
            ${size === 'xs' ? 'scale-75' : ''}
          `}
          title={priority === 'urgent' ? 'Срочный' :
                 priority === 'high' ? 'Высокий' :
                 priority === 'medium' ? 'Средний' :
                 'Низкий'}
        >
          {priority === 'urgent' && <AlertTriangle size={size === 'xs' ? 8 : 10} />}
          {priority === 'high' && <ChevronUp size={size === 'xs' ? 8 : 10} />}
          {priority === 'medium' && <Minus size={size === 'xs' ? 8 : 10} />}
          {priority === 'low' && <ChevronDown size={size === 'xs' ? 8 : 10} />}
        </button>
      ))}
    </div>
  );
};