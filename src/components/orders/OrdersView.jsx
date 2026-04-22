import { useState, useEffect } from "react";
import supabase from "../../supabasefol/supabaseClient";
import { IconShoppingBag, IconCheck } from "../common/Icons";
import { Modal } from "../common/Modal";

const STATUS = ["pending", "processing", "completed", "cancelled"];

const STATUS_COLORS = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  completed: "#10b981",
  cancelled: "#ef4444",
};

export default function OrdersView({ user }) {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [toasts, setToasts] = useState([]);
  const [updateStatus, setUpdateStatus] = useState("processing");

  const [newOrder, setNewOrder] = useState({
    total: ""
  });

  // For demo purposes, all users can access orders
  const isAdmin = false;

  function toast(type, msg) {
    const id = Date.now();
    setToasts(p => [...p, { id, type, msg }]);
    setTimeout(() => {
      setToasts(p => p.filter(t => t.id !== id));
    }, 3000);
  }

  async function fetchOrders() {
    setLoading(true);

    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

    if (!isAdmin) {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
      toast("err", error.message);
    } else {
      setOrders(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function handleInsert() {
    if (!newOrder.total) return toast("err", "Enter total amount");

    setLoading(true);

    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      total_amount: Number(newOrder.total),
      status: "pending"
    });

    if (error) {
      toast("err", error.message);
    } else {
      toast("ok", "Order created");
      setNewOrder({ total: "" });
      fetchOrders();
    }

    setLoading(false);
  }

  async function handleUpdate() {
    if (!selectedOrder) return toast("err", "Select an order");

    setLoading(true);

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

    setLoading(false);
  }

  async function handleDelete() {
    if (!selectedOrder) return toast("err", "Select an order");

    setLoading(true);

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

    setLoading(false);
  }

  const filtered = orders.filter(o => filter === "all" || o.status === filter);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 700, color: "#f1f5f9" }}>Orders</h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
            {orders.length} total orders
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px", marginBottom: "1.5rem" }}>
        {[
          { label: "Total Orders", value: orders.length, color: "#3b82f6" },
          { label: "Pending", value: orders.filter(o => o.status === "pending").length, color: "#f59e0b" },
          { label: "Completed", value: orders.filter(o => o.status === "completed").length, color: "#10b981" },
          { label: "Cancelled", value: orders.filter(o => o.status === "cancelled").length, color: "#ef4444" },
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

      {/* Create Order (Customer) */}
      {!isAdmin && (
        <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#1e293b", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 600, color: "#e2e8f0" }}>Create New Order</p>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="number"
              placeholder="Order Total ($)"
              value={newOrder.total}
              onChange={e => setNewOrder({ total: e.target.value })}
              style={{
                flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px", padding: "10px 14px", color: "#f1f5f9", fontSize: "14px", outline: "none"
              }}
            />
            <button onClick={handleInsert} disabled={loading} style={{
              padding: "10px 20px", borderRadius: "8px", border: "none", background: "#3b82f6",
              color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer"
            }}>
              Create Order
            </button>
          </div>
        </div>
      )}

      {/* Admin Actions */}
      {isAdmin && selectedOrder && (
        <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#1e293b", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 600, color: "#e2e8f0" }}>Manage Selected Order</p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <select value={updateStatus} onChange={e => setUpdateStatus(e.target.value)} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px", padding: "10px 14px", color: "#f1f5f9", fontSize: "14px", outline: "none"
            }}>
              {STATUS.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={handleUpdate} disabled={loading} style={{
              padding: "10px 20px", borderRadius: "8px", border: "none", background: "#3b82f6",
              color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer"
            }}>
              Update Status
            </button>
            <button onClick={handleDelete} disabled={loading} style={{
              padding: "10px 20px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.3)",
              background: "transparent", color: "#ef4444", fontSize: "14px", fontWeight: 600, cursor: "pointer"
            }}>
              Delete Order
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "8px" }}>
        {["all", ...STATUS].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer",
            background: filter === f ? "#3b82f6" : "rgba(255,255,255,0.05)",
            color: filter === f ? "#fff" : "#64748b", fontSize: "12px", fontWeight: 500,
            textTransform: "capitalize"
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#475569" }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#334155" }}>
          <IconShoppingBag size={40} />
          <p style={{ marginTop: "12px", color: "#475569" }}>No orders found</p>
        </div>
      ) : (
        <div style={{ background: "#1e293b", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#475569", textTransform: "uppercase" }}>Order ID</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#475569", textTransform: "uppercase" }}>Amount</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#475569", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#475569", textTransform: "uppercase" }}>Date</th>
                <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#475569", textTransform: "uppercase" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} style={{ 
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background: selectedOrder?.id === order.id ? "rgba(59,130,246,0.1)" : "transparent"
                }}>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#e2e8f0" }}>#{order.id}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 600, color: "#3b82f6" }}>${order.total_amount}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 500,
                      background: `${STATUS_COLORS[order.status]}22`, color: STATUS_COLORS[order.status],
                      textTransform: "capitalize"
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#64748b" }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button onClick={() => setSelectedOrder(order)} style={{
                      padding: "6px 10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)",
                      background: selectedOrder?.id === order.id ? "#3b82f6" : "transparent",
                      color: selectedOrder?.id === order.id ? "#fff" : "#64748b", fontSize: "12px", cursor: "pointer"
                    }}>
                      {selectedOrder?.id === order.id ? "Selected" : "Select"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast Notifications */}
      <div style={{ position: "fixed", bottom: 20, right: 20, display: "flex", flexDirection: "column", gap: "8px" }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: "12px 16px", borderRadius: "8px",
            background: t.type === "ok" ? "#10b981" : "#ef4444",
            color: "#fff", fontSize: "14px", fontWeight: 500
          }}>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}