import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import supabase from "../supabasefol/supabaseClient";
import TopNav from "../components/common/TopNav";

export default function Account() {
  const { user } = useAuth();
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
    if (!user) { navigate("/signin"); return; }
    fetchProfile();
  }, [user, navigate]);

  async function fetchProfile() {
    setLoading(true);

    // ── Use getSession not user.id ──
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/signin"); return; }

    const { data, error } = await supabase
      .from("users")
      .select("name, email, number, location")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Failed to fetch profile:", error.message);
      setError("Could not load your profile.");
    } else if (data) {
      setForm({
        name:     data.name     || "",
        email:    data.email    || "",
        number:   data.number   || "",
        location: data.location || "",
      });
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

    // ── Use getSession for update too ──
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError("Session expired. Please sign in again.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        name:     form.name,
        number:   form.number,
        location: form.location,
      })
      .eq("id", session.user.id);

    if (updateError) {
      console.error("Failed to update profile:", updateError.message);
      setError("Failed to update your profile. Please try again.");
    } else {
      setMessage("Profile updated successfully.");
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