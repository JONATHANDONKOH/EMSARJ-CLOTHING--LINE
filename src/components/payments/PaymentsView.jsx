import { useState, useEffect } from "react";
import supabase from "../../supabasefol/supabaseClient"; // your initialized Supabase client
import { IconCreditCard } from "../common/Icons";
import { Modal } from "../common/Modal";

// Mapping for status colors and method icons
const statusColors = {
  completed: "#10b981",
  pending: "#f59e0b",
  failed: "#ef4444",
  refunded: "#8b5cf6",
};

const methodIcons = {
  "Credit Card": "💳",
  PayPal: "🅿️",
  "Bank Transfer": "🏦",
};

export function PaymentsView({ userRole }) {
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Fetch payments from Supabase
  const fetchPayments = async () => {
    setLoading(true);
    try {
      let { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (err) {
      console.error("Error fetching payments:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Delete a payment (admins only)
  const handleDelete = async (paymentId) => {
    if (userRole !== "admin") return alert("Only admins can delete payments!");
    const confirmDelete = confirm("Are you sure you want to delete this payment?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from("payments").delete().eq("id", paymentId);
      if (error) throw error;
      setPayments(payments.filter(p => p.id !== paymentId));
    } catch (err) {
      console.error("Error deleting payment:", err.message);
    }
  };

  // Filter payments
  const filteredPayments = payments.filter(payment =>
    filter === "all" ? true : payment.status === filter
  );

  const totalRevenue = payments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalPending = payments
    .filter(p => p.status === "pending")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const stats = [
    { label: "Total Transactions", value: payments.length, color: "#3b82f6" },
    { label: "Completed", value: payments.filter(p => p.status === "completed").length, color: "#10b981" },
    { label: "Revenue", value: `$${totalRevenue.toFixed(2)}`, color: "#8b5cf6" },
    { label: "Pending", value: `$${totalPending.toFixed(2)}`, color: "#f59e0b" },
  ];

  if (loading) return <p style={{ color: "#f1f5f9" }}>Loading payments...</p>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 700, color: "#f1f5f9" }}>Payments</h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>{payments.length} total transactions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px", marginBottom: "1.5rem" }}>
        {stats.map(stat => (
          <div key={stat.label} style={{
            background: "#1e293b", borderRadius: "12px", padding: "1rem",
            border: "1px solid rgba(255,255,255,0.06)"
          }}>
            <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#475569", fontWeight: 500 }}>{stat.label}</p>
            <p style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "8px" }}>
        {["all", "completed", "pending", "failed", "refunded"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer",
            background: filter === f ? "#3b82f6" : "rgba(255,255,255,0.05)",
            color: filter === f ? "#fff" : "#64748b", fontSize: "12px", fontWeight: 500,
            textTransform: "capitalize"
          }}>{f}</button>
        ))}
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#334155" }}>
          <IconCreditCard size={40} />
          <p style={{ marginTop: "12px", color: "#475569" }}>No payments found</p>
        </div>
      ) : (
        <div style={{ background: "#1e293b", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#475569", textTransform: "uppercase" }}>Transaction</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#475569", textTransform: "uppercase" }}>Order ID</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#475569", textTransform: "uppercase" }}>Method</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#475569", textTransform: "uppercase" }}>Date</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#475569", textTransform: "uppercase" }}>Amount</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#475569", textTransform: "uppercase" }}>Status</th>
                {userRole === "admin" && <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: "#475569", textTransform: "uppercase" }}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#e2e8f0" }}>{payment.transaction}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#64748b" }}>#{payment.orderId}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "16px" }}>{methodIcons[payment.method]}</span>
                      <span style={{ fontSize: "13px", color: "#e2e8f0" }}>{payment.method}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#64748b" }}>{payment.date}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 600, color: "#3b82f6" }}>${Number(payment.amount).toFixed(2)}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 500,
                      background: `${statusColors[payment.status]}22`, color: statusColors[payment.status],
                      textTransform: "capitalize"
                    }}>{payment.status}</span>
                  </td>
                  {userRole === "admin" && (
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button onClick={() => setSelectedPayment(payment)} style={{
                        padding: "6px 10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)",
                        background: "transparent", color: "#64748b", fontSize: "12px", cursor: "pointer"
                      }}>View</button>
                      <button onClick={() => handleDelete(payment.id)} style={{
                        padding: "6px 10px", borderRadius: "6px", border: "1px solid rgba(255,0,0,0.2)",
                        background: "#ef4444", color: "#fff", fontSize: "12px", cursor: "pointer", marginLeft: "6px"
                      }}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <Modal title="Payment Details" onClose={() => setSelectedPayment(null)}>
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#475569" }}>Transaction ID</p>
            <p style={{ margin: 0, fontSize: "14px", color: "#f1f5f9" }}>{selectedPayment.transaction}</p>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#475569" }}>Order ID</p>
            <p style={{ margin: 0, fontSize: "14px", color: "#f1f5f9" }}>#{selectedPayment.orderId}</p>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#475569" }}>Payment Method</p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px" }}>{methodIcons[selectedPayment.method]}</span>
              <p style={{ margin: 0, fontSize: "14px", color: "#f1f5f9" }}>{selectedPayment.method}</p>
            </div>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#475569" }}>Amount</p>
            <p style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#3b82f6" }}>${Number(selectedPayment.amount).toFixed(2)}</p>
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#475569" }}>Status</p>
            <span style={{
              padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 500,
              background: `${statusColors[selectedPayment.status]}22`, color: statusColors[selectedPayment.status],
              textTransform: "capitalize"
            }}>{selectedPayment.status}</span>
          </div>
          <button onClick={() => setSelectedPayment(null)} style={{
            width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)",
            background: "transparent", color: "#64748b", fontSize: "14px", fontWeight: 500, cursor: "pointer"
          }}>Close</button>
        </Modal>
      )}
    </div>
  );
}