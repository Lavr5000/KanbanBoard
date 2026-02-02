import type { ReactNode } from 'react';

/**
 * Props for GlassModal component
 */
export interface GlassModalProps {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Callback function to close the modal */
  onClose: () => void;
  /** Title displayed in the modal header */
  title: string;
  /** Content to render inside the modal */
  children: ReactNode;
  /** Width size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Props for GlassCard component (from Phase 1)
 */
export interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'light' | 'dark';
  className?: string;
  blurLevel?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  interactive?: boolean;
}

/**
 * Props for GlassPanel component
 */
export interface GlassPanelProps {
  /** Content to render inside the panel */
  children: ReactNode;
  /** Visual variant - affects opacity and blur appearance */
  variant?: 'default' | 'light' | 'dark';
  /** Additional CSS classes to apply */
  className?: string;
}
