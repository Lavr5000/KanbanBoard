"use client";

import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect } from "react";

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  // Hooks must be called before early returns
  useEffect(() => {
    // Modal mount tracking for debugging
  }, [isOpen, title]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      id="modal-overlay"
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      style={{ zIndex: 99999 }}
      onClick={handleOverlayClick}
    >
      <div className="bg-[#1c1c24] border border-gray-800 w-full sm:max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-800 flex-shrink-0">
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );

  // Use portal to render at the end of body to avoid stacking context issues
  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};
