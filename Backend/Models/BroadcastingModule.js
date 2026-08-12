const pool = require("../Config/db"); // match whatever UsersModel.js imports for the pg pool

const SubscriberModel = {
  async subscribe(email) {
    const result = await pool.query(
      `INSERT INTO subscribers (email)
       VALUES ($1)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, created_at`,
      [email]
    );
    return result.rows[0] || null; // null means it already existed
  },

  async getAllEmails() {
    const result = await pool.query(`SELECT email FROM subscribers ORDER BY created_at ASC`);
    return result.rows.map((row) => row.email);
  },

  async getAll() {
    const result = await pool.query(
      `SELECT id, email, created_at FROM subscribers ORDER BY created_at DESC`
    );
    return result.rows;
  },
};

module.exports = SubscriberModel;