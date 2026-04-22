export function InputField({ label, error, ...props }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#94a3b8", marginBottom: "6px" }}>
        {label}
      </label>
      <input
        {...props}
        style={{
          width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${error ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
          borderRadius: "8px", padding: "8px 12px", color: "#f1f5f9", fontSize: "14px",
          outline: "none", boxSizing: "border-box",
          transition: "border-color 0.15s"
        }}
      />
      {error && <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#ef4444" }}>{error}</p>}
    </div>
  );
}
