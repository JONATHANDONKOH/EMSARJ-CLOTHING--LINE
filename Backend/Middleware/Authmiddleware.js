import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client, used ONLY to verify incoming JWTs.
// SUPABASE_URL and SUPABASE_ANON_KEY go in the backend .env (never the frontend).
// The anon key is fine here — supabase.auth.getUser(token) just validates the
// token against Supabase's auth server, it doesn't need elevated privileges.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // Attach the authenticated Supabase user to the request
  req.user = data.user;

  next();
}