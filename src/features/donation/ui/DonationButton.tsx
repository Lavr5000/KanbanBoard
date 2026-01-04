"use client";

import { Heart } from "lucide-react";
import { useDonationModal } from "../model/useDonationModal";

export const DonationButton = () => {
  const { open } = useDonationModal();

  return (
    <button
      onClick={open}
      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg transition-all hover:from-pink-700 hover:to-purple-700 hover:shadow-lg hover:shadow-pink-500/50 group"
    >
      <Heart size={16} className="group-hover:scale-110 transition-transform" fill="currentColor" />
      <span>Поддержать проект</span>
    </button>
  );
};
