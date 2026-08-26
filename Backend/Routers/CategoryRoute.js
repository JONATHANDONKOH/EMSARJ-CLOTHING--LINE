const express = require("express");
const router = express.Router();
const categoryController = require("../Controllers/CategoryController");
const authMiddleware = require("../Middleware/authMiddleware");
const roleMiddleware = require("../Middleware/RoleMiddleware");

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

// Admin-only routes
router.post("/", authMiddleware, roleMiddleware("admin"), categoryController.createCategory);
router.put("/:id", authMiddleware, roleMiddleware("admin"), categoryController.updateCategory);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), categoryController.deleteCategory);

module.exports = router;