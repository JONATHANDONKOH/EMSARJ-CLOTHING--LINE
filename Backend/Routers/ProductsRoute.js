const express = require("express");
const router = express.Router();
const productController = require("../Controllers/ProductsController");
const authMiddleware = require("../Middleware/AuthMiddleware");
const roleMiddleware = require("../Middleware/RoleMiddleware");

// Public routes
// NOTE: /search, /category/:categoryId, /hero, /featured, and /trending
// must all come before /:id, or Express will treat their literal path
// segments as an :id value and these routes will never be reached.
router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/category/:categoryId", productController.getProductsByCategory);
router.get("/hero", productController.getHeroProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get("/trending", productController.getTrendingProducts);
router.get("/:id", productController.getProductById);

// Protected routes: only admins can create, update, delete
router.post("/", authMiddleware, roleMiddleware("admin"), productController.createProduct);
router.put("/:id", authMiddleware, roleMiddleware("admin"), productController.updateProduct);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), productController.deleteProduct);

module.exports = router;