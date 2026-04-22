import { createContext, useContext, useState, useEffect } from "react";
import supabase from "../supabasefol/supabaseClient"; // ← import your client

const AuthContext = createContext();

// AuthProvider shares auth state and functions across the app
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current session on load
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  // SIGN UP FUNCTION
  const signUp = async ({ name, email, number, location, password }) => {
    // 1. Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    const authUser = data.user;

    // 2. Insert into Users table
    if (authUser) {
      const { error: usersError } = await supabase
        .from("users")
        .insert([
          {
            id: authUser.id,
            name,
            email,
            number,
            location,
          },
        ]);

      if (usersError) throw usersError;
    }

    // 3. Refresh session/user state
    const { data: latest } = await supabase.auth.getSession();
    setSession(latest.session);
    setUser(latest.session?.user ?? null);

    return authUser;
  };

  // SIGN IN FUNCTION
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase SignIn Error:", {
        message: error.message,
        status: error.status,
        code: error.code,
      });

      const errorMessages = {
        "Invalid login credentials": "Incorrect email or password. Please try again.",
        "Email not confirmed": "Please verify your email before signing in.",
        "Too many requests": "Too many attempts. Please wait a few minutes and try again.",
        "User not found": "No account found with this email.",
        "Network request failed": "Network error. Please check your connection.",
      };

      const friendlyMessage = Object.entries(errorMessages).find(([key]) =>
        error.message?.includes(key)
      );

      throw new Error(
        friendlyMessage ? friendlyMessage[1] : error.message || "Something went wrong. Please try again."
      );
    }

    // Update session/user state
    setSession(data.session);
    setUser(data.user);

    return data;
  };

  // Exposed to all consumers via useAuth()
  const value = {
    signUp,
    signIn,
    user,
    session,
    supabase,
    refresh: async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}