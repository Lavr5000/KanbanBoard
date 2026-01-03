"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createColumn } from "@/lib/supabase/queries/columns";

interface Props {
  boardId: string;
  currentColumnCount: number;
  maxColumns?: number;
  onColumnAdded?: () => void;
}

const MAX_COLUMNS = 8;

export const AddColumnButton = ({
  boardId,
  currentColumnCount,
  maxColumns = MAX_COLUMNS,
  onColumnAdded
}: Props) => {
  const supabase = createClient();
  const [isAdding, setIsAdding] = useState(false);
  const isLimitReached = currentColumnCount >= maxColumns;

  const handleAddColumn = async () => {
    if (isLimitReached || isAdding || !boardId) {
      // logger.log("Cannot add column:", { isLimitReached, isAdding, boardId });
      return;
    }

    setIsAdding(true);
    try {
      // logger.log("Creating column:", { boardId, position: currentColumnCount });
      await createColumn(supabase, {
        board_id: boardId,
        title: "New column",
        position: currentColumnCount,
      });
      // logger.log("Column created successfully");
      onColumnAdded?.();
    } catch (error) {
      // logger.error("Failed to create column:", error);
      alert("Failed to create column: " + (error as Error).message);
    } finally {
      setIsAdding(false);
    }
  };

  if (isLimitReached) {
    return (
      <div
        className="flex flex-col w-[300px] min-h-[500px] items-center justify-center text-gray-600 text-sm"
        title={`Maximum ${maxColumns} columns`}
      >
        <Plus size={24} className="mb-2 opacity-50" />
        <span>Maximum {maxColumns} columns</span>
      </div>
    );
  }

  return (
    <button
      data-tour="add-column-btn"
      onClick={handleAddColumn}
      disabled={isAdding}
      className="flex flex-col w-[300px] min-h-[500px] items-center justify-center bg-[#1a1a20]/50 hover:bg-[#1a1a20] border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-xl transition-all group disabled:opacity-50"
      title="Add column"
    >
      <Plus
        size={32}
        className={`text-gray-600 group-hover:text-blue-500 transition-colors mb-3 ${isAdding ? 'animate-spin' : ''}`}
      />
      <span className="text-gray-600 group-hover:text-blue-500 text-sm font-medium transition-colors">
        {isAdding ? "Adding..." : "Add column"}
      </span>
    </button>
  );
};
