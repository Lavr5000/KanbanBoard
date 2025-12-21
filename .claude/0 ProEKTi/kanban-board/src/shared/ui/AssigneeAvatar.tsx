import React from 'react';
import { Assignee } from '@/shared/types/task';

interface AssigneeAvatarProps {
  assignee: Assignee;
  size?: 'xs' | 'sm' | 'md';
  showTooltip?: boolean;
  className?: string;
}

export const AssigneeAvatar = ({
  assignee,
  size = 'sm',
  showTooltip = true,
  className = ''
}: AssigneeAvatarProps) => {
  const sizeClasses = {
    xs: 'w-5 h-5 text-[8px]',
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs'
  };

  const getInitials = (name: string) => {
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  const initials = getInitials(assignee.name);
  const bgColor = assignee.color || '#6366f1';

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium ring-1 ring-white/10 transition-transform duration-150 hover:scale-105 hover:ring-white/20 ${className}`}
      style={{ backgroundColor: bgColor }}
      title={showTooltip ? assignee.name : undefined}
    >
      {assignee.avatar ? (
        <img
          src={assignee.avatar}
          alt={assignee.name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

interface AssigneeGroupProps {
  assignees: Assignee[];
  maxVisible?: number;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const AssigneeGroup = ({
  assignees,
  maxVisible = 3,
  size = 'sm',
  className = ''
}: AssigneeGroupProps) => {
  if (!assignees || assignees.length === 0) {
    return null;
  }

  const visibleAssignees = assignees.slice(0, maxVisible);
  const remainingCount = assignees.length - maxVisible;

  const sizeClasses = {
    xs: 'w-5 h-5 text-[8px]',
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs'
  };

  return (
    <div className={`flex items-center -space-x-1 ${className}`}>
      {visibleAssignees.map((assignee) => (
        <AssigneeAvatar
          key={assignee.id}
          assignee={assignee}
          size={size}
          showTooltip
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={`${sizeClasses[size]} rounded-full bg-elevated flex items-center justify-center text-text-secondary font-medium ring-1 ring-border-subtle`}
          title={`+${remainingCount} ещё`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};
