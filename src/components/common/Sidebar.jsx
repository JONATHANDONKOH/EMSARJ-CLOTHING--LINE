import emmyLogo from "../../assets/emmy.png";
import { IconGrid, IconPackage, IconShoppingBag, IconUsers, IconCreditCard } from "./Icons";

const NAV = [
  { id: "categories", label: "Categories", Icon: IconGrid },
  { id: "products", label: "Products", Icon: IconPackage },
  { id: "orders", label: "Orders", Icon: IconShoppingBag },
  { id: "users", label: "Users", Icon: IconUsers },
  { id: "payments", label: "Payments", Icon: IconCreditCard },
];

export function Sidebar({ active, onChange, sidebarOpen, setSidebarOpen }) {
  return (
    <>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40,
            display: "none"
          }}
          className="mobile-overlay"
        />
      )}

      <aside style={{
        width: "220px", minWidth: "220px", background: "#ffffff",
        borderRight: "1px solid rgba(0,0,0,0.1)",
        display: "flex", flexDirection: "column", height: "100vh",
        position: "sticky", top: 0
      }}>

        {/* ── Logo ── */}
        <div style={{
          padding: "1.25rem 1.25rem 1rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <img
            src={emmyLogo}
            alt="EMSarj"
            style={{ height: "40px", width: "auto", objectFit: "contain" }}
          />
        </div>

        {/* ── Nav ── */}
        <nav style={{ flex: 1, padding: "0.75rem 0.75rem" }}>
          <p style={{
            margin: "0 0 6px", padding: "0 8px", fontSize: "10px",
            fontWeight: 600, color: "#334155", letterSpacing: "0.08em", textTransform: "uppercase"
          }}>
            Main Menu
          </p>
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => { onChange(id); setSidebarOpen(false); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "10px",
                padding: "8px 10px", borderRadius: "8px", border: "none", cursor: "pointer",
                background: active === id ? "rgba(59,130,246,0.15)" : "transparent",
                color: active === id ? "#60a5fa" : "#475569",
                fontSize: "13px", fontWeight: active === id ? 600 : 400, marginBottom: "2px",
                transition: "all 0.15s", textAlign: "left"
              }}
            >
              <Icon size={16} />
              {label}
              {active === id && (
                <div style={{
                  marginLeft: "auto", width: "4px", height: "4px",
                  borderRadius: "99px", background: "#3b82f6"
                }} />
              )}
            </button>
          ))}
        </nav>

        {/* ── Admin user ── */}
        <div style={{ padding: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: 700, color: "#fff", flexShrink: 0
            }}>A</div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                margin: 0, fontSize: "13px", fontWeight: 600, color: "#e2e8f0",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
              }}>Admin</p>
              <p style={{ margin: 0, fontSize: "11px", color: "#475569" }}>admin@clothify.com</p>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}