"use client";

import { Inbox } from "lucide-react";

export const EmptyColumnState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Inbox size={32} className="text-gray-600 mb-3" />
      <p className="text-gray-500 text-sm font-medium">Нет задач</p>
      <p className="text-gray-600 text-xs mt-1">
        Перетащите задачу сюда или создайте новую
      </p>
    </div>
  );
};
