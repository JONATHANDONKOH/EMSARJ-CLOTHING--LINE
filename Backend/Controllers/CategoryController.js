const Category = require("../Models/CategoryModule");
const redis = require("../utils/cache");

const CACHE_TTL = { EX: 1800 }; // 30 minutes

async function invalidateCategoryCaches(id) {
  const keys = ["categories:all"];
  if (id) keys.push(`categories:${id}`);
  await redis.del(...keys);
}

// GET /categories
exports.getAllCategories = async (req, res) => {
  try {
    const cacheKey = "categories:all";
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const categories = await Category.findAll();
    await redis.set(cacheKey, JSON.stringify(categories), CACHE_TTL);
    res.status(200).json(categories);
  } catch (err) {
    console.error("Get categories error:", err);
    res.status(500).json({ message: "Failed to fetch categories." });
  }
};

// GET /categories/:id
exports.getCategoryById = async (req, res) => {
  try {
    const cacheKey = `categories:${req.params.id}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await redis.set(cacheKey, JSON.stringify(category), CACHE_TTL);
    res.status(200).json(category);
  } catch (err) {
    console.error("Get category error:", err);
    res.status(500).json({ message: "Failed to fetch category." });
  }
};

// POST /categories (admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const category = await Category.create({ name, description });

    await invalidateCategoryCaches();

    res.status(201).json(category);
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ message: "Failed to create category." });
  }
};

// PUT /categories/:id (admin only)
exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.update(req.params.id, { name, description });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await invalidateCategoryCaches(req.params.id);

    res.status(200).json(category);
  } catch (err) {
    console.error("Update category error:", err);
    res.status(500).json({ message: "Failed to update category." });
  }
};

// DELETE /categories/:id (admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const existing = await Category.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    await Category.delete(req.params.id);

    await invalidateCategoryCaches(req.params.id);

    res.status(200).json({ message: "Category deleted" });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({ message: "Failed to delete category." });
  }
};