const Order = require("../Models/OrdersModule");
const OrderItem = require("../Models/OrderItemsModule");

// POST /order-items
// Standalone insert — use this only if items are ever added to an order
// after the fact. Normal checkout should go through POST /orders, which
// creates the order and its items together in one transaction.
exports.createOrderItems = async (req, res) => {
  try {
    const { order_id, items } = req.body;

    if (!order_id) {
      return res.status(400).json({ message: "order_id is required" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "At least one item is required" });
    }
    for (const item of items) {
      if (!item.product_id || !item.product_name || !item.qty || item.price == null) {
        return res.status(400).json({ message: "Each item needs product_id, product_name, qty, and price" });
      }
    }

    const order = await Order.getOrderById(order_id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to modify this order" });
    }

    const orderItems = await OrderItem.createOrderItems(order_id, items);
    res.status(201).json(orderItems);
  } catch (err) {
    console.error("Create order items error:", err);
    res.status(500).json({ message: `Failed to create order items: ${err.message}` });
  }
};

// GET /order-items/order/:orderId
exports.getItemsByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view these items" });
    }

    const items = await OrderItem.getItemsByOrderId(orderId);
    res.status(200).json(items);
  } catch (err) {
    console.error("Get order items error:", err);
    res.status(500).json({ message: "Failed to fetch order items." });
  }
};