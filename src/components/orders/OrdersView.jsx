import { useState, useEffect } from "react";
import supabase from "../../supabasefol/supabaseClient";
import { IconShoppingBag } from "../common/Icons";

const STATUS = ["pending", "paid", "cancelled"];

const STATUS_COLORS = {
  pending:    "#f59e0b",
  paid:       "#10b981",
  cancelled:  "#ef4444",
};

export default function OrdersView({ user }) {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(false);
  const [filter, setFilter]           = useState("all");
  const [toasts, setToasts]           = useState([]);
  const [expanded, setExpanded]       = useState(null);
  const [itemsMap, setItemsMap]       = useState({});
  const [itemsLoading, setItemsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateStatus, setUpdateStatus]   = useState("pending");
  const [errorDetails, setErrorDetails]   = useState(null); // For detailed error display

  function toast(type, msg) {
    const id = Date.now();
    setToasts(p => [...p, { id, type, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }

  async function fetchOrders() {
    setLoading(true);
    setErrorDetails(null);
    
    try {
      console.log("=== STARTING FETCH ORDERS ===");
      console.log("Supabase client:", supabase);
      
      // First, check if we're authenticated
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      console.log("Auth session:", session);
      console.log("Auth error:", authError);
      
      if (authError) {
        console.error("Authentication error:", authError);
        setErrorDetails({ type: "auth", error: authError });
        toast("err", `Auth Error: ${authError.message}`);
      }
      
      console.log("Attempting to fetch from 'orders' table...");
      
      const { data, error, status, statusText } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("Response status:", status);
      console.log("Response statusText:", statusText);
      console.log("Response data:", data);
      console.log("Response error:", error);
      
      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        setErrorDetails({
          type: "supabase",
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        toast("err", `Database Error: ${error.message}`);
        setOrders([]);
      } else if (data) {
        console.log(`Successfully fetched ${data.length} orders`);
        console.log("First order sample:", data[0]);
        setOrders(data);
        
        if (data.length === 0) {
          toast("err", "No orders found in the database");
        } else {
          toast("ok", `Loaded ${data.length} orders successfully`);
        }
      }
      
    } catch (err) {
      console.error("!!! CATCH BLOCK ERROR !!!");
      console.error("Unexpected error:", err);
      console.error("Error stack:", err.stack);
      
      setErrorDetails({
        type: "exception",
        message: err.message,
        stack: err.stack
      });
      
      toast("err", `Unexpected Error: ${err.message}`);
      setOrders([]);
    } finally {
      setLoading(false);
      console.log("=== FETCH ORDERS COMPLETED ===");
    }
  }

  // Test function to check table existence
  async function testTableConnection() {
    console.log("=== TESTING TABLE CONNECTION ===");
    setLoading(true);
    
    try {
      // Try to get just the count
      const { count, error: countError } = await supabase
        .from("orders")
        .select("*", { count: 'exact', head: true });
      
      console.log("Table count test:", { count, error: countError });
      
      if (countError) {
        console.error("Count error:", countError);
        toast("err", `Count test failed: ${countError.message}`);
      } else {
        toast("ok", `Table exists with ${count} orders`);
      }
      
      // Try a simple select with limit 1
      const { data, error } = await supabase
        .from("orders")
        .select("id")
        .limit(1);
      
      console.log("Sample query test:", { data, error });
      
    } catch (err) {
      console.error("Test connection error:", err);
      toast("err", `Test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function toggleExpand(orderId) {
    if (expanded === orderId) { setExpanded(null); return; }
    setExpanded(orderId);
    if (itemsMap[orderId]) return;

    setItemsLoading(true);
    try {
      const { data, error } = await supabase
        .from("orderItems")
        .select(`
          id, quantity, size, price,
          products ( id, name, image_url )
        `)
        .eq("order_id", orderId);

      if (error) {
        console.error("Error fetching order items:", error);
        toast("err", error.message);
      } else {
        setItemsMap(prev => ({ ...prev, [orderId]: data || [] }));
      }
    } catch (err) {
      console.error("Unexpected error fetching items:", err);
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
        console.error("Update error:", error);
        toast("err", error.message);
      } else {
        toast("ok", "Status updated successfully");
        fetchOrders();
      }
    } catch (err) {
      console.error("Update exception:", err);
      toast("err", `Update failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedOrder) return toast("err", "Select an order");
    
    if (!window.confirm(`Are you sure you want to delete order #${selectedOrder.id.slice(0, 8)}?`)) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", selectedOrder.id);

      if (error) {
        console.error("Delete error:", error);
        toast("err", error.message);
      } else {
        toast("ok", "Order deleted successfully");
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err) {
      console.error("Delete exception:", err);
      toast("err", `Delete failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const filtered = orders.filter(o => filter === "all" || o.status === filter);

  return (
    <div>
      {/* Debug Toolbar */}
      <div style={{ marginBottom: "1rem", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={fetchOrders}
          style={{
            padding: "6px 12px",
            background: "#3b82f6",
            border: "none",
            borderRadius: "6px",
            color: "#fff",
            cursor: "pointer",
            fontSize: "12px"
          }}
        >
          🔄 Refresh Orders
        </button>
        <button
          onClick={testTableConnection}
          style={{
            padding: "6px 12px",
            background: "#10b981",
            border: "none",
            borderRadius: "6px",
            color: "#fff",
            cursor: "pointer",
            fontSize: "12px"
          }}
        >
          🧪 Test Connection
        </button>
      </div>

      {/* Error Display */}
      {errorDetails && (
        <div style={{ 
          marginBottom: "1rem", 
          padding: "1rem", 
          background: "#450a0a",
          border: "1px solid #ef4444",
          borderRadius: "8px",
          color: "#fecaca"
        }}>
          <p style={{ margin: "0 0 8px", fontWeight: "bold", color: "#ef4444" }}>
            ⚠️ Error Details:
          </p>
          <pre style={{ 
            margin: 0, 
            fontSize: "12px", 
            whiteSpace: "pre-wrap",
            fontFamily: "monospace"
          }}>
            {JSON.stringify(errorDetails, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 700, color: "#f1f5f9" }}>Orders</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
          {orders.length} total orders {loading && "(loading...)"}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px", marginBottom: "1.5rem" }}>
        {[
          { label: "Total",     value: orders.length,                                     color: "#3b82f6" },
          { label: "Pending",   value: orders.filter(o => o.status === "pending").length,   color: "#f59e0b" },
          { label: "Paid",      value: orders.filter(o => o.status === "paid").length,      color: "#10b981" },
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

      {selectedOrder && (
        <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#1e293b", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 600, color: "#e2e8f0" }}>
            Managing: <span style={{ color: "#60a5fa" }}>#{selectedOrder.id?.slice(0, 8)}</span>
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <select value={updateStatus} onChange={e => setUpdateStatus(e.target.value)} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px", padding: "10px 14px", color: "#f1f5f9", fontSize: "14px", outline: "none"
            }}>
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

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#475569" }}>Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#334155" }}>
          <IconShoppingBag size={40} />
          <p style={{ marginTop: "12px", color: "#475569" }}>
            {orders.length === 0 ? "No orders found in database" : `No ${filter} orders found`}
          </p>
          {orders.length === 0 && (
            <button
              onClick={testTableConnection}
              style={{
                marginTop: "12px",
                padding: "8px 16px",
                background: "#3b82f6",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
                cursor: "pointer"
              }}
            >
              Test Database Connection
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map(order => {
            const isOpen  = expanded === order.id;
            const items   = itemsMap[order.id] || [];

            return (
              <div key={order.id} style={{
                background: "#1e293b",
                border: `1px solid ${isOpen ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: "12px", overflow: "hidden", transition: "border-color 0.2s"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", flexWrap: "wrap" }}>
                  <span
                    onClick={() => toggleExpand(order.id)}
                    style={{
                      cursor: "pointer", color: "#475569", fontSize: "12px", flexShrink: 0,
                      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s"
                    }}
                  >▶</span>

                  <span style={{ fontSize: "12px", color: "#475569", fontFamily: "monospace", flexShrink: 0 }}>
                    #{order.id?.slice(0, 8)}
                  </span>

                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#3b82f6", minWidth: "80px" }}>
                    ₵{Number(order.total || 0).toFixed(2)}
                  </span>

                  <span style={{
                    padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
                    background: `${STATUS_COLORS[order.status]}22`,
                    color: STATUS_COLORS[order.status], textTransform: "capitalize", flexShrink: 0
                  }}>{order.status}</span>

                  <span style={{ fontSize: "12px", color: "#475569", marginLeft: "auto" }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>

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

                {isOpen && (
                  <div style={{
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    padding: "14px 16px", background: "rgba(0,0,0,0.2)"
                  }}>
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
                            {item.products?.image_url ? (
                              <img src={item.products.image_url} alt={item.products?.name}
                                style={{ width: "44px", height: "44px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }} />
                            ) : (
                              <div style={{
                                width: "44px", height: "44px", borderRadius: "6px",
                                background: "#1e293b", flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px"
                              }}>📦</div>
                            )}
                            <span style={{ flex: 1, fontSize: "13px", fontWeight: 600, color: "#e2e8f0" }}>
                              {item.products?.name || "Unknown product"}
                            </span>
                            {item.size && (
                              <span style={{
                                fontSize: "11px", fontWeight: 600, color: "#60a5fa",
                                background: "rgba(59,130,246,0.12)", padding: "2px 8px", borderRadius: "4px"
                              }}>{item.size}</span>
                            )}
                            <span style={{ fontSize: "13px", color: "#64748b" }}>×{item.quantity}</span>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9", minWidth: "70px", textAlign: "right" }}>
                              ₵{Number(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
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
      )}

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