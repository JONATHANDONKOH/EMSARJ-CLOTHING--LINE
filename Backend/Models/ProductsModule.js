const pool = require("../Config/db");

const PUBLIC_FIELDS =
  "id, name, price, sizes, image_url, hover_image_url, category_id, show_on_hero, featured, trending, created_at";

const Product = {
  async create({ 
    name, 
    price, 
    sizes, 
    image_url, 
    hover_image_url,
    category_id, 
    show_on_hero, 
    featured, 
    trending 
  }) {
    // Debugging logs
    console.log("MODEL VALUES:", {
      category_id,
      show_on_hero,
      featured,
      trending
    });

    console.log("INSERT VALUES:", [
      name,
      price,
      JSON.stringify(sizes ?? []),
      image_url,
      hover_image_url,
      category_id,
      show_on_hero,
      featured,
      trending
    ]);

    const { rows } = await pool.query(
      `
      INSERT INTO products
      (name, price, sizes, image_url, hover_image_url, category_id, show_on_hero, featured, trending)
      VALUES ($1,$2,$3::jsonb,$4,$5,$6::uuid,$7,$8,$9)
      RETURNING id
      `,
      [
        name,
        price,
        JSON.stringify(sizes ?? []),
        image_url,
        hover_image_url ?? null,
        category_id,   // must be a valid UUID string
        show_on_hero,
        featured,
        trending
      ]
    );

    const productId = rows[0].id;

    // Check exactly what Neon stored
    const check = await pool.query(
      `
      SELECT 
        id,
        name,
        show_on_hero,
        featured,
        trending
      FROM products
      WHERE id = $1
      `,
      [productId]
    );

    console.log("NEON STORED:", check.rows[0]);

    return check.rows[0];
  },

  async findAll() {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS}
       FROM products
       ORDER BY created_at DESC`
    );
    return rows;
  },

  async findHero() {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS}
       FROM products
       WHERE show_on_hero = true
       ORDER BY created_at DESC`
    );
    return rows;
  },

  async findFeatured() {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS}
       FROM products
       WHERE featured = true
       ORDER BY created_at DESC`
    );
    return rows;
  },

  async findTrending() {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS}
       FROM products
       WHERE trending = true
       ORDER BY created_at DESC`
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS}
       FROM products
       WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async findByCategory(categoryId) {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS}
       FROM products
       WHERE category_id = $1
       ORDER BY created_at DESC`,
      [categoryId]
    );
    return rows;
  },

  async search(query, limit = 10) {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS}
       FROM products
       WHERE name ILIKE $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [`%${query}%`, limit]
    );
    return rows;
  },

  async update(id, { name, price, sizes, image_url, hover_image_url, category_id, show_on_hero, featured, trending }) {
    const { rows } = await pool.query(
      `UPDATE products
       SET
         name = COALESCE($2, name),
         price = COALESCE($3, price),
         sizes = COALESCE($4::jsonb, sizes),
         image_url = COALESCE($5, image_url),
         hover_image_url = $6,
         category_id = COALESCE($7::uuid, category_id),
         show_on_hero = COALESCE($8, show_on_hero),
         featured = COALESCE($9, featured),
         trending = COALESCE($10, trending)
       WHERE id = $1
       RETURNING ${PUBLIC_FIELDS}`,
      [
        id,
        name,
        price,
        sizes !== undefined ? JSON.stringify(sizes) : null,
        image_url,
        hover_image_url !== undefined ? hover_image_url : null,
        category_id,   // must be a valid UUID string
        show_on_hero !== undefined ? show_on_hero : null,
        featured !== undefined ? featured : null,
        trending !== undefined ? trending : null,
      ]
    );
    return rows[0] || null;
  },

  async delete(id) {
    await pool.query(`DELETE FROM products WHERE id = $1`, [id]);
  },
};

module.exports = Product;