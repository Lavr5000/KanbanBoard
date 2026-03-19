"use client";

export const TaskCardSkeleton = () => {
  return (
    <div className="glass-card p-4 rounded-xl animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-4 w-16 bg-gray-700/50 rounded" />
        <div className="h-4 w-4 bg-gray-700/50 rounded" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-3 w-full bg-gray-700/50 rounded" />
        <div className="h-3 w-3/4 bg-gray-700/50 rounded" />
      </div>
      <div className="border-t border-gray-800 pt-3">
        <div className="h-2.5 w-20 bg-gray-700/50 rounded" />
      </div>
    </div>
  );
};
