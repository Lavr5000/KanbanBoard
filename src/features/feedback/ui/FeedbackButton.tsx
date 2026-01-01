"use client";

import { MessageSquare } from "lucide-react";
import { useFeedbackModal } from "../model/useFeedbackModal";

export const FeedbackButton = () => {
  const { open } = useFeedbackModal();

  return (
    <button
      onClick={open}
      className="w-full flex items-center gap-3 px-4 py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
    >
      <MessageSquare size={14} />
      Предложения и жалобы
    </button>
  );
};
