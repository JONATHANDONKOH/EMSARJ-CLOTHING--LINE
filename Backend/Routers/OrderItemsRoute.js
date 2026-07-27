const express = require("express");
const router = express.Router();
const orderItemsController = require("../Controllers/OrderItemsController");
const authMiddleware = require("../Middleware/Authmiddleware");

router.post("/", authMiddleware, orderItemsController.createOrderItems);
router.get("/order/:orderId", authMiddleware, orderItemsController.getItemsByOrderId);

module.exports = router;