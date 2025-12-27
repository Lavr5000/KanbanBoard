export type Id = string;

export type Column = {
  id: Id;
  title: string;
};

export type TaskType = "bug" | "feature" | "design" | "research";

export type Member = {
  id: string;
  name: string;
  avatarColor: string;
  initials: string;
};

export type Task = {
  id: Id;
  columnId: Id;
  content: string;
  priority: "low" | "medium" | "high";
  status: "active" | "waiting" | "paused";
  type: TaskType;
  tags: string[];
  createdAt: string;
  assigneeId?: string;
};
