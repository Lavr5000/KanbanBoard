"use client";
import {
  KanbanSquare,
  Search,
  Bell,
  LayoutGrid,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles
} from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Elegant loading component
const BoardLoader = () => (
  <div className="flex h-full items-center justify-center">
    <div className="text-center">
      <div className="relative mb-6">
        <div className="w-12 h-12 border-2 border-white/10 rounded-full animate-spin border-t-accent"></div>
      </div>
      <div className="text-text-secondary text-sm font-medium mb-1">Загрузка доски</div>
      <div className="text-text-muted text-xs">Инициализация...</div>
    </div>
  </div>
);

// Dynamic import to prevent Hydration Error
const KanbanBoard = dynamic(() => import("@/features/kanban/ui/KanbanBoard"), {
  ssr: false,
  loading: BoardLoader
});

export default function Home() {
  return (
    <main className="flex h-screen w-full bg-canvas text-text-primary font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] glass-sidebar p-3 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 px-3 pt-2">
          <div className="p-1.5 bg-accent/20 rounded-lg">
            <KanbanSquare size={18} className="text-accent" />
          </div>
          <span className="text-text-primary font-semibold text-[15px] tracking-tight">Kanban</span>
          <span className="text-text-subtle text-xs ml-auto">v1.0</span>
        </div>

        {/* Navigation Section Label */}
        <div className="px-3 mb-2">
          <span className="text-[10px] font-medium text-text-subtle uppercase tracking-wider">Навигация</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-0.5 px-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted hover:text-text-primary cursor-pointer hover:bg-white/[0.03] transition-colors">
            <LayoutGrid size={18} strokeWidth={1.5} />
            <span className="text-[13px] font-medium">Dashboard</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted hover:text-text-primary cursor-pointer hover:bg-white/[0.03] transition-colors">
            <Users size={18} strokeWidth={1.5} />
            <span className="text-[13px] font-medium">Команда</span>
          </div>
          {/* Active item with vertical indicator */}
          <div className="sidebar-item-active flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary cursor-pointer">
            <KanbanSquare size={18} strokeWidth={1.5} className="text-accent" />
            <span className="text-[13px] font-medium">Канбан</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted hover:text-text-primary cursor-pointer hover:bg-white/[0.03] transition-colors">
            <Settings size={18} strokeWidth={1.5} />
            <span className="text-[13px] font-medium">Настройки</span>
          </div>
        </nav>

        {/* Projects Section */}
        <div className="mt-6 px-3 mb-2">
          <span className="text-[10px] font-medium text-text-subtle uppercase tracking-wider">Проекты</span>
        </div>
        <div className="px-1 space-y-0.5">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted hover:text-text-primary cursor-pointer hover:bg-white/[0.03] transition-colors group">
            <div className="w-2 h-2 rounded-full bg-accent"></div>
            <span className="text-[13px] font-medium">Основной проект</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted hover:text-text-primary cursor-pointer hover:bg-white/[0.03] transition-colors group">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[13px] font-medium">Редизайн UI</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted hover:text-text-primary cursor-pointer hover:bg-white/[0.03] transition-colors group">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-[13px] font-medium">API интеграция</span>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-auto pt-4 border-t border-border-subtle mx-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted hover:text-error cursor-pointer hover:bg-error/5 transition-colors">
            <LogOut size={18} strokeWidth={1.5} />
            <span className="text-[13px] font-medium">Выйти</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header with glassmorphism */}
        <header className="h-[60px] glass-header flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-text-primary tracking-tight">Канбан доска</h2>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/10 text-accent text-xs font-medium">
              <Sparkles size={12} />
              <span>5 колонок</span>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white/[0.03] border border-border-subtle px-3 py-1.5 rounded-lg text-sm text-text-muted min-w-[200px] hover:border-border-hover transition-colors cursor-pointer">
              <Search size={14} className="text-text-subtle" />
              <span className="text-[13px]">Поиск...</span>
              <kbd className="ml-auto text-[10px] text-text-subtle bg-white/[0.05] px-1.5 py-0.5 rounded">⌘K</kbd>
            </div>

            {/* Notifications */}
            <button className="btn-ghost p-2 rounded-lg relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full"></span>
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-muted flex items-center justify-center text-xs font-medium text-white">
              АП
            </div>
          </div>
        </header>

        {/* Board Area */}
        <div className="flex-1 p-4 overflow-hidden min-h-0">
          <Suspense fallback={<BoardLoader />}>
            <KanbanBoard />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
