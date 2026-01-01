import { create } from "zustand";

interface FeedbackModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useFeedbackModal = create<FeedbackModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
