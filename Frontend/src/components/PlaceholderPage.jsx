export function PlaceholderPage({ icon: Icon, title, description }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "16px", color: "#334155" }}>
      <div style={{ padding: "20px", background: "rgba(59,130,246,0.08)", borderRadius: "16px" }}>
        <Icon size={40} />
      </div>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 700, color: "#475569" }}>{title}</h2>
        <p style={{ margin: 0, fontSize: "14px", color: "#334155" }}>{description}</p>
      </div>
      <div style={{
        padding: "6px 14px", borderRadius: "99px", background: "rgba(59,130,246,0.1)",
        fontSize: "12px", fontWeight: 600, color: "#3b82f6"
      }}>Coming Soon</div>
    </div>
  );
}
