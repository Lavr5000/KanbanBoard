'use client';

import { motion } from 'framer-motion';
import { Map } from 'lucide-react';

interface Props {
  onClick: () => void;
}

export function RightHandle({ onClick }: Props) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed right-2 top-1/2 -translate-y-1/2 z-40
                 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30
                 rounded-full p-3 shadow-lg
                 hover:bg-purple-500/30 transition-colors"
      aria-label="Открыть дорожную карту"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
      >
        <Map size={20} className="text-purple-400" />
      </motion.div>
    </motion.button>
  );
}
