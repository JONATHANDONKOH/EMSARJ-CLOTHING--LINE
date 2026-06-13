// src/pages/Orders.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import supabase from "../supabasefol/supabaseClient";
import { useCurrency } from "../caurrencycontext";

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { format } = useCurrency();

  const [groupedOrders, setGroupedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }

    async function fetchOrders() {
      const { data, error } = await supabase
        .from("order_items")
        .select(`
          product_id,
          products (
            id,
            category_id,
            name,
            image,
            sizes
          ),
          orders (
            id,
            created_at,
            total
          )
        `)
        .eq("orders.user_id", user.id)
        .order("orders.created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch orders:", error.message);
        setError("Could not load your orders.");
        setLoading(false);
        return;
      }

      // Group order_items by order id
      const grouped = {};
      (data || []).forEach((item) => {
        const order = item.orders;
        if (!order) return; // skip rows where join didn't match user's order

        if (!grouped[order.id]) {
          grouped[order.id] = {
            id: order.id,
            created_at: order.created_at,
            total: order.total,
            items: [],
          };
        }

        grouped[order.id].items.push({
          product_id: item.product_id,
          product: item.products,
        });
      });

      const ordersArray = Object.values(grouped).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setGroupedOrders(ordersArray);
      setLoading(false);
    }

    fetchOrders();
  }, [user, navigate]);

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  if (loading) {
    return (
      <div className="orders-page">
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <p className="orders-error">{error}</p>
      </div>
    );
  }

  if (groupedOrders.length === 0) {
    return (
      <div className="orders-page">
        <h1 className="orders-title">My Orders</h1>
        <p className="orders-empty">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1 className="orders-title">My Orders</h1>

      <div className="orders-list">
        {groupedOrders.map((order) => {
          const isOpen = !!expandedOrders[order.id];
          const date = new Date(order.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div className="order-card" key={order.id}>
              <button
                className="order-card-header"
                onClick={() => toggleOrder(order.id)}
                aria-expanded={isOpen}
              >
                <div className="order-card-summary">
                  <span className="order-id">Order #{order.id}</span>
                  <span className="order-date">{date}</span>
                </div>
                <div className="order-card-total">
                  <span>{format(order.total)}</span>
                  <span className={`order-chevron${isOpen ? " order-chevron--open" : ""}`}>
                    ▼
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="order-card-items">
                  {order.items.map((entry, idx) => (
                    <div className="order-item-row" key={`${entry.product_id}-${idx}`}>
                      <img
                        className="order-item-img"
                        src={entry.product?.image}
                        alt={entry.product?.name || "Product"}
                      />
                      <div className="order-item-info">
                        <span className="order-item-name">
                          {entry.product?.name || "Unknown product"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}