import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function MessagesView() {
  const { session } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!session) return;
    fetchMessages();
  }, [session]);

  async function fetchMessages() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/messages/admin`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch messages (status ${res.status})`);
      const data = await res.json();
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
      setError(err.message || "Failed to load messages.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this message? This can't be undone.")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/messages/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to delete message (status ${res.status})`);

      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      console.error("❌ Error deleting message:", err);
      setError(err.message || "Failed to delete message.");
    } finally {
      setDeletingId(null);
    }
  }

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div className="pd-loading-dots"><span /><span /><span /></div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Messages</h1>
        <span style={styles.count}>{messages.length} message{messages.length === 1 ? "" : "s"}</span>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {messages.length === 0 && !error ? (
        <div style={styles.empty}>
          <p style={styles.emptyText}>No messages yet.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {messages.map((msg) => {
            const isOpen = expandedId === msg.id;
            const isDeleting = deletingId === msg.id;

            return (
              <div key={msg.id} style={styles.row}>
                <div style={styles.rowTop} onClick={() => toggleExpand(msg.id)}>
                  <div style={styles.senderBlock}>
                    <span style={styles.senderName}>{msg.sender_name || "Unknown user"}</span>
                    {msg.subject && <span style={styles.subject}>{msg.subject}</span>}
                  </div>
                  <div style={styles.rowRight}>
                    <span style={styles.date}>{formatDate(msg.created_at)}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(msg.id);
                      }}
                      disabled={isDeleting}
                      style={isDeleting ? { ...styles.deleteBtn, opacity: 0.5 } : styles.deleteBtn}
                    >
                      {isDeleting ? "…" : "Delete"}
                    </button>
                  </div>
                </div>

                <p
                  style={{
                    ...styles.preview,
                    ...(isOpen ? styles.previewOpen : {}),
                  }}
                  onClick={() => toggleExpand(msg.id)}
                >
                  {msg.body || ""}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'Calibri', Arial, sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  title: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#111",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  count: {
    fontSize: "12px",
    color: "#aaa",
    fontWeight: 400,
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
  empty: {
    padding: "60px 20px",
    textAlign: "center",
  },
  emptyText: {
    fontSize: "13px",
    color: "#888",
  },
  loadingWrap: {
    display: "flex",
    justifyContent: "center",
    padding: "60px 0",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid #eee",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  row: {
    padding: "14px 16px",
    borderBottom: "1px solid #f0f0f0",
    transition: "background-color 0.15s",
  },
  rowTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "4px",
    cursor: "pointer",
  },
  senderBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
  },
  senderName: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#111",
  },
  subject: {
    fontSize: "12px",
    color: "#888",
  },
  rowRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },
  date: {
    fontSize: "11px",
    color: "#aaa",
    whiteSpace: "nowrap",
  },
  deleteBtn: {
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    color: "#c00",
    background: "none",
    border: "1px solid #f0c0c0",
    borderRadius: "4px",
    padding: "3px 8px",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  preview: {
    fontSize: "13px",
    color: "#555",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: 1.5,
    cursor: "pointer",
  },
  previewOpen: {
    whiteSpace: "normal",
    overflow: "visible",
    textOverflow: "clip",
  },
};