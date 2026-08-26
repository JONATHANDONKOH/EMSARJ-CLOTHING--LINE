const express = require("express");
const router = express.Router();

const paymentController = require("../Controllers/PaymentController");
const authMiddleware = require("../Middleware/authMiddleware");
const roleMiddleware = require("../Middleware/RoleMiddleware");

// ── Webhook — no authMiddleware (Paystack calls this directly, not a user),
// and needs the RAW body for signature verification, not the parsed JSON
// your other routes use. If index.js does app.use(express.json()) globally,
// this route must be mounted BEFORE that, or excluded from it — otherwise
// req.body here will already be a parsed object, not a Buffer, and the
// signature check will always fail.
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);

// Initialize Paystack transaction
router.post(
  "/initialize",
  authMiddleware,
  paymentController.initializePayment
);

// Verify Paystack payment
router.post(
  "/verify/:id",
  authMiddleware,
  paymentController.verifyPayment
);

// Admin routes
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  paymentController.getPayments
);

router.get(
  "/order/:orderId",
  authMiddleware,
  roleMiddleware("admin"),
  paymentController.getPaymentByOrderId
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  paymentController.getPaymentById
);

router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  paymentController.updatePaymentStatus
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  paymentController.deletePayment
);

module.exports = router;