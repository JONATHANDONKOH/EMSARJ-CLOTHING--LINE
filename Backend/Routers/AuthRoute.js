const express = require("express");
const router = express.Router();
const authController = require("../Controllers/AuthController");
const authMiddleware = require("../Middleware/AuthMiddleware");

// Public routes — names matched to what AuthController.js actually exports
router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post("/signout", authController.signout);

// Rehydrate session on app load — protected, needs a valid token
router.get("/me", authMiddleware, authController.getMe);
router.put("/me", authMiddleware, authController.updateMe);

module.exports = router;