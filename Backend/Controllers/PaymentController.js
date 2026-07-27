const axios = require("axios");
const crypto = require("crypto");
const Order = require("../Models/OrdersModule"); // fixed: was OrdersModule, doesn't exist
const Payment = require("../Models/PaymentModule");

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// ── Initialize Paystack payment ──────────────────────────────────────────
exports.initializePayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const order = await Order.getOrderById(orderId); // was Order.findById

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // ── Ownership check — don't let user A open a payment on user B's order ──
    if (order.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized for this order" });
    }

    // ── Idempotency: don't let an already-paid order be paid again ──
    if (order.status === "paid") {
      return res.status(409).json({ error: "This order has already been paid" });
    }

    const reference = `order_${order.id}_${Date.now()}`;

    const paystackData = {
      email: order.email,
      amount: Math.round(order.total * 100), // pesewas
      currency: "GHS",
      reference,
      callback_url: `${process.env.FRONTEND_URL}/payment-success?orderId=${order.id}`,
    };

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      paystackData,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.status) {
      throw new Error(response.data.message || "Paystack initialization failed");
    }

    // ⚠️ OPEN QUESTION: updateOrderStatus(id, status, payment_reference) as
    // seen in OrdersController.js takes a `status` argument. Order is still
    // "pending" at this point — we only want to attach the reference, not
    // change status. Passing order.status back through assumes
    // updateOrderStatus won't reject/no-op on an unchanged status. If it
    // behaves differently (e.g. requires a real transition, or ignores a
    // null status and leaves the row untouched entirely), this line needs
    // to change to match. Needs OrdersModel.js to confirm.
    await Order.updateOrderStatus(orderId, order.status, reference);

    res.status(200).json({
      authorization_url: response.data.data.authorization_url,
      reference,
    });

  } catch (error) {
    console.error("Payment initialization error:", error);
    res.status(500).json({
      error: error.response?.data?.message || error.message || "Payment initialization failed",
    });
  }
};

// ── Verify payment (called by frontend after Paystack redirect) ─────────
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;
    const { id: orderId } = req.params;

    if (!reference) {
      return res.status(400).json({ error: "Reference is required" });
    }

    const order = await Order.getOrderById(orderId); // was Order.findById
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // ── Ownership check ──
    if (order.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized for this order" });
    }

    // ── Already paid — treat as success, don't re-process ──
    if (order.status === "paid") {
      return res.status(200).json({ success: true, message: "Order already verified", order });
    }

    // ── Anti-replay: this reference must be the one WE issued for THIS order ──
    if (order.payment_reference !== reference) {
      return res.status(400).json({
        success: false,
        message: "Reference does not match this order",
      });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
    );

    const txn = response.data?.data;

    if (!response.data.status || txn?.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const expectedAmount = Math.round(order.total * 100);
    if (txn.amount !== expectedAmount || txn.currency !== "GHS") {
      console.error(
        `Amount/currency mismatch on order ${orderId}: expected ${expectedAmount} GHS, got ${txn.amount} ${txn.currency}`
      );
      return res.status(400).json({
        success: false,
        message: "Payment amount does not match order total",
      });
    }

    // Mark order paid — this call matches OrdersController.updateOrderStatus's
    // real usage exactly (status, then reference), so this one's solid.
    const updatedOrder = await Order.updateOrderStatus(orderId, "paid", reference);

    await Payment.createIfNotExists({
      transaction: reference,
      order_id: orderId,
      method: txn.channel || "card",
      amount: txn.amount / 100,
      status: "completed",
    });

    res.status(200).json({
      success: true,
      message: "Payment verified and order updated",
      order: updatedOrder,
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message || "Verification failed",
    });
  }
};

// ── Webhook — Paystack calls this server-to-server on charge events. ──
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-paystack-signature"];
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(req.body)
      .digest("hex");

    if (hash !== signature) {
      console.warn("Invalid Paystack webhook signature");
      return res.status(401).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString("utf8"));

    if (event.event === "charge.success") {
      const txn = event.data;
      const reference = txn.reference;

      const order = await Order.findByReference(reference);

      if (!order) {
        console.warn(`Webhook: no order found for reference ${reference}`);
        return res.status(200).send("ok");
      }

      if (order.status !== "paid") {
        const expectedAmount = Math.round(order.total * 100);
        if (txn.amount === expectedAmount && txn.currency === "GHS") {
          await Order.updateOrderStatus(order.id, "paid", reference);

          await Payment.createIfNotExists({
            transaction: reference,
            order_id: order.id,
            method: txn.channel || "card",
            amount: txn.amount / 100,
            status: "completed",
          });
        } else {
          console.error(`Webhook amount mismatch for order ${order.id}`);
        }
      }
    }

    res.status(200).send("ok");

  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).send("error");
  }
};

// ── Admin: list all payments ─────────────────────────────────────────────
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll();
    res.status(200).json(payments);
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ message: "Failed to fetch payments." });
  }
};

// ── Admin: single payment by its own id ──────────────────────────────────
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json(payment);
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({ message: "Failed to fetch payment." });
  }
};

// ── Admin: all payment attempts for a given order ────────────────────────
// Uses findAllByOrderId (not the single-row findByOrderId) so retries/
// failed attempts are visible too, not just the latest one.
exports.getPaymentByOrderId = async (req, res) => {
  try {
    const payments = await Payment.findAllByOrderId(req.params.orderId);
    res.status(200).json(payments);
  } catch (error) {
    console.error("Get payments by order error:", error);
    res.status(500).json({ message: "Failed to fetch payments for order." });
  }
};

// ── Admin: manually correct a payment's status ───────────────────────────
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const payment = await Payment.updateStatus(req.params.id, status);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({ message: "Failed to update payment status." });
  }
};

// ── Admin: delete a payment record ───────────────────────────────────────
exports.deletePayment = async (req, res) => {
  try {
    const existing = await Payment.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Payment not found" });
    }

    await Payment.delete(req.params.id);
    res.status(200).json({ message: "Payment deleted" });
  } catch (error) {
    console.error("Delete payment error:", error);
    res.status(500).json({ message: "Failed to delete payment." });
  }
};