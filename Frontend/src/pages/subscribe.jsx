import { useState } from "react";
import { z } from "zod";
import { Link } from "react-router-dom";

import emmyLogo from "../assets/emmy.png";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";


// ── Zod schema ──────────────────────────────────────────────
const subscribeSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export default function Subscribe() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldError, setFieldError] = useState("");

  const [email, setEmail] = useState("");

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (fieldError) setFieldError("");
    setIsError(false);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldError("");

    const result = subscribeSchema.safeParse({ email });
    if (!result.success) {
      setFieldError(result.error.flatten().fieldErrors.email?.[0]);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      setIsSuccess(false);
      setMessage("");

      const res = await fetch(`${API_URL}/messages/subscribe`,  {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Subscription failed. Please try again.");
      }

      setIsSuccess(true);
      setEmail("");
    } catch (err) {
      setIsError(true);
      setMessage(err?.message || "Subscription failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    ...styles.input,
    border: fieldError ? "1px solid #dc2626" : "1px solid #d1d5db",
  };

  const inputFocusStyle = {
    ...styles.inputFocus,
    border: fieldError ? "1px solid #dc2626" : "1px solid #111",
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        

        <div style={styles.logoWrap}>
          <img src={emmyLogo} alt="EMSarj" style={styles.logo} />
        </div>

        <p style={styles.subtitle}>
          Our system is being updated. Subscribe to be notified the moment we're live.
        </p>

        {isError && <div style={styles.errorBox}>{message}</div>}
        {isSuccess && (
          <div style={styles.successBox}>
            You're subscribed! We'll email you as soon as we're live.
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="you@example.com"
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
            />
            {fieldError && <span style={styles.fieldError}>{fieldError}</span>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={isLoading ? { ...styles.submitBtn, opacity: 0.6 } : styles.submitBtn}
          >
            {isLoading ? "Subscribing…" : "Notify Me"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: "0 16px",
    fontFamily: "'Georgia', serif",
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    padding: "36px 32px",
    width: "100%",
    maxWidth: "380px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    position: "relative",
  },
  homeLink: {
    display: "inline-block",
    fontSize: "12px",
    color: "#888",
    fontWeight: "600",
    textDecoration: "none",
    marginBottom: "12px",
    letterSpacing: "0.02em",
  },
  logoWrap: { display: "flex", justifyContent: "center", marginBottom: "8px" },
  logo: { height: "48px", width: "auto", objectFit: "contain" },
  subtitle: {
    textAlign: "center",
    fontSize: "13px",
    color: "#888",
    marginBottom: "24px",
    letterSpacing: "0.02em",
    lineHeight: "1.5",
  },
  errorBox: {
    backgroundColor: "#fff0f0",
    border: "1px solid #fca5a5",
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "13px",
    color: "#b91c1c",
    marginBottom: "16px",
  },
  successBox: {
    backgroundColor: "#f0fff4",
    border: "1px solid #86efac",
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "13px",
    color: "#166534",
    marginBottom: "16px",
  },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "5px" },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#111",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    backgroundColor: "#fafafa",
    color: "#111",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  inputFocus: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #111",
    borderRadius: "6px",
    outline: "none",
    backgroundColor: "#fff",
    color: "#111",
    boxSizing: "border-box",
  },
  fieldError: { fontSize: "11px", color: "#dc2626", marginTop: "2px" },
  submitBtn: {
    marginTop: "4px",
    width: "100%",
    padding: "11px",
    backgroundColor: "#111",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    letterSpacing: "0.04em",
    transition: "background-color 0.15s",
  },
};