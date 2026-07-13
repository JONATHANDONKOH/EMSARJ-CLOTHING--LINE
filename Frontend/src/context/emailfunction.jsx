import supabase from "../supabasefol/supabaseClient";

export async function insertEmail(message) {
  // Get the currently logged-in user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("No user logged in");
    return { error: "User must be logged in" };
  }

  // Insert into emails table
  const { data, error } = await supabase
    .from("emails")
    .insert([
      {
        user_id: user.id,   // foreign key to users table
        message: message    // optional message
      }
    ]);

  if (error) {
    console.error("Insert failed:", error);
    return { error };
  }

  return { data };
}
