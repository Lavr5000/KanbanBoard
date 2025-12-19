import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  className?: string;
}

export const ProgressBar = ({
  progress,
  size = 'md',
  showLabel = true,
  color = 'blue',
  className = ''
}: ProgressBarProps) => {
  // Ensure progress is within bounds
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  const bgGradientClass = color === 'blue' ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
                          color === 'green' ? 'bg-gradient-to-r from-green-600 to-green-400' :
                          color === 'yellow' ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
                          'bg-gradient-to-r from-red-600 to-red-400';

  return (
    <div className={`w-full ${className}`}>
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
    </div>
  );
};