const bcrypt = require("bcryptjs");
const pool = require("../Config/db");

/*
Matching SQL (run once against your Neon database):

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  location      VARCHAR(255) NOT NULL,
  number        VARCHAR(30) NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- gen_random_uuid() needs: CREATE EXTENSION IF NOT EXISTS pgcrypto;
*/

const PUBLIC_FIELDS =
  "id, name, email, location, number, role, created_at";

const User = {
  // Create a new user. Hashes the plaintext password before storing.
  async create({ name, email, location, number, password, role = "user" }) {
    const passwordHash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, location, number, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${PUBLIC_FIELDS}`,
      [name, email, location, number, passwordHash, role]
    );

    return rows[0];
  },

  // All users, alphabetical by name — used by the admin UsersView.
  async findAll() {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS} FROM users ORDER BY name ASC`
    );
    return rows;
  },

  // Full row (includes password_hash) — used internally for login checks only.
  async findByEmailWithPassword(email) {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS}, password_hash
       FROM users
       WHERE email = $1`,
      [email]
    );
    return rows[0] || null;
  },

  async findByEmail(email) {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS} FROM users WHERE email = $1`,
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS} FROM users WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async update(id, { name, location, number }) {
    const { rows } = await pool.query(
      `UPDATE users
       SET name = COALESCE($2, name),
           location = COALESCE($3, location),
           number = COALESCE($4, number)
       WHERE id = $1
       RETURNING ${PUBLIC_FIELDS}`,
      [id, name, location, number]
    );
    return rows[0] || null;
  },

  // Deletes a user by id. Returns the deleted row's public fields, or
  // null if no user with that id existed.
  async remove(id) {
    const { rows } = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING ${PUBLIC_FIELDS}`,
      [id]
    );
    return rows[0] || null;
  },

  async verifyPassword(plainPassword, passwordHash) {
    return bcrypt.compare(plainPassword, passwordHash);
  },
};

module.exports = User;