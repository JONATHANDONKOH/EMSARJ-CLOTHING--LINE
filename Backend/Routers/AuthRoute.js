const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const authController = require("../Controllers/AuthController");
const authMiddleware = require("../Middleware/authMiddleware");

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

// Protected routes
router.get("/me", authMiddleware, authController.getMe);
router.put("/me", authMiddleware, authController.updateMe);

// Signout runs behind authMiddleware — the controller needs req.user.id to
// know which Redis session key (`session:${id}`) to delete.
router.post("/signout", authMiddleware, authController.signout);

module.exports = router;