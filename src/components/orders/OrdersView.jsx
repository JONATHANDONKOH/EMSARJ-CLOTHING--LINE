import { useState, useEffect } from "react";
import supabase from "../../supabasefol/supabaseClient";
import { IconShoppingBag } from "../common/Icons";

const STATUS = ["pending", "paid", "cancelled"];

const STATUS_COLORS = {
  pending:   "#f59e0b",
  paid:      "#10b981",
  cancelled: "#ef4444",
};

export default function OrdersView({ user }) {
  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(false);
  const [filter, setFilter]               = useState("all");
  const [toasts, setToasts]               = useState([]);
  const [expanded, setExpanded]           = useState(null);
  const [itemsMap, setItemsMap]           = useState({});
  const [itemsLoading, setItemsLoading]   = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateStatus, setUpdateStatus]   = useState("pending");

  function toast(type, msg) {
    const id = Date.now();
    setToasts(p => [...p, { id, type, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }

  async function fetchOrders() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone_number,
          subtotal,
          delivery_fee,
          total,
          status,
          payment_reference,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (error) {
        toast("err", `Database Error: ${error.message}`);
        setOrders([]);
      } else {
        setOrders(data || []);
        toast("ok", `Loaded ${data.length} orders`);
      }
    } catch (err) {
      toast("err", `Unexpected Error: ${err.message}`);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchOrders(); }, []);

  async function toggleExpand(orderId) {
    if (expanded === orderId) { setExpanded(null); return; }
    setExpanded(orderId);
    if (itemsMap[orderId]) return;

    setItemsLoading(true);
    try {
      const { data, error } = await supabase
        .from("orderItems")
        .select(`
          id,
          product_name,
          size,
          qty,
          price
        `)
        .eq("order_id", orderId);

      if (error) {
        toast("err", error.message);
      } else {
        setItemsMap(prev => ({ ...prev, [orderId]: data || [] }));
      }
    } catch (err) {
      toast("err", "Failed to load order items");
    } finally {
      setItemsLoading(false);
    }
  }

  async function handleUpdate() {
    if (!selectedOrder) return toast("err", "Select an order");
    setLoading(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: updateStatus })
        .eq("id", selectedOrder.id);

      if (error) {
        toast("err", error.message);
      } else {
        toast("ok", "Status updated");
        fetchOrders();
      }
    } catch (err) {
      toast("err", `Update failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedOrder) return toast("err", "Select an order");
    if (!window.confirm(`Delete order #${selectedOrder.id.slice(0, 8)}?`)) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", selectedOrder.id);

      if (error) {
        toast("err", error.message);
      } else {
        toast("ok", "Order deleted");
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err) {
      toast("err", `Delete failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const filtered = orders.filter(o => filter === "all" || o.status === filter);

  return (
    <div>

      {/* ── Header ── */}
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 700, color: "#f1f5f9" }}>Orders</h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
            {orders.length} total orders {loading && "(loading...)"}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          style={{
            padding: "8px 14px", background: "#3b82f6", border: "none",
            borderRadius: "8px", color: "#fff", fontSize: "13px", cursor: "pointer"
          }}
        >🔄 Refresh</button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px", marginBottom: "1.5rem" }}>
        {[
          { label: "Total",     value: orders.length,                                      color: "#3b82f6" },
          { label: "Pending",   value: orders.filter(o => o.status === "pending").length,  color: "#f59e0b" },
          { label: "Paid",      value: orders.filter(o => o.status === "paid").length,     color: "#10b981" },
          { label: "Cancelled", value: orders.filter(o => o.status === "cancelled").length,color: "#ef4444" },
        ].map(stat => (
          <div key={stat.label} style={{
            background: "#1e293b", borderRadius: "12px", padding: "1rem",
            border: "1px solid rgba(255,255,255,0.06)"
          }}>
            <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#475569", fontWeight: 500 }}>{stat.label}</p>
            <p style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Manage Panel ── */}
      {selectedOrder && (
        <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#1e293b", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 600, color: "#e2e8f0" }}>
            Managing: <span style={{ color: "#60a5fa" }}>#{selectedOrder.id?.slice(0, 8)}</span>
          </p>
          <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#475569" }}>
            {selectedOrder.first_name} {selectedOrder.last_name} · {selectedOrder.email}
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <select
              value={updateStatus}
              onChange={e => setUpdateStatus(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px", padding: "10px 14px", color: "#f1f5f9", fontSize: "14px", outline: "none"
              }}
            >
              {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={handleUpdate} disabled={loading} style={{
              padding: "10px 20px", borderRadius: "8px", border: "none",
              background: "#3b82f6", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer"
            }}>Update Status</button>
            <button onClick={handleDelete} disabled={loading} style={{
              padding: "10px 20px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.3)",
              background: "transparent", color: "#ef4444", fontSize: "14px", fontWeight: 600, cursor: "pointer"
            }}>Delete Order</button>
          </div>
        </div>
      )}

      {/* ── Filter ── */}
      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {["all", ...STATUS].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer",
            background: filter === f ? "#3b82f6" : "rgba(255,255,255,0.05)",
            color: filter === f ? "#fff" : "#64748b",
            fontSize: "12px", fontWeight: 500, textTransform: "capitalize"
          }}>{f}</button>
        ))}
      </div>

      {/* ── Orders List ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#475569" }}>Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#334155" }}>
          <IconShoppingBag size={40} />
          <p style={{ marginTop: "12px", color: "#475569" }}>
            {orders.length === 0 ? "No orders found" : `No ${filter} orders`}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map(order => {
            const isOpen = expanded === order.id;
            const items  = itemsMap[order.id] || [];

            return (
              <div key={order.id} style={{
                background: "#1e293b",
                border: `1px solid ${isOpen ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: "12px", overflow: "hidden", transition: "border-color 0.2s"
              }}>

                {/* ── Order Row ── */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", flexWrap: "wrap" }}>

                  {/* Expand arrow */}
                  <span
                    onClick={() => toggleExpand(order.id)}
                    style={{
                      cursor: "pointer", color: "#475569", fontSize: "12px", flexShrink: 0,
                      display: "inline-block",
                      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s"
                    }}
                  >▶</span>

                  {/* Order ID */}
                  <span style={{ fontSize: "12px", color: "#475569", fontFamily: "monospace", flexShrink: 0 }}>
                    #{order.id?.slice(0, 8)}
                  </span>

                  {/* Customer name */}
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0", flexShrink: 0 }}>
                    {order.first_name} {order.last_name}
                  </span>

                  {/* Email */}
                  <span style={{ fontSize: "12px", color: "#475569", flexShrink: 0 }}>
                    {order.email}
                  </span>

                  {/* Total */}
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#3b82f6", minWidth: "80px" }}>
                    ₵{Number(order.total || 0).toFixed(2)}
                  </span>

                  {/* Status badge */}
                  <span style={{
                    padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
                    background: `${STATUS_COLORS[order.status]}22`,
                    color: STATUS_COLORS[order.status], textTransform: "capitalize", flexShrink: 0
                  }}>{order.status}</span>

                  {/* Date */}
                  <span style={{ fontSize: "12px", color: "#475569", marginLeft: "auto" }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>

                  {/* Select button */}
                  <button
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    style={{
                      padding: "5px 10px", borderRadius: "6px", fontSize: "12px", cursor: "pointer",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: selectedOrder?.id === order.id ? "#3b82f6" : "transparent",
                      color: selectedOrder?.id === order.id ? "#fff" : "#64748b",
                    }}
                  >{selectedOrder?.id === order.id ? "Selected" : "Select"}</button>
                </div>

                {/* ── Expanded Items ── */}
                {isOpen && (
                  <div style={{
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    padding: "14px 16px", background: "rgba(0,0,0,0.2)"
                  }}>

                    {/* Customer details */}
                    <div style={{ marginBottom: "12px", padding: "10px 14px", background: "#0f172a", borderRadius: "8px" }}>
                      <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Customer</p>
                      <p style={{ margin: "0 0 2px", fontSize: "13px", color: "#e2e8f0" }}>{order.first_name} {order.last_name}</p>
                      <p style={{ margin: "0 0 2px", fontSize: "13px", color: "#475569" }}>{order.email}</p>
                      <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>{order.phone_number}</p>
                    </div>

                    {/* Items */}
                    {itemsLoading && !items.length ? (
                      <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>Loading items…</p>
                    ) : items.length === 0 ? (
                      <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>No items for this order.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {items.map(item => (
                          <div key={item.id} style={{
                            display: "flex", alignItems: "center", gap: "12px",
                            background: "#0f172a", borderRadius: "8px", padding: "10px 14px"
                          }}>
                            <div style={{
                              width: "44px", height: "44px", borderRadius: "6px",
                              background: "#1e293b", flexShrink: 0,
                              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px"
                            }}>📦</div>

                            <span style={{ flex: 1, fontSize: "13px", fontWeight: 600, color: "#e2e8f0" }}>
                              {item.product_name}
                            </span>

                            {item.size && (
                              <span style={{
                                fontSize: "11px", fontWeight: 600, color: "#60a5fa",
                                background: "rgba(59,130,246,0.12)", padding: "2px 8px", borderRadius: "4px"
                              }}>{item.size}</span>
                            )}

                            <span style={{ fontSize: "13px", color: "#64748b" }}>×{item.qty}</span>

                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9", minWidth: "70px", textAlign: "right" }}>
                              ₵{Number(item.price).toFixed(2)}
                            </span>
                          </div>
                        ))}

                        {/* Order totals */}
                        <div style={{
                          padding: "10px 14px", background: "#0f172a", borderRadius: "8px",
                          display: "flex", flexDirection: "column", gap: "6px"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569" }}>
                            <span>Subtotal</span>
                            <span>₵{Number(order.subtotal || 0).toFixed(2)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569" }}>
                            <span>Delivery</span>
                            <span>₵{Number(order.delivery_fee || 0).toFixed(2)}</span>
                          </div>
                          <div style={{
                            display: "flex", justifyContent: "space-between",
                            fontSize: "15px", fontWeight: 700, color: "#f1f5f9",
                            paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "2px"
                          }}>
                            <span>Total</span>
                            <span>₵{Number(order.total || 0).toFixed(2)}</span>
                          </div>
                          {order.payment_reference && (
                            <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#334155" }}>
                              Ref: <code style={{ color: "#475569" }}>{order.payment_reference}</code>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Toasts ── */}
      <div style={{ position: "fixed", bottom: 20, right: 20, display: "flex", flexDirection: "column", gap: "8px", zIndex: 999 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: "12px 16px", borderRadius: "8px",
            background: t.type === "ok" ? "#10b981" : "#ef4444",
            color: "#fff", fontSize: "14px", fontWeight: 500
          }}>{t.msg}</div>
        ))}
      </div>
    </div>
  );
}