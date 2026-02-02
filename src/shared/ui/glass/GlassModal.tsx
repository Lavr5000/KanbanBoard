'use client';

import { useEffect, ReactNode } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';

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

// Overlay animation variants - fade in/out
const overlayVariants: Variants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};

// Modal content animation variants - spring physics with scale and Y offset
const modalVariants: Variants = {
  closed: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      duration: 0.2,
    },
  },
};

/**
 * GlassModal - Animated glassmorphism modal with spring animations
 *
 * Features:
 * - Smooth spring-based open/close animations
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

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <>
          {/* Backdrop overlay with blur */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            style={{
              WebkitBackdropFilter: 'blur(4px)',
            }}
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className={`${sizeClass} w-full glass-optimized rounded-2xl border border-white/10 bg-white/10 p-6 shadow-2xl`}
              style={{
                WebkitBackdropFilter: 'blur(20px)',
              }}
              variants={modalVariants}
              initial="closed"
              animate="open"
              exit="exit"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
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
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
