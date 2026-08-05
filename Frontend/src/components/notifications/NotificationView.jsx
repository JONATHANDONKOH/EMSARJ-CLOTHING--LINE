import { useState } from "react";
import { IconBell } from "../common/Icons";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function NotificationsView() {
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [description, setDescription] = useState(
    "Notify all subscribers that EMSarj is now live."
  );

  async function handleNotifyAll() {
    setIsSending(true);
    setStatusMessage("");

    try {
      const res = await fetch(`${API_URL}/api/email/notify-all`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }), // send editable description
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to notify subscribers.");
      }

      setStatusMessage(data.message || "Subscribers notified successfully.");
    } catch (error) {
      console.error(error);
      setStatusMessage(error.message || "Unable to send notifications.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Dashboard</p>
          <h1 style={styles.title}>Notifications</h1>
        </div>

        <div style={styles.badge}>
          <IconBell size={16} />
          <span>Admin</span>
        </div>
      </div>

      <div style={styles.summaryCard}>
        <div>
          <p style={styles.summaryLabel}>Subscriber Notification</p>
          <h2 style={styles.summaryValue}>Send Update</h2>
        </div>

        <div style={styles.actions}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            style={styles.textarea}
          />

          <button
            type="button"
            onClick={handleNotifyAll}
            disabled={isSending}
            style={styles.notifyButton}
          >
            {isSending ? "Sending..." : "Notify subscribers"}
          </button>
        </div>
      </div>

      {statusMessage && <p style={styles.status}>{statusMessage}</p>}
    </div>
  );
}

const styles = {
  page: { display: "flex", flexDirection: "column", gap: "16px", color: "#f8fafc" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" },
  eyebrow: { margin: 0, fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#64748b", marginBottom: "4px" },
  title: { margin: 0, fontSize: "24px", fontWeight: 700 },
  badge: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "999px", background: "rgba(59, 130, 246, 0.16)", color: "#93c5fd", fontSize: "13px", fontWeight: 600 },
  summaryCard: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "18px 20px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(15,23,42,0.9))", border: "1px solid rgba(148, 163, 184, 0.2)" },
  summaryLabel: { margin: 0, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" },
  summaryValue: { margin: "4px 0 0", fontSize: "28px", fontWeight: 700, color: "#fff" },
  actions: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" },
  textarea: { width: "100%", padding: "10px", borderRadius: "8px", fontSize: "13px", color: "#0f172a" },
  notifyButton: { border: "none", borderRadius: "999px", padding: "10px 14px", background: "#ffffff", color: "#0f172a", fontSize: "13px", fontWeight: 700, cursor: "pointer" },
  status: { margin: 0, color: "#86efac", fontSize: "13px" },
};
