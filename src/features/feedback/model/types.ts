export type Category = "bug" | "feature" | "improvement" | "other";

export interface Suggestion {
  id: string;
  user_id: string;
  user_email: string;
  category: Category;
  content: string;
  screenshot_url: string | null;
  status: "pending" | "reviewed" | "implemented" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface SubmitFeedbackData {
  category: Category;
  content: string;
  screenshot?: File | null;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  bug: "Баг",
  feature: "Фича",
  improvement: "Улучшение",
  other: "Другое",
} as const;
