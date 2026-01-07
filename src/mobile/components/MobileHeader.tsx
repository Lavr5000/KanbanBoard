'use client';

import { RefreshCw, LogOut, User } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

interface Props {
  boardName: string;
  progressStats: { total: number; done: number; percentage: number };
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function MobileHeader({ boardName, progressStats, onRefresh, isRefreshing }: Props) {
  const { user, signOut } = useAuth();

  const getUserInitials = () => {
    const fullName = user?.user_metadata?.full_name;
    if (fullName) {
      const words = fullName.trim().split(' ');
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return fullName.substring(0, 2).toUpperCase();
    }
    if (!user?.email) return 'U';
    const email = user.email;
    const name = email.split('@')[0];
    return name.substring(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-40 bg-[#121218]/95 backdrop-blur-sm border-b border-gray-800 safe-area-top">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{getUserInitials()}</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">{boardName}</h1>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-500"
                  style={{ width: `${progressStats.percentage}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500">{progressStats.percentage}%</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleSignOut}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
