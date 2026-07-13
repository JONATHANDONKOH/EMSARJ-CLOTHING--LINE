import { useState } from "react";
import { IconEdit, IconTrash, IconImage } from "../common/Icons";

export function ProductCard({ product, onEdit, onDelete }) {
  const [hover, setHover] = useState(false);

  const sizes        = product?.sizes       || [];
  const imageUrl     = product?.image_url   || null;
  const categoryName = product?.categories?.name || null;
  const productName  = product?.name        || "Unnamed";
  const productPrice = product?.price       ?? 0;
  const stockQty     = product?.stock_quantity ?? null;

  const isOutOfStock = stockQty !== null && stockQty <= 0;
  const isLowStock   = stockQty !== null && stockQty > 0 && stockQty <= 10;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#1e293b",
        borderRadius: "10px",
        overflow: "hidden",
        border: `1px solid ${hover ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.06)"}`,
        transition: "all 0.2s",
        position: "relative",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {/* IMAGE */}
      <div style={{ aspectRatio: "1", background: "#0f172a", overflow: "hidden", position: "relative" }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={productName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%", display: "flex",
            alignItems: "center", justifyContent: "center", color: "#334155",
          }}>
            <IconImage size={28} />
          </div>
        )}

        {/* Stock badges */}
        {isOutOfStock && (
          <span style={{
            position: "absolute", top: "6px", left: "6px",
            fontSize: "10px", fontWeight: 700, padding: "3px 7px", borderRadius: "4px",
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.35)",
            color: "#ef4444",
            backdropFilter: "blur(4px)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}>
            Out of Stock
          </span>
        )}
        {isLowStock && (
          <span style={{
            position: "absolute", top: "6px", left: "6px",
            fontSize: "10px", fontWeight: 700, padding: "3px 7px", borderRadius: "4px",
            background: "rgba(245,158,11,0.15)",
            border: "1px solid rgba(245,158,11,0.35)",
            color: "#f59e0b",
            backdropFilter: "blur(4px)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}>
            Low Stock · {stockQty} left
          </span>
        )}
      </div>

      {/* INFO */}
      <div style={{ padding: "10px" }}>

        {/* Name */}
        <p style={{
          margin: "0 0 2px", fontSize: "13px", fontWeight: 600, color: "#e2e8f0",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {productName}
        </p>

        {/* Price + Discount */}
        {(() => {
          const current = Number(productPrice) || 0;
          const discountAmount = 50;
          const discounted = Math.max(0, current - discountAmount);

          // Always render discount UI (even if discounted === current)
          // to ensure it is visible.
          return (
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "0 0 6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#10b981" }}>
                ₵{discounted.toFixed(2)}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#94a3b8",
                  textDecoration: "line-through",
                  textDecorationThickness: "2px",
                }}
              >
                ₵{current.toFixed(2)}
              </span>
            </div>
          );
        })()}

        {/* Size badges */}
        {sizes.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", marginBottom: "6px" }}>
            {sizes.map(s => (
              <span key={s} style={{
                fontSize: "10px", fontWeight: 500, padding: "2px 5px", borderRadius: "4px",
                background: "rgba(59,130,246,0.12)", color: "#60a5fa",
              }}>
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Category badge */}
        {categoryName && (
          <span style={{
            fontSize: "10px", padding: "2px 7px", borderRadius: "4px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "#64748b",
          }}>
            {categoryName}
          </span>
        )}
      </div>

      {/* HOVER ACTIONS */}
      {hover && (
        <div style={{
          position: "absolute", top: "6px", right: "6px",
          display: "flex", gap: "4px",
        }}>
          <button
            onClick={onEdit}
            style={{
              padding: "5px", borderRadius: "6px",
              background: "rgba(30,41,59,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#94a3b8", cursor: "pointer",
              display: "flex", alignItems: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            <IconEdit size={13} />
          </button>
          <button
            onClick={onDelete}
            style={{
              padding: "5px", borderRadius: "6px",
              background: "rgba(30,41,59,0.9)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#ef4444", cursor: "pointer",
              display: "flex", alignItems: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            <IconTrash size={13} />
          </button>
        </div>
      )}
    </div>
  );
}