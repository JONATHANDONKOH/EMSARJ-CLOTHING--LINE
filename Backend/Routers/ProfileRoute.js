const express = require("express");
const router = express.Router();

const { getProfile, updateProfile } = require("../Controllers/ProfileController");
const authMiddleware = require("../Middleware/AuthMiddleware");

// GET /profile — any authenticated user
router.get("/", authMiddleware, getProfile);

// PUT /profile — any authenticated user
router.put("/", authMiddleware, updateProfile);

module.exports = router;