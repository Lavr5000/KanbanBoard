import React, { useState } from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
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

  // Ensure progress is within bounds
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const bgGradientClass = color === 'blue' ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
                          color === 'green' ? 'bg-gradient-to-r from-green-600 to-green-400' :
                          color === 'yellow' ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
                          'bg-gradient-to-r from-red-600 to-red-400';

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
          <span className="text-xs text-gray-400">Progress</span>
          <span className="text-xs text-gray-300 font-medium">{tempProgress}%</span>
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
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div
      className={`w-full ${editable ? 'cursor-pointer hover:bg-white/5 p-1 rounded transition-colors' : ''} ${className}`}
      onClick={handleClick}
    >
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400">Progress</span>
          <span className="text-xs text-gray-300 font-medium">{clampedProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm ${sizeClasses[size]}`}>
        <div
          className={`${bgGradientClass} h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Add a subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
      </div>
      {editable && (
        <div className="text-[9px] text-gray-500 italic mt-1 text-center">
          Click to edit
        </div>
      )}
    </div>
  );
};