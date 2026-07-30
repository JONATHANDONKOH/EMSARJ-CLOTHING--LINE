const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const authController = require("../Controllers/AuthController");
const authMiddleware = require("../Middleware/Authmiddleware");

// Configure limiter
const signinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                   // 5 attempts per IP
  message: { error: "Too many login attempts, try again later." },
  standardHeaders: true,
  legacyHeaders: false
});

// Public routes
router.post("/signup", authController.signup);
router.post("/signin", signinLimiter, authController.signin); // limiter applied here
router.post("/signout", authController.signout);

// Protected routes
router.get("/me", authMiddleware, authController.getMe);
router.put("/me", authMiddleware, authController.updateMe);

module.exports = router;
