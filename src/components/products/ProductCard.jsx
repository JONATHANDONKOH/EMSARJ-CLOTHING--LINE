import { useState } from "react";
import { IconEdit, IconTrash, IconImage } from "../common/Icons";

// ─── ProductCard ──────────────────────────────────────────────

export function ProductCard({ product, onEdit, onDelete }) {
  const [hover, setHover] = useState(false);
  const { currency, formatPrice, rate, loading: rateLoading } = useCurrency();

  const sizes = product?.sizes || [];
  const imageUrl = product?.image_url || null;
  const categoryName = product?.categories?.name || null;
  const productName = product?.name || "Unnamed";
  const productPrice = product?.price ?? 0;

  const displayPrice = rateLoading && currency === 'GHS' 
    ? 'Loading...' 
    : formatPrice(productPrice);

  // Calculate other currency for hover preview
  const otherCurrency = currency === 'USD' ? 'GHS' : 'USD';
  const otherPrice = currency === 'USD' 
    ? (rate ? `₵${(productPrice * rate).toFixed(2)}` : null)
    : `$${productPrice.toFixed(2)}`;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#1e293b", borderRadius: "10px", overflow: "hidden",
        border: `1px solid ${hover ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.06)"}`,
        transition: "all 0.2s", position: "relative",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {/* IMAGE */}
      <div style={{ aspectRatio: "1", background: "#0f172a", overflow: "hidden" }}>
        {imageUrl
          ? <img
              src={imageUrl}
              alt={productName}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          : <div style={{
              width: "100%", height: "100%", display: "flex",
              alignItems: "center", justifyContent: "center", color: "#334155",
            }}>
              <IconImage size={28} />
            </div>
        }
      </div>

      {/* INFO */}
      <div style={{ padding: "10px" }}>
        <p style={{
          margin: "0 0 2px", fontSize: "13px", fontWeight: 600, color: "#e2e8f0",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {productName}
        </p>

        <p style={{ 
          margin: "0 0 6px", 
          fontSize: "13px", 
          fontWeight: 700, 
          color: currency === 'USD' ? "#3b82f6" : "#10b981"
        }}>
          {displayPrice}
          {rateLoading && currency === 'GHS' && (
            <span style={{ fontSize: "10px", marginLeft: "4px", color: "#64748b" }}>
              fetching rate...
            </span>
          )}
        </p>

        {/* Show other currency on hover */}
        {hover && otherPrice && !rateLoading && (
          <p style={{ 
            margin: "0 0 6px", 
            fontSize: "10px", 
            fontWeight: 400, 
            color: "#64748b",
            animation: "fadeIn 0.2s ease"
          }}>
            {otherCurrency}: {otherPrice}
          </p>
        )}

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
          position: "absolute", top: "6px", right: "6px", display: "flex", gap: "4px",
        }}>
          <button
            onClick={onEdit}
            style={{
              padding: "5px", borderRadius: "6px",
              background: "rgba(30,41,59,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#94a3b8", cursor: "pointer",
              display: "flex", alignItems: "center", backdropFilter: "blur(4px)",
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
              display: "flex", alignItems: "center", backdropFilter: "blur(4px)",
            }}
          >
            <IconTrash size={13} />
          </button>
        </div>
      )}
    </div>
  );
}