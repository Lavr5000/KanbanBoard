import { SupabaseClient } from "@supabase/supabase-js";
import type { Suggestion, Category } from "@/features/feedback/model/types";

/**
 * Create a new suggestion
 */
export async function createSuggestion(
  supabase: SupabaseClient,
  data: {
    user_id: string;
    user_email: string;
    category: Category;
    content: string;
    screenshot_url?: string | null;
  }
) {
  const { data: result, error } = await supabase
    .from("suggestions")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result as Suggestion;
}

/**
 * Get suggestions by user
 */
export async function getUserSuggestions(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from("suggestions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Suggestion[];
}

/**
 * Get all suggestions (admin only)
 */
export async function getAllSuggestions(
  supabase: SupabaseClient,
  status?: Suggestion["status"]
) {
  let query = supabase
    .from("suggestions")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Suggestion[];
}

/**
 * Update suggestion status
 */
export async function updateSuggestionStatus(
  supabase: SupabaseClient,
  suggestionId: string,
  status: Suggestion["status"]
) {
  const { data, error } = await supabase
    .from("suggestions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", suggestionId)
    .select()
    .single();

  if (error) throw error;
  return data as Suggestion;
}
