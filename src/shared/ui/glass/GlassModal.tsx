'use client';

import { useEffect, ReactNode } from 'react';

// Types imported from types.ts
export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

// Size variants for modal width
const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

/**
 * GlassModal - Animated glassmorphism modal with CSS animations
 *
 * Features:
 * - Smooth open/close animations
 * - Backdrop blur effect on overlay
 * - Escape key handling
 * - Click-outside-to-close functionality
 * - Safari-compatible with -webkit-backdrop-filter prefix
 */
export function GlassModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: GlassModalProps) {
  // Handle Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const sizeClass = sizeClasses[size];

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes glassModalOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes glassModalIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .glass-modal-overlay {
          animation: glassModalOverlayIn 0.2s ease-out forwards;
        }
        .glass-modal-content {
          animation: glassModalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
      {/* Backdrop overlay with blur */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm glass-modal-overlay"
        style={{
          WebkitBackdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`${sizeClass} w-full glass-optimized rounded-2xl border border-white/10 bg-white/10 p-6 shadow-2xl glass-modal-content`}
          style={{
            WebkitBackdropFilter: 'blur(20px)',
          }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <h2
              id="modal-title"
              className="text-xl font-semibold text-white/90"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white/90"
              aria-label="Close modal"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="text-white/80">{children}</div>
        </div>
      </div>
    </>
  );
}
