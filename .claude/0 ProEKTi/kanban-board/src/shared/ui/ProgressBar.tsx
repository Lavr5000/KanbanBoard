import React, { useState } from 'react';

interface ProgressBarProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  className?: string;
  onClick?: () => void;
  editable?: boolean;
  onProgressChange?: (progress: number) => void;
}

export const ProgressBar = ({
  progress,
  size = 'md',
  showLabel = true,
  color = 'blue',
  className = '',
  editable = false,
  onProgressChange,
  onClick
}: ProgressBarProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempProgress, setTempProgress] = useState(progress);

  const clampedProgress = Math.max(0, Math.min(100, progress));

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2'
  };

  const colorClasses = {
    blue: 'bg-accent',
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500'
  };

  const handleClick = () => {
    if (editable && onProgressChange) {
      setIsEditing(true);
      setTempProgress(progress);
    } else if (onClick) {
      onClick();
    }
  };

  const handleProgressChange = (newProgress: number) => {
    setTempProgress(newProgress);
    if (onProgressChange) {
      onProgressChange(newProgress);
    }
  };

  if (isEditing && editable) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] text-text-muted">Прогресс</span>
          <span className="text-[11px] text-text-secondary font-medium">{tempProgress}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={tempProgress}
          onChange={(e) => handleProgressChange(parseInt(e.target.value))}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
              setIsEditing(false);
            }
          }}
          className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div
      className={`w-full group ${editable ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
    >
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] text-text-muted">Прогресс</span>
          <span className="text-[11px] text-text-secondary font-medium">{clampedProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-white/[0.06] rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} h-full rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
