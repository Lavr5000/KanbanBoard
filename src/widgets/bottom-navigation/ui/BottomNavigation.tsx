'use client';

import { useState } from 'react';
import { navigationItems } from '../model/navigationItems';
import { NavigationItemComponent } from './NavigationItem';

export function BottomNavigation() {
  const [activeTab, setActiveTab] = useState('board');

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#121218]/90 backdrop-blur-md border-t border-gray-800 flex items-center justify-around z-50 md:hidden">
      {navigationItems.map((item) => (
        <NavigationItemComponent
          key={item.id}
          item={item}
          isActive={activeTab === item.id}
          onClick={() => {
            setActiveTab(item.id);
            item.action();
          }}
        />
      ))}
    </nav>
  );
}
