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

  // Get initials from name
  const getInitials = (name: string) => {
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  const initials = getInitials(assignee.name);
  const bgColor = assignee.color || '#3B82F6';

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold relative transition-all duration-200 hover:scale-110 ${className}`}
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

  return (
    <div className={`flex items-center gap-1 ${className}`}>
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
          className={`${size === 'xs' ? 'w-5 h-5 text-[8px]' :
                      size === 'sm' ? 'w-6 h-6 text-[10px]' :
                      'w-8 h-8 text-xs'}
                      rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-gray-300 font-semibold border border-white/20`}
          title={`${remainingCount} more assignee${remainingCount > 1 ? 's' : ''}`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};