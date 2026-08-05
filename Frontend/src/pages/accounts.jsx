import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import TopNav from "../components/common/TopNav";

const API_URL = import.meta.env.VITE_UPLOAD_API_URL || "https://emsarj-clothing-line.onrender.com";

export default function Account() {
  const { user, session, refresh } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({
    name:     "",
    email:    "",
    number:   "",
    location: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError]     = useState("");

  useEffect(() => {
    if (session === undefined) return; // auth still resolving
    if (!session || !user) { navigate("/signin"); return; }
    fetchProfile();
  }, [session, user, navigate]);

  async function fetchProfile() {
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Could not load your profile.");
      }

      setForm({
        name:     data.name     || "",
        email:    data.email    || "",
        number:   data.number   || "",
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

    if (!session) {
      setError("Session expired. Please sign in again.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name:     form.name,
          number:   form.number,
          location: form.location,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to update your profile. Please try again.");
      }

      setMessage("Profile updated successfully.");
      // Keep authContext's `user` (used elsewhere, e.g. TopNav) in sync
      // with what was just saved.
      await refresh();
    } catch (err) {
      console.error("Failed to update profile:", err.message);
      setError(err.message || "Failed to update your profile. Please try again.");
    }

    setSaving(false);
  }

  if (loading) return (
    <div className="account-page">
      <TopNav />
      <div className="account-loading">Loading your profile...</div>
    </div>
  );

  return (
    <div className="account-page">
      <TopNav />

      <div className="account-container">
        <h1 className="account-title">My Account</h1>
        <p className="account-subtitle">Manage your profile information</p>

        <form className="account-form" onSubmit={handleSubmit}>

          <div className="account-field">
            <label className="account-label">Full Name</label>
            <input
              className="account-input"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Kwame Mensah"
            />
          </div>

          <div className="account-field">
            <label className="account-label">Email</label>
            <input
              className="account-input account-input--disabled"
              type="email"
              name="email"
              value={form.email}
              disabled
              title="Email cannot be changed here"
            />
            <span className="account-input-hint">Email cannot be changed</span>
          </div>

          <div className="account-field">
            <label className="account-label">Phone Number</label>
            <input
              className="account-input"
              type="tel"
              name="number"
              value={form.number}
              onChange={handleChange}
              placeholder="+233 XX XXX XXXX"
            />
          </div>

          <div className="account-field">
            <label className="account-label">Location</label>
            <input
              className="account-input"
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Accra, Ghana"
            />
          </div>

          {error   && <p className="account-error">{error}</p>}
          {message && <p className="account-success">{message}</p>}

          <button
            className="account-save-btn"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </form>
      </div>
    </div>
  );
}