const express = require("express");
const router = express.Router();
const BroadcastingController = require("../Controllers/BroadcastingController");
const authMiddleware = require("../Middleware/Authmiddleware"); // same one /messages/admin already uses
const roleMiddleware = require("../Middleware/RoleMiddleware");

// Public
router.post("/subscribe", BroadcastingController.subscribe);

// Admin only
router.get("/subscribers", authMiddleware, roleMiddleware("admin"), BroadcastingController.getAllSubscribers);
router.post("/notify-all", authMiddleware, roleMiddleware("admin"), BroadcastingController.notifyAll);

module.exports = router;