"use client";

import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { Board } from "@/widgets/board/ui/Board";
import { UserMenu } from "@/widgets/user-menu/ui/UserMenu";
import { Bell, Search } from "lucide-react";
import { useBoardStore } from "@/entities/task/model/store";
import { useBoardStats } from "@/entities/task/model/store";

export default function Home() {
  const { searchQuery, setSearchQuery } = useBoardStore();
  const stats = useBoardStats();
  const progressPercentage = Math.round((stats.done / (stats.total || 1)) * 100);

  return (
    <main className="flex min-h-screen bg-[#121218]">
      <Sidebar />
      <div className="flex-grow flex flex-col">
        {/* Top Header */}
        <header className="h-20 border-b border-gray-800 flex items-center justify-between px-10 bg-[#121218]/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">Канбан доска</h1>
              <div className="hidden md:flex flex-col ml-4 border-l border-gray-800 pl-4">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                  Прогресс
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">{progressPercentage}%</span>
                </div>
              </div>
            </div>
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Поиск задач..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1c1c24] border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 w-64 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-[10px] text-white flex items-center justify-center border-2 border-[#121218]">
                3
              </span>
            </button>
            <UserMenu />
          </div>
        </header>

        {/* Board Content */}
        <Board />
      </div>
    </main>
  );
}
