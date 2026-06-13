import { useState, useEffect } from "react";
import supabase from "../supabasefol/supabaseClient";

export default function OrdersView() {
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState(null); // order id
  const [itemsMap, setItemsMap]     = useState({});   // { [order_id]: items[] }
  const [itemsLoading, setItemsLoading] = useState(false);

  /* ── fetch all orders ── */
  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, customer_name, customer_phone, total, status")
        .order("created_at", { ascending: false });

      if (error) console.error("fetchOrders:", error);
      else setOrders(data || []);
      setLoading(false);
    }
    fetchOrders();
  }, []);

  /* ── toggle expand: fetch items for that order ── */
  async function toggleOrder(orderId) {
    if (expanded === orderId) { setExpanded(null); return; }

    setExpanded(orderId);

    if (itemsMap[orderId]) return; // already fetched

    setItemsLoading(true);
    const { data, error } = await supabase
      .from("orderItems")
      .select(`
        id,
        quantity,
        size,
        price,
        product_id,
        products ( id, name, image_url )
      `)
      .eq("order_id", orderId);

    if (error) console.error("fetchOrderItems:", error);
    else setItemsMap(prev => ({ ...prev, [orderId]: data || [] }));
    setItemsLoading(false);
  }

  /* ── status badge colour ── */
  function badgeStyle(status) {
    const map = {
      paid:      { background: "rgba(34,197,94,0.12)",  color: "#4ade80" },
      pending:   { background: "rgba(234,179,8,0.12)",  color: "#facc15" },
      cancelled: { background: "rgba(239,68,68,0.12)",  color: "#f87171" },
    };
    return map[status] || { background: "rgba(255,255,255,0.06)", color: "#94a3b8" };
  }

  /* ── format date ── */
  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  }

  return (
    <div>

      {/* header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 700, color: "#f1f5f9" }}>
          Orders
        </h1>
        <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* loading */}
      {loading && (
        <p style={{ color: "#94a3b8", textAlign: "center", padding: "3rem 0" }}>
          Loading orders…
        </p>
      )}

      {/* empty */}
      {!loading && orders.length === 0 && (
        <div style={{
          textAlign: "center", padding: "4rem 2rem",
          background: "#1e293b", borderRadius: "14px",
          border: "1px dashed rgba(255,255,255,0.08)",
        }}>
          <p style={{ color: "#475569", fontSize: "15px", margin: 0 }}>No orders yet.</p>
        </div>
      )}

      {/* orders list */}
      {!loading && orders.map(order => {
        const isOpen = expanded === order.id;
        const items  = itemsMap[order.id] || [];

        return (
          <div
            key={order.id}
            style={{
              background: "#1e293b",
              border: `1px solid ${isOpen ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.06)"}`,
              borderRadius: "12px",
              marginBottom: "10px",
              overflow: "hidden",
              transition: "border-color 0.2s",
            }}
          >
            {/* ── order row ── */}
            <div
              onClick={() => toggleOrder(order.id)}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "14px 18px", cursor: "pointer",
                flexWrap: "wrap",
              }}
            >
              {/* chevron */}
              <span style={{
                color: "#475569", fontSize: "12px",
                transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.2s", flexShrink: 0,
              }}>▶</span>

              {/* order id */}
              <span style={{ fontSize: "12px", color: "#475569", flexShrink: 0, fontFamily: "monospace" }}>
                #{order.id.slice(0, 8)}
              </span>

              {/* name */}
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#f1f5f9", flex: 1, minWidth: "100px" }}>
                {order.customer_name || "—"}
              </span>

              {/* phone */}
              <span style={{ fontSize: "13px", color: "#64748b", minWidth: "110px" }}>
                {order.customer_phone || "—"}
              </span>

              {/* date */}
              <span style={{ fontSize: "12px", color: "#475569", minWidth: "90px" }}>
                {fmtDate(order.created_at)}
              </span>

              {/* total */}
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9", minWidth: "80px", textAlign: "right" }}>
                ₵{Number(order.total || 0).toFixed(2)}
              </span>

              {/* status */}
              <span style={{
                ...badgeStyle(order.status),
                padding: "3px 10px", borderRadius: "999px",
                fontSize: "11px", fontWeight: 600, flexShrink: 0,
              }}>
                {order.status || "pending"}
              </span>
            </div>

            {/* ── expanded: order items ── */}
            {isOpen && (
              <div style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                padding: "14px 18px",
                background: "rgba(0,0,0,0.2)",
              }}>
                {itemsLoading && !items.length ? (
                  <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>Loading items…</p>
                ) : items.length === 0 ? (
                  <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>No items found for this order.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {items.map(item => (
                      <div key={item.id} style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        background: "#0f172a", borderRadius: "8px", padding: "10px 14px",
                      }}>
                        {/* product image */}
                        {item.products?.image_url ? (
                          <img
                            src={item.products.image_url}
                            alt={item.products?.name}
                            style={{ width: "44px", height: "44px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{
                            width: "44px", height: "44px", borderRadius: "6px",
                            background: "#1e293b", flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "18px",
                          }}>📦</div>
                        )}

                        {/* product name */}
                        <span style={{ flex: 1, fontSize: "13px", fontWeight: 600, color: "#e2e8f0" }}>
                          {item.products?.name || "Unknown product"}
                        </span>

                        {/* size */}
                        {item.size && (
                          <span style={{
                            fontSize: "11px", fontWeight: 600, color: "#60a5fa",
                            background: "rgba(59,130,246,0.12)", padding: "2px 8px",
                            borderRadius: "4px",
                          }}>
                            {item.size}
                          </span>
                        )}

                        {/* qty */}
                        <span style={{ fontSize: "13px", color: "#64748b", minWidth: "40px", textAlign: "center" }}>
                          ×{item.quantity}
                        </span>

                        {/* price */}
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9", minWidth: "70px", textAlign: "right" }}>
                          ₵{Number(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}

                    {/* subtotal */}
                    <div style={{
                      display: "flex", justifyContent: "flex-end",
                      paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      <span style={{ fontSize: "13px", color: "#475569", marginRight: "12px" }}>Order total</span>
                      <span style={{ fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>
                        ₵{Number(order.total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}