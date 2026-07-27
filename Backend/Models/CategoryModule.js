const pool = require("../Config/db");

const PUBLIC_FIELDS = 'id, name, description, created_at';

const Category = {
  // Create a new category
  async create({ name, description }) {
    const { rows } = await pool.query(
      `INSERT INTO categories (name, description)
       VALUES ($1, $2)
       RETURNING ${PUBLIC_FIELDS}`,
      [name, description]
    );
    return rows[0];
  },

  // Get all categories
  async findAll() {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS}
       FROM categories
       ORDER BY created_at DESC`
    );
    return rows;
  },

  // Get category by ID
  async findById(id) {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS}
       FROM categories
       WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  // Update category
  async update(id, { name, description }) {
    const { rows } = await pool.query(
      `UPDATE categories
       SET
         name = COALESCE($2, name),
         description = COALESCE($3, description)
       WHERE id = $1
       RETURNING ${PUBLIC_FIELDS}`,
      [id, name, description]
    );
    return rows[0] || null;
  },

  // Delete category
  async delete(id) {
    await pool.query(`DELETE FROM categories WHERE id = $1`, [id]);
  },
};

module.exports = Category;
