const Product = require("../Models/ProductsModule");
const redis = require("../utils/cache");

// Utility to normalize booleans
function toBoolean(val) {
  return val === true || val === "true";
}

const CACHE_TTL = { EX: 1800 }; // 30 minutes

async function invalidateProductCaches() {
  await redis.del(
    "homepage:hero",
    "homepage:featured",
    "homepage:trending",
    "products:all"
  );
}

// GET /products
exports.getAllProducts = async (req, res) => {
  try {
    const cacheKey = "products:all";
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const products = await Product.findAll();
    await redis.set(cacheKey, JSON.stringify(products), CACHE_TTL);
    res.status(200).json(products);
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ message: "Failed to fetch products." });
  }
};

// GET /products/hero
exports.getHeroProducts = async (req, res) => {
  try {
    const cacheKey = "homepage:hero";
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const products = await Product.findHero();
    await redis.set(cacheKey, JSON.stringify(products), CACHE_TTL);
    res.status(200).json(products);
  } catch (err) {
    console.error("Get hero products error:", err);
    res.status(500).json({ message: "Failed to fetch hero products." });
  }
};

// GET /products/featured
exports.getFeaturedProducts = async (req, res) => {
  try {
    const cacheKey = "homepage:featured";
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const products = await Product.findFeatured();
    await redis.set(cacheKey, JSON.stringify(products), CACHE_TTL);
    res.status(200).json(products);
  } catch (err) {
    console.error("Get featured products error:", err);
    res.status(500).json({ message: "Failed to fetch featured products." });
  }
};

// GET /products/trending
exports.getTrendingProducts = async (req, res) => {
  try {
    const cacheKey = "homepage:trending";
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const products = await Product.findTrending();
    await redis.set(cacheKey, JSON.stringify(products), CACHE_TTL);
    res.status(200).json(products);
  } catch (err) {
    console.error("Get trending products error:", err);
    res.status(500).json({ message: "Failed to fetch trending products." });
  }
};

// GET /products/search?q=...
exports.searchProducts = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(200).json([]);
    const products = await Product.search(q);
    res.status(200).json(products);
  } catch (err) {
    console.error("Search products error:", err);
    res.status(500).json({ message: "Search failed." });
  }
};

// GET /products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    console.error("Get product error:", err);
    res.status(500).json({ message: "Failed to fetch product." });
  }
};

// GET /products/category/:categoryId
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.findByCategory(req.params.categoryId);
    res.status(200).json(products);
  } catch (err) {
    console.error("Get products by category error:", err);
    res.status(500).json({ message: "Failed to fetch related products." });
  }
};

// POST /products
exports.createProduct = async (req, res) => {
  try {
    const { name, price, sizes, image_url, category_id, show_on_hero, featured, trending } = req.body;
    if (!name || !price || !image_url || !category_id) {
      return res.status(400).json({ message: "Missing required product fields" });
    }

    const product = await Product.create({
      name,
      price,
      sizes,
      image_url,
      category_id,
      show_on_hero: toBoolean(show_on_hero),
      featured: toBoolean(featured),
      trending: toBoolean(trending),
    });

    await invalidateProductCaches();

    res.status(201).json(product);
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ message: "Failed to create product." });
  }
};

// PUT /products/:id
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, sizes, image_url, category_id, show_on_hero, featured, trending } = req.body;

    const product = await Product.update(req.params.id, {
      name,
      price,
      sizes,
      image_url,
      category_id,
      show_on_hero: show_on_hero !== undefined ? toBoolean(show_on_hero) : undefined,
      featured: featured !== undefined ? toBoolean(featured) : undefined,
      trending: trending !== undefined ? toBoolean(trending) : undefined,
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    await invalidateProductCaches();

    res.status(200).json(product);
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ message: "Failed to update product." });
  }
};

// DELETE /products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Product not found" });

    await Product.delete(req.params.id);

    await invalidateProductCaches();

    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ message: "Failed to delete product." });
  }
};