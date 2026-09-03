import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import TopNav from "../components/common/TopNav";
import emmyLogo from "../assets/emmy.png";

// Self-correcting: works whether VITE_UPLOAD_API_URL ends in /api, has a
// trailing slash, or is missing entirely — always resolves to exactly one /api.
const RAW_BASE =
  import.meta.env.VITE_UPLOAD_API_URL || "https://emsarj-clothing-line.onrender.com";
const API_URL = RAW_BASE.replace(/\/api\/?$/, "").replace(/\/$/, "") + "/api";

export default function Account() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    number: "",
    location: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user === undefined) return; // authContext still checking — wait
    if (user === null) {
      navigate("/signin");
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/profile`, {
        credentials: "include", // cookie-based auth
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Could not load your profile.");
      }

      setForm({
        name: data.name || "",
        email: data.email || "",
        number: data.number || "",
        location: data.location || "",
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err.message);
      setError("Could not load your profile.");
    }
    setLoading(false);
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setMessage("");
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          number: form.number,
          location: form.location,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to update your profile. Please try again."
        );
      }

      setMessage("Profile updated successfully.");
      await refresh(); // sync authContext
    } catch (err) {
      console.error("Failed to update profile:", err.message);
      setError(
        err.message || "Failed to update your profile. Please try again."
      );
    }

    setSaving(false);
  }

  if (loading)
    return (
      <div style={styles.page}>
        <TopNav />
        <div style={styles.card}>
          <div style={styles.logoWrap}>
            <img src={emmyLogo} alt="EMSarj" style={styles.logo} />
          </div>
          <p style={styles.subtitle}>Loading your profile...</p>
        </div>
      </div>
    );

  return (
    <div style={styles.page}>
      <TopNav />
      <div style={styles.card}>
        <Link to="/" style={styles.homeLink}>← Home</Link>

        <div style={styles.logoWrap}>
          <img src={emmyLogo} alt="EMSarj" style={styles.logo} />
        </div>

        <p style={styles.subtitle}>Manage your profile information</p>

        {error && <div style={styles.errorBox}>{error}</div>}
        {message && <div style={styles.successBox}>{message}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="name" style={styles.label}>Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Kwame Mensah"
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              disabled
              title="Email cannot be changed here"
              style={{ ...styles.input, backgroundColor: "#f3f4f6", color: "#6b7280", cursor: "not-allowed" }}
            />
            <span style={styles.hint}>Email cannot be changed</span>
          </div>

          <div style={styles.field}>
            <label htmlFor="number" style={styles.label}>Phone Number</label>
            <input
              id="number"
              type="tel"
              name="number"
              value={form.number}
              onChange={handleChange}
              placeholder="+233 XX XXX XXXX"
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="location" style={styles.label}>Location</label>
            <input
              id="location"
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Accra, Ghana"
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
            />
          </div>

          <button type="submit" disabled={saving} style={saving ? { ...styles.submitBtn, opacity: 0.6 } : styles.submitBtn}>
            {saving ? "Saving..." : "Save Changes"}
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
    padding: "32px 16px 48px",
    fontFamily: "'Georgia', serif",
    position: "relative",
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    padding: "36px 32px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    position: "absolute",
    left: "50%",
    transform: "translate(-50%, 50px)",
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
    backgroundColor: "#f0fdf4",
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
  hint: {
    fontSize: "11px",
    color: "#6b7280",
    marginTop: "-2px",
  },
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