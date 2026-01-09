import { LayoutDashboard, Sparkles, User, LucideIcon } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  action: () => void;
  dataTour?: string; // For onboarding
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'board',
    label: 'Доска',
    icon: LayoutDashboard,
    action: () => {
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  },
  {
    id: 'ai',
    label: 'AI',
    icon: Sparkles,
    action: () => {
      // Open RoadmapPanel - will be implemented with store/event
      const event = new CustomEvent('open-ai-panel');
      window.dispatchEvent(event);
    },
    dataTour: 'mobile-ai-tab',
  },
  {
    id: 'profile',
    label: 'Профиль',
    icon: User,
    action: () => {
      // Open profile modal
      const event = new CustomEvent('open-profile-modal');
      window.dispatchEvent(event);
    },
  },
];
