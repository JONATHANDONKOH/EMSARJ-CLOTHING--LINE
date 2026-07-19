// src/emails/EmailView.jsx
import { useEffect, useState } from "react";
import supabase from "../supabasefol/supabaseClient";

export function EmailView() {
  const [emails, setEmails] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEmails = async () => {
    setLoading(true);
    // Adjust "users ( name, email )" to whatever columns actually exist
    // on your users table if this errors.
    const { data, error } = await supabase
      .from("emails")
      .select("id, user_id, sender_role, message, created_at, users ( name, email )")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching emails:", error);
    } else {
      setEmails(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  // Group flat message list into one thread per user_id
  const conversations = emails.reduce((acc, email) => {
    if (!acc[email.user_id]) acc[email.user_id] = [];
    acc[email.user_id].push(email);
    return acc;
  }, {});

  const conversationList = Object.entries(conversations).map(([userId, msgs]) => ({
    userId,
    userLabel: msgs[0]?.users?.name || msgs[0]?.users?.email || userId,
    lastMessage: msgs[msgs.length - 1],
  }));

  const activeThread = selectedUserId ? conversations[selectedUserId] || [] : [];

  const handleReply = async (e) => {
    e.preventDefault();
    const trimmed = reply.trim();
    if (!trimmed || !selectedUserId) return;

    try {
      setSending(true);
      const { error } = await supabase.from("emails").insert([
        {
          user_id: selectedUserId,
          sender_role: "admin",
          message: trimmed,
        },
      ]);
      if (error) throw error;
      setReply("");
      await fetchEmails();
    } catch (err) {
      console.error("Error sending reply:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* Conversation list */}
      <div style={{ width: "260px", borderRight: "1px solid #333" }}>
        <h2 style={{ fontSize: "16px" }}>Conversations</h2>
        {loading && <p>Loading…</p>}
        {conversationList.map((c) => (
          <div
            key={c.userId}
            onClick={() => setSelectedUserId(c.userId)}
            style={{
              padding: "10px",
              cursor: "pointer",
              background: selectedUserId === c.userId ? "#1e293b" : "transparent",
              borderBottom: "1px solid #222",
            }}
          >
            <p style={{ margin: 0, fontWeight: 600, fontSize: "13px" }}>{c.userLabel}</p>
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                color: "#888",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {c.lastMessage.message}
            </p>
          </div>
        ))}
      </div>

      {/* Thread */}
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: "16px" }}>Messages</h2>
        {!selectedUserId && <p>Select a conversation to view messages.</p>}

        {selectedUserId && (
          <>
            <div style={{ maxHeight: "400px", overflowY: "auto", marginBottom: "12px" }}>
              {activeThread.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    textAlign: msg.sender_role === "admin" ? "right" : "left",
                    margin: "6px 0",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: msg.sender_role === "admin" ? "#3b82f6" : "#334155",
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

            <form onSubmit={handleReply} style={{ display: "flex", gap: "8px" }}>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type a reply…"
                rows={2}
                style={{ flex: 1, resize: "none", padding: "8px", borderRadius: "6px" }}
              />
              <button type="submit" disabled={sending}>
                {sending ? "Sending…" : "Reply"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}