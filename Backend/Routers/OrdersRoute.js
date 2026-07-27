const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/OrdersController");
const authMiddleware = require("../Middleware/AuthMiddleware");
const roleMiddleware = require("../Middleware/RoleMiddleware");

// All order routes require a signed-in user.
router.post("/", authMiddleware, orderController.createOrder);
router.get("/user/:userId", authMiddleware, orderController.getOrdersByUser);

// Admin only — declared before /:id so "GET /orders" (no id) isn't ambiguous
// with a param route; kept as its own line since path shapes differ anyway.
router.get("/", authMiddleware, roleMiddleware("admin"), orderController.getAllOrders);

router.get("/:id", authMiddleware, orderController.getOrderById);
router.patch("/:id/status", authMiddleware, roleMiddleware("admin"), orderController.updateOrderStatus);

module.exports = router;