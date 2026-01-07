'use client';

import { Home, Map, Plus, Settings, Download } from 'lucide-react';
import { clsx } from 'clsx';
import { useInstallPWA } from '@/shared/lib/pwa';

type Tab = 'board' | 'roadmap' | 'add' | 'settings';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onAddTask: () => void;
}

export function BottomNavigation({ activeTab, onTabChange, onAddTask }: Props) {
  const { canInstall, isInstalled, isIOS, install } = useInstallPWA();

  const handleInstall = async () => {
    if (canInstall) {
      await install();
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a20] border-t border-gray-800 safe-area-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {/* Board */}
        <NavItem
          icon={Home}
          label="Доска"
          active={activeTab === 'board'}
          onClick={() => onTabChange('board')}
        />

        {/* Roadmap */}
        <NavItem
          icon={Map}
          label="Roadmap"
          active={activeTab === 'roadmap'}
          onClick={() => onTabChange('roadmap')}
        />

        {/* Add Task (center, emphasized) */}
        <button
          onClick={onAddTask}
          className="flex flex-col items-center justify-center w-14 h-14 -mt-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={24} className="text-white" />
        </button>

        {/* Settings or Install */}
        {!isInstalled && (canInstall || isIOS) ? (
          <NavItem
            icon={Download}
            label="Установить"
            active={false}
            onClick={handleInstall}
            highlight
          />
        ) : (
          <NavItem
            icon={Settings}
            label="Ещё"
            active={activeTab === 'settings'}
            onClick={() => onTabChange('settings')}
          />
        )}

        {/* Empty slot for balance */}
        <div className="w-12" />
      </div>

      {/* iOS Install Instructions */}
      {isIOS && !isInstalled && (
        <IOSInstallBanner />
      )}
    </nav>
  );
}

interface NavItemProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
  highlight?: boolean;
}

function NavItem({ icon: Icon, label, active, onClick, highlight }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex flex-col items-center justify-center gap-1 w-16 h-12 transition-colors',
        active ? 'text-purple-400' : highlight ? 'text-green-400' : 'text-gray-500'
      )}
    >
      <Icon size={20} className={active ? 'text-purple-400' : highlight ? 'text-green-400' : undefined} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

function IOSInstallBanner() {
  return (
    <div className="bg-gray-900 px-4 py-2 text-center">
      <p className="text-xs text-gray-400">
        Нажмите{' '}
        <span className="inline-flex items-center">
          <svg className="w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 4.5a.5.5 0 11-1 0V3H8v1.5a.5.5 0 01-1 0V2.5A.5.5 0 017.5 2h5a.5.5 0 01.5.5v2zM10 6a.5.5 0 01.5.5v6.793l2.146-2.147a.5.5 0 01.708.708l-3 3a.5.5 0 01-.708 0l-3-3a.5.5 0 11.708-.708L9.5 13.293V6.5A.5.5 0 0110 6z" />
          </svg>
        </span>{' '}
        → &quot;На экран Домой&quot;
      </p>
    </div>
  );
}
