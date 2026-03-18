import type { SubmitFeedbackData } from "../model/types";

export async function submitFeedback({
  category,
  content,
  screenshot,
}: SubmitFeedbackData) {
  const formData = new FormData();
  formData.append("category", category);
  formData.append("content", content);
  if (screenshot) formData.append("screenshot", screenshot);

  const res = await fetch("/api/feedback", { method: "POST", body: formData });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to submit feedback");
  }
}
