// src/pages/Account.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import supabase from "../supabasefol/supabaseClient";

export default function Account() {
  const { user, supabase: client } = useAuth();
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
    if (!user) {
      navigate("/signin");
      return;
    }

    async function fetchProfile() {
      const { data, error } = await supabase
        .from("users")
        .select("name, email, number, location")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Failed to fetch profile:", error.message);
        setError("Could not load your profile.");
      } else if (data) {
        setForm({
          name: data.name || "",
          email: data.email || "",
          number: data.number || "",
          location: data.location || "",
        });
      }

      setLoading(false);
    }

    fetchProfile();
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const { error: updateError } = await supabase
      .from("users")
      .update({
        name: form.name,
        number: form.number,
        location: form.location,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to update profile:", updateError.message);
      setError("Failed to update your profile. Please try again.");
    } else {
      setMessage("Profile updated successfully.");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="account-page">
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="account-page">
      <h1 className="account-title">My Account</h1>

      <form className="account-form" onSubmit={handleSubmit}>
        <label className="account-label">
          Full Name
          <input
            className="account-input"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label className="account-label">
          Email
          <input
            className="account-input"
            type="email"
            name="email"
            value={form.email}
            disabled
            title="Email cannot be changed here"
          />
        </label>

        <label className="account-label">
          Phone Number
          <input
            className="account-input"
            type="tel"
            name="number"
            value={form.number}
            onChange={handleChange}
          />
        </label>

        <label className="account-label">
          Location
          <input
            className="account-input"
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
          />
        </label>

        {error && <p className="account-error">{error}</p>}
        {message && <p className="account-success">{message}</p>}

        <button className="account-save-btn" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}