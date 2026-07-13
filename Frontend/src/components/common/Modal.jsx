import { IconX } from "./Icons";

export function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.6)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: "1rem"
    }}>
      <div style={{
        background: "#1e293b", borderRadius: "16px", width: "100%", maxWidth: "480px",
        maxHeight: "90vh", overflowY: "auto",
        border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 64px rgba(0,0,0,0.5)"
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)"
        }}>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#f1f5f9" }}>{title}</h2>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "8px",
            padding: "6px", cursor: "pointer", color: "#94a3b8", display: "flex",
            alignItems: "center", justifyContent: "center"
          }}>
            <IconX size={16} />
          </button>
        </div>
        <div style={{ padding: "1.5rem" }}>{children}</div>
      </div>
    </div>
  );
}
