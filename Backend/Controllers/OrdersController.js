const pool = require("../Config/db");
const Order = require("../Models/OrdersModule");
const OrderItem = require("../Models/OrderItemsModule");

// POST /orders
// Creates the order AND its order items in a single transaction — cart
// checkout should never leave an order row with no items (or vice versa).
exports.createOrder = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone_number,
    subtotal,
    items, // [{ product_id, product_name, size, qty, price }, ...]
  } = req.body;

  if (!first_name || !last_name || !email || !phone_number || subtotal == null) {
    return res.status(400).json({ message: "Missing required order fields" });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Order must include at least one item" });
  }
  for (const item of items) {
    if (!item.product_id || !item.product_name || !item.qty || item.price == null) {
      return res.status(400).json({ message: "Each order item needs product_id, product_name, qty, and price" });
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const order = await Order.createOrder(
      {
        user_id: req.user.id, // set by authMiddleware
        first_name,
        last_name,
        email,
        phone_number,
        subtotal,
      },
      client
    );

    const orderItems = await OrderItem.createOrderItems(order.id, items, client);

    await client.query("COMMIT");
    res.status(201).json({ ...order, items: orderItems });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Create order error:", err);
    res.status(500).json({ message: `Order creation failed: ${err.message}` });
  } finally {
    client.release();
  }
};

// GET /orders/:id  (owner or admin)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    const items = await OrderItem.getItemsByOrderId(order.id);
    res.status(200).json({ ...order, items });
  } catch (err) {
    console.error("Get order error:", err);
    res.status(500).json({ message: "Failed to fetch order." });
  }
};

// GET /orders/user/:userId  (self or admin)
exports.getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view these orders" });
    }

    const orders = await Order.getOrdersByUser(userId);
    res.status(200).json(orders);
  } catch (err) {
    console.error("Get orders by user error:", err);
    res.status(500).json({ message: "Failed to fetch orders." });
  }
};

// GET /orders/user/:userId/receipt  (self or admin) - NEW ROUTE
// Returns orders with their items included for receipt display
exports.getOrdersWithItemsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view these orders" });
    }

    const orders = await Order.getOrdersByUser(userId);
    
    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.getItemsByOrderId(order.id);
        return { ...order, items };
      })
    );
    
    res.status(200).json(ordersWithItems);
  } catch (err) {
    console.error("Get orders with items error:", err);
    res.status(500).json({ message: "Failed to fetch orders with items." });
  }
};

// GET /orders  (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    const orders = await Order.getAllOrders();
    res.status(200).json(orders);
  } catch (err) {
    console.error("Get all orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders." });
  }
};

// POST /orders/:id/verify  (owner or admin — called right after the
// Paystack popup succeeds, replaces the old Supabase Edge Function)
// Verifies the transaction server-side with your Paystack SECRET key
// (never exposed to the browser) before marking the order paid.
exports.verifyPayment = async (req, res) => {
  try {
    const order = await Order.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to verify this order" });
    }

    const { reference } = req.body;
    if (!reference) {
      return res.status(400).json({ message: "Payment reference is required" });
    }

    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );
    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status || paystackData.data?.status !== "success") {
      return res.status(400).json({ success: false, message: "Payment verification failed." });
    }

    // Guard against a tampered/mismatched amount — Paystack returns pesewas (GHS x 100)
    const paidGhc = paystackData.data.amount / 100;
    if (Math.abs(paidGhc - Number(order.total)) > 0.01) {
      return res.status(400).json({ success: false, message: "Paid amount does not match order total." });
    }

    const updated = await Order.updateOrderStatus(order.id, "paid", reference);
    res.status(200).json({ success: true, order: updated });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ success: false, message: "Payment verification failed." });
  }
};

// PATCH /orders/:id/status  (admin only, or your Paystack verify step)
exports.updateOrderStatus = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { status, payment_reference } = req.body;
    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }

    const order = await Order.updateOrderStatus(req.params.id, status, payment_reference);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Failed to update order status." });
  }
};