import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import supabase from "../supabasefol/supabaseClient";
import TopNav from "../components/common/TopNav";

const STATUS_COLORS = {
  pending:   { bg: "#fef3c7", color: "#92400e" },
  paid:      { bg: "#d1fae5", color: "#065f46" },
  cancelled: { bg: "#fee2e2", color: "#991b1b" },
};

export default function Orders() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [orders, setOrders]                 = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    if (!user) { navigate("/signin"); return; }
    fetchOrders();
  }, [user, navigate]);

  async function fetchOrders() {
    setLoading(true);

    // ── Use getSession not getUser ──
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/signin"); return; }

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
        created_at,
        orderItems (
          id,
          product_name,
          size,
          qty,
          price
        )
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError("Could not load your orders.");
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  }

  function toggleOrder(orderId) {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  }

  if (loading) return (
    <div className="orders-page">
      <TopNav />
      <div className="orders-loading">Loading your orders...</div>
    </div>
  );

  if (error) return (
    <div className="orders-page">
      <TopNav />
      <p className="orders-error">{error}</p>
    </div>
  );

  return (
    <div className="orders-page">
      <TopNav />

      <div className="orders-container">
        <h1 className="orders-title">My Orders</h1>
        <p className="orders-subtitle">
          {orders.length} order{orders.length !== 1 ? "s" : ""} placed
        </p>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <p>You haven't placed any orders yet.</p>
            <button className="orders-shop-btn" onClick={() => navigate("/")}>
              Start shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const isOpen = !!expandedOrders[order.id];
              const date   = new Date(order.created_at).toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric",
              });
              const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.pending;

              return (
                <div className="order-card" key={order.id}>

                  {/* ── Order Header ── */}
                  <button
                    className="order-card-header"
                    onClick={() => toggleOrder(order.id)}
                    aria-expanded={isOpen}
                  >
                    <div className="order-card-left">
                      <span className="order-id">#{order.id.slice(0, 8)}</span>
                      <span className="order-date">{date}</span>
                      <span
                        className="order-status-badge"
                        style={{ background: statusStyle.bg, color: statusStyle.color }}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="order-card-right">
                      <span className="order-total">Ghc {Number(order.total).toFixed(2)}</span>
                      <span className={`order-chevron${isOpen ? " order-chevron--open" : ""}`}>▼</span>
                    </div>
                  </button>

                  {/* ── Expanded Receipt ── */}
                  {isOpen && (
                    <div className="order-receipt">

                      {/* Customer info */}
                      <div className="order-receipt-customer">
                        <p className="order-receipt-label">Customer</p>
                        <p className="order-receipt-value">{order.first_name} {order.last_name}</p>
                        <p className="order-receipt-value">{order.email}</p>
                        <p className="order-receipt-value">{order.phone_number}</p>
                      </div>

                      {/* Items */}
                      <div className="order-receipt-items">
                        <p className="order-receipt-label">Items</p>
                        {(order.orderItems || []).map((item) => (
                          <div className="order-receipt-item-row" key={item.id}>
                            <div className="order-receipt-item-info">
                              <span className="order-receipt-item-name">{item.product_name}</span>
                              <span className="order-receipt-item-meta">
                                {item.size && <>Size: <strong>{item.size}</strong> · </>}
                                Qty: <strong>{item.qty}</strong>
                              </span>
                            </div>
                            <span className="order-receipt-item-price">
                              Ghc {Number(item.price).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Totals */}
                      <div className="order-receipt-totals">
                        <div className="order-receipt-total-row">
                          <span>Subtotal</span>
                          <span>Ghc {Number(order.subtotal).toFixed(2)}</span>
                        </div>
                        <div className="order-receipt-total-row">
                          <span>Delivery</span>
                          <span>Ghc {Number(order.delivery_fee).toFixed(2)}</span>
                        </div>
                        <div className="order-receipt-total-row order-receipt-grand-total">
                          <span>Total</span>
                          <span>Ghc {Number(order.total).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Payment reference */}
                      {order.payment_reference && (
                        <p className="order-receipt-ref">
                          Ref: <code>{order.payment_reference}</code>
                        </p>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}