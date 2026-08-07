import { createContext, useContext, useState, useEffect } from "react";


const API_URL = import.meta.env.VITE_UPLOAD_API_URL || "https://emsarj-clothing-line.onrender.com";


const AuthContext = createContext();

export function AuthProvider({ children }) {
  // undefined = still resolving, null = signed out, object = signed in
  const [user, setUser] = useState(undefined);

  // ── Fetch the current user from the backend using the HTTP-only cookie ──
  const loadUser = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        // Cookie missing/expired/invalid
        setUser(null);
        return;
      }

      const userData = await res.json();
      setUser(userData);
    } catch (err) {
      console.error("Failed to load user:", err.message);
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // ── SIGN UP ──
  const signUp = async ({ name, email, number, location, password }) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, number, location, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Registration failed. Please try again.");
    }

    setUser(data);

    return data;
  };

  // ── SIGN IN ──
  const signIn = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Something went wrong. Please try again.");
    }

    setUser(data);

    return data;
  };

  // ── SIGN OUT ──
  const signOut = async () => {
    try {
      // credentials: "include" ensures the httpOnly JWT cookie is sent so
      // authMiddleware can identify req.user.id and the backend can delete
      // the matching session:<id> key from Redis.
      await fetch(`${API_URL}/auth/signout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      // Stateless-cookie-wise there's nothing else the frontend can do if
      // this fails — the Redis key deletion is a best-effort server-side
      // step. Clear local state and redirect regardless.
      console.error("Signout request failed:", err.message);
    }

    setUser(null);

    // NOTE: adjust this path to match your actual sign-in route.
    window.location.href = "/signin";
  };

  const value = {
    signUp,
    signIn,
    signOut,
    user,
    refresh: async () => {
      await loadUser();
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}