import { useState } from "react";
import { IconPlus } from "../common/Icons";

export function EmptySlot({ onAdd }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onAdd}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "rgba(59,130,246,0.05)" : "rgba(255,255,255,0.01)",
        borderRadius: "10px",
        border: `1.5px dashed ${hover ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)"}`,
        cursor: "pointer", transition: "all 0.2s",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", aspectRatio: "1", gap: "6px",
        color: hover ? "#3b82f6" : "#334155"
      }}>
      <IconPlus size={18} />
      <span style={{ fontSize: "11px", fontWeight: 500 }}>Add Product</span>
    </div>
  );
}
