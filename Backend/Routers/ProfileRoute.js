const express = require("express");
const router = express.Router();

const { getProfile, updateProfile } = require("../Controllers/ProfileController");
const authMiddleware = require("../Middleware/AuthMiddleware");
const roleMiddleware = require("../Middleware/  RoleMiddleware");

// GET /profile — must be authenticated and have role "user"
router.get("/", authMiddleware, roleMiddleware("user"), getProfile);

// PUT /profile — must be authenticated and have role "user"
router.put("/", authMiddleware, roleMiddleware("user"), updateProfile);

module.exports = router;
