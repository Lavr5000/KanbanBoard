'use client';

import { NavigationItem } from '../model/navigationItems';

interface NavigationItemProps {
  item: NavigationItem;
  isActive: boolean;
  onClick: () => void;
}

export function NavigationItemComponent({ item, isActive, onClick }: NavigationItemProps) {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      data-mobile-tour={item.dataTour}
      className={`
        flex flex-col items-center gap-1 px-4 py-2 transition-all
        ${isActive
          ? 'text-blue-500'
          : 'text-gray-500 hover:text-gray-300'
        }
      `}
    >
      <Icon size={20} strokeWidth={2} />
      <span className="text-[10px] font-medium">
        {item.label}
      </span>
    </button>
  );
}
