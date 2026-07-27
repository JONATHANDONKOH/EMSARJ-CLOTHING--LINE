import { createContext, useContext, useState, useEffect } from "react";


const API_URL = import.meta.env.VITE_UPLOAD_API_URL || "https://emsarj-clothing-line.onrender.com";


const TOKEN_KEY = "emsarj_token";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = still resolving, null = signed out
  const [user, setUser]       = useState(null);

  // ── Fetch the current user from the backend using a stored token ──
  const loadUser = async (token) => {
    if (!token) {
      setSession(null);
      setUser(null);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        // Token missing/expired/invalid — drop it
        localStorage.removeItem(TOKEN_KEY);
        setSession(null);
        setUser(null);
        return;
      }

      const userData = await res.json();
      setSession({ access_token: token });
      setUser(userData);
    } catch (err) {
      console.error("Failed to load user:", err.message);
      setSession(null);
      setUser(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    loadUser(token);
  }, []);

  // ── SIGN UP ──
  const signUp = async ({ name, email, number, location, password }) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, number, location, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Registration failed. Please try again.");
    }

    const { token, ...authUser } = data;
    localStorage.setItem(TOKEN_KEY, token);
    setSession({ access_token: token });
    setUser(authUser);

    return authUser;
  };

  // ── SIGN IN ──
  const signIn = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Something went wrong. Please try again.");
    }

    const { token, ...authUser } = data;
    localStorage.setItem(TOKEN_KEY, token);
    setSession({ access_token: token });
    setUser(authUser);

    return authUser;
  };

  // ── SIGN OUT ──
  const signOut = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    try {
      if (token) {
        await fetch(`${API_URL}/auth/signout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      // Stateless JWT — nothing server-side actually depends on this
      // succeeding. Clear local state regardless.
      console.error("Signout request failed:", err.message);
    }

    localStorage.removeItem(TOKEN_KEY);
    setSession(null);
    setUser(null);
  };

  const value = {
    signUp,
    signIn,
    signOut,
    user,
    session,
    refresh: async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      await loadUser(token);
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