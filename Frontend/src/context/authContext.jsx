import { createContext, useContext, useState, useEffect } from "react";

const API_URL =
  import.meta.env.VITE_UPLOAD_API_URL ||
  "https://emsarj-clothing-line.onrender.com";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // undefined = still checking authentication
  // null = signed out
  // object = signed in
  const [user, setUser] = useState(undefined);

  // ── LOAD CURRENT USER ─────────────────────────────────────────────
  // The authentication JWT is stored in an HTTP-only cookie.
  // The browser automatically sends that cookie because of credentials: "include".
  const loadUser = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        // Cookie is missing, expired, or invalid
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

  // Check authentication when the application starts
  useEffect(() => {
    loadUser();
  }, []);

  // ── SIGN UP ───────────────────────────────────────────────────────
  const signUp = async ({
    name,
    email,
    number,
    location,
    password,
  }) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name,
        email,
        number,
        location,
        password,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.message || "Registration failed. Please try again."
      );
    }

    // Backend has created the account and cookie.
    // Store the returned user in React state.
    setUser(data);

    return data;
  };

  // ── SIGN IN ───────────────────────────────────────────────────────
  const signIn = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.message || "Something went wrong. Please try again."
      );
    }

    // Store the authenticated user in React state.
    setUser(data);

    return data;
  };

  // ── SIGN OUT ──────────────────────────────────────────────────────
  const signOut = async () => {
    try {
      // The HTTP-only JWT cookie is automatically sent to the backend.
      // The backend clears the cookie.
      await fetch(`${API_URL}/auth/signout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Signout request failed:", err.message);
    }

    // Update React authentication state.
    setUser(null);

    // IMPORTANT:
    // Do NOT redirect here.
    // TopNav handles the redirect with navigate("/");
  };

  // ── REFRESH USER ──────────────────────────────────────────────────
  const refresh = async () => {
    await loadUser();
  };

  const value = {
    signUp,
    signIn,
    signOut,
    user,
    refresh,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}