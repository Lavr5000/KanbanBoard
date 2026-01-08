"use client";

import { Play, Download, LogOut } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { BoardSelector } from "@/widgets/board-selector";
import { FeedbackButton, FeedbackModal } from "@/features/feedback";
import { DonationButton, DonationModal } from "@/features/donation";

export const Sidebar = ({ className = '' }: { className?: string }) => {
  const { user, signOut } = useAuth();

  return (
    <aside className={`w-64 border-r border-gray-800 flex flex-col h-screen sticky top-0 bg-[#121218] ${className}`}>
      {/* Logo */}
      <div className="p-6 mb-4 flex items-center gap-2">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-1.5">
          <Play className="fill-white text-white" size={20} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-white text-lg tracking-tight">Lavr</span>
          <span className="text-gray-500 text-xs font-medium">Kanban AI</span>
        </div>
      </div>

      {/* Project Selector - Main Feature */}
      <div className="px-4 mb-auto">
        <BoardSelector />
      </div>

      {/* Bottom Actions */}
      <div className="p-4 space-y-3 border-t border-gray-800">
        <DonationButton />
        <button
          onClick={() => alert("Экспорт данных будет доступен позже")}
          className="w-full flex items-center gap-3 px-4 py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
        >
          <Download size={14} />
          Экспортировать данные
        </button>
        <FeedbackButton />
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
        >
          <LogOut size={14} />
          Выйти
        </button>

        {user && (
          <div className="bg-[#1c1c24] p-3 rounded-xl border border-gray-800">
            <p className="text-xs text-gray-400 mb-1">Пользователь</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <FeedbackModal />
      <DonationModal />
    </aside>
  );
};
