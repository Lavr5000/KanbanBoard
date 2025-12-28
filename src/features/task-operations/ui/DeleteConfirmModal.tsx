"use client";

import { Modal } from "@/shared/ui/Modal";
import { useBoardContext } from "@/widgets/board/model/BoardContext";
import { Id } from "@/entities/task/model/types";

export const DeleteConfirmModal = ({
  taskId,
  isOpen,
  onClose,
}: {
  taskId: Id | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { deleteTask } = useBoardContext();

  const handleConfirm = () => {
    if (taskId) {
      deleteTask(String(taskId));
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Удалить задачу?">
      <div className="space-y-6">
        <p className="text-gray-400 text-sm">
          Вы уверены, что хотите удалить эту задачу? Это действие нельзя будет
          отменить.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-xl transition-all"
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-xl font-bold transition-all"
          >
            Удалить
          </button>
        </div>
      </div>
    </Modal>
  );
};
