const express = require("express");
const router = express.Router();
const SubscriberController = require("../Controllers/SubscriberController");
const authMiddleware = require("../Middleware/Authmiddleware"); // same one /messages/admin already uses
const roleMiddleware = require("../Middleware/RoleMiddleware");

// Public
router.post("/subscribe", SubscriberController.subscribe);

// Admin only
router.get("/subscribers", authMiddleware, roleMiddleware("admin"), SubscriberController.getAllSubscribers);
router.post("/notify-all", authMiddleware, roleMiddleware("admin"), SubscriberController.notifyAll);

module.exports = router;