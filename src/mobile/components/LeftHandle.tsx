'use client';

import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

interface Props {
  onClick: () => void;
}

export function LeftHandle({ onClick }: Props) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed left-2 top-1/2 -translate-y-1/2 z-40
                 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30
                 rounded-full p-3 shadow-lg
                 hover:bg-blue-500/30 transition-colors"
      aria-label="Открыть меню"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
      >
        <Settings size={20} className="text-blue-400" />
      </motion.div>
    </motion.button>
  );
}
