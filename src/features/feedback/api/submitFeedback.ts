import { createClient } from "@/lib/supabase/client";
import type { SubmitFeedbackData } from "../model/types";

const UPLOAD_BUCKET = "suggestions-screenshots";

export async function submitFeedback({
  category,
  content,
  screenshot,
}: SubmitFeedbackData) {
  const supabase = createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.email) {
    throw new Error("Необходимо авторизоваться");
  }

  let screenshotUrl: string | null = null;

  // Upload screenshot if provided
  if (screenshot) {
    const fileExt = screenshot.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(UPLOAD_BUCKET)
      .upload(fileName, screenshot);

    if (uploadError) {
      console.error("Screenshot upload failed:", uploadError);
      // Continue without screenshot if upload fails
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from(UPLOAD_BUCKET)
        .getPublicUrl(fileName);
      screenshotUrl = publicUrl;
    }
  }

  // Save suggestion
  const { error } = await supabase.from("suggestions").insert({
    user_id: user.id,
    user_email: user.email,
    category,
    content,
    screenshot_url: screenshotUrl,
  });

  if (error) throw error;
}
