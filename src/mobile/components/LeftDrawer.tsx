'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, MessageCircle, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { FeedbackButton, FeedbackModal } from '@/features/feedback';
import { DonationButton, DonationModal } from '@/features/donation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function LeftDrawer({ isOpen, onClose }: Props) {
  const { user, signOut } = useAuth();

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
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#1a1a20] z-50
                       border-r border-gray-700/50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
              <h2 className="text-lg font-semibold text-white">Меню</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {/* User info */}
              {user && (
                <div className="bg-[#121218] p-4 rounded-xl border border-gray-700/50 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">
                        {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Menu items */}
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all">
                <SettingsIcon size={18} />
                <span>Настройки</span>
              </button>

              <button
                onClick={() => alert('Экспорт данных будет доступен позже')}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all"
              >
                <Download size={18} />
                <span>Экспортировать данные</span>
              </button>

              <FeedbackButton />

              <DonationButton />

              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <LogOut size={18} />
                <span>Выйти</span>
              </button>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700/50 text-center">
              <p className="text-xs text-gray-500">Lavr Kanban AI</p>
              <p className="text-xs text-gray-600">PWA Edition</p>
            </div>
          </motion.div>

          <FeedbackModal />
          <DonationModal />
        </>
      )}
    </AnimatePresence>
  );
}
