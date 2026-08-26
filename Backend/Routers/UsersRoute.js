const express = require("express");
const router = express.Router();
const usersController = require("../Controllers/UsersController");
const authMiddleware = require("../Middleware/AuthMiddleware");
const roleMiddleware = require("../Middleware/RoleMiddleware");

// Admin only — mount this router at /api/users in index.js
router.get("/", authMiddleware, roleMiddleware("admin"), usersController.getAllUsers);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), usersController.deleteUser);

module.exports = router;