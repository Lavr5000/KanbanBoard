'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { RoadmapPanel } from '@/features/roadmap/ui/RoadmapPanel';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  boardId: string | null;
}

export function RightDrawer({ isOpen, onClose, boardId }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#1a1a20] z-50
                       border-l border-gray-700/50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-[#121218]">
              <h2 className="text-lg font-semibold text-white">Дорожная карта</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content - Roadmap */}
            <div className="flex-1 overflow-y-auto">
              <RoadmapPanel boardId={boardId} isMobile />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
