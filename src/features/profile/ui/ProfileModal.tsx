'use client';

import { useAuth } from '@/providers/AuthProvider';
import { LogOut, Mail, Github } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, signOut } = useAuth();

  if (!isOpen) return null;

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70] md:hidden"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a20] rounded-2xl border border-gray-800 w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user?.email?.[0].toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-lg truncate">
                Пользователь
              </p>
              <p className="text-white/70 text-sm truncate flex items-center gap-1">
                <Mail size={14} />
                {user?.email || 'Загрузка...'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors text-red-400"
          >
            <LogOut size={20} />
            <span className="font-medium">Выйти из аккаунта</span>
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com/Lavr5000/0-KanBanDoska"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl transition-colors text-gray-300"
          >
            <Github size={20} />
            <span className="font-medium">GitHub репозиторий</span>
          </a>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors text-gray-300 font-medium"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
