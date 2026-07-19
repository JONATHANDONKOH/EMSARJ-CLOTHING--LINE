// src/context/emailfunction.js
import supabase from "../supabasefol/supabaseClient";

/**
 * Insert a message from the currently signed-in user into the `emails` table.
 * Matches your RLS policy "Users send messages", which requires:
 *   auth.uid() = user_id AND sender_role = 'user'
 */
export async function insertEmail(message) {
  const trimmed = (message || "").trim();
  if (!trimmed) return null;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("You must be signed in to send a message.");
  }

  const { data, error } = await supabase
    .from("emails")
    .insert([
      {
        user_id: session.user.id,
        sender_role: "user",
        message: trimmed,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}