// src/pages/UserMessages.jsx
import { useEffect, useState } from "react";
import supabase from "../supabasefol/supabaseClient";
import { insertEmail } from "../context/emailfunction";

export function UserMessages() {
  const [emails, setEmails] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // No user_id filter needed here — RLS policy "Users view messages"
  // (auth.uid() = user_id) already scopes this to the signed-in user's own thread.
  const fetchEmails = async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("emails")
      .select("id, sender_role, message, created_at")
      .order("created_at", { ascending: true });

    if (fetchError) {
      setError("Couldn't load your messages. Please try again.");
    } else {
      setEmails(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = message.trim();
    if (!trimmed) return;

    try {
      setSending(true);
      await insertEmail(trimmed);
      setMessage("");
      await fetchEmails();
    } catch (err) {
      setError(err.message || "Something went wrong sending your message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: "16px" }}>Your Messages</h2>

      {error && (
        <p
          style={{
            margin: "0 0 12px",
            fontSize: "13px",
            color: "#ef4444",
            background: "rgba(239,68,68,0.1)",
            padding: "8px 12px",
            borderRadius: "6px",
          }}
        >
          {error}
        </p>
      )}

      {loading && <p>Loading…</p>}

      <div style={{ maxHeight: "400px", overflowY: "auto", marginBottom: "12px" }}>
        {emails.map((msg) => (
          <div
            key={msg.id}
            style={{
              textAlign: msg.sender_role === "admin" ? "left" : "right",
              margin: "6px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: "8px",
                background: msg.sender_role === "admin" ? "#334155" : "#3b82f6",
                color: "#fff",
                maxWidth: "70%",
                wordBreak: "break-word",
              }}
            >
              {msg.message}
            </span>
            <div style={{ fontSize: "10px", color: "#666" }}>
              {new Date(msg.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} style={{ display: "flex", gap: "8px" }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send a message to Emsarj…"
          rows={2}
          style={{ flex: 1, resize: "none", padding: "8px", borderRadius: "6px" }}
        />
        <button type="submit" disabled={sending}>
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}