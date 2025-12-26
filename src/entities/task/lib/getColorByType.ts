import { TaskType } from "../model/types";

export const typeStyles: Record<
  TaskType,
  { label: string; color: string; bg: string }
> = {
  bug: { label: "Bug", color: "text-red-500", bg: "bg-red-500/10" },
  feature: { label: "Feature", color: "text-green-500", bg: "bg-green-500/10" },
  design: { label: "Design", color: "text-blue-500", bg: "bg-blue-500/10" },
  research: { label: "Research", color: "text-purple-500", bg: "bg-purple-500/10" },
};

export const getTypeStyle = (type: TaskType = "feature") => typeStyles[type];
