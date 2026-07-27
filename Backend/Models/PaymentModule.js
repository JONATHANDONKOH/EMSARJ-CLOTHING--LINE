const pool = require("../Config/db");

/*
Matching SQL (run once against your Neon database):

CREATE TABLE payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction        VARCHAR(100) NOT NULL UNIQUE,  -- Paystack reference; UNIQUE stops duplicate
                                                      -- rows if verify + webhook both fire
  order_id           UUID NOT NULL REFERENCES orders(id),
  method             VARCHAR(50)  NOT NULL,   -- Paystack channel: "card" | "bank" | "mobile_money" | "ussd" etc.
  amount             NUMERIC(10, 2) NOT NULL,
  status             VARCHAR(20)  NOT NULL DEFAULT 'pending', -- completed | pending | failed | refunded
  date               TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_order_id ON payments (order_id);
*/

const PUBLIC_FIELDS =
  'id, transaction, order_id AS "orderId", method, amount, status, date';

const Payment = {
  // Safe to call from both verifyPayment and the webhook for the same
  // charge — relies on the DB-level UNIQUE constraint on `transaction`
  // rather than an app-level "does it exist" check, which can race.
  // Returns the existing row if one already exists instead of erroring.
  async createIfNotExists({ transaction, order_id, method, amount, status = "pending" }) {
    const { rows } = await pool.query(
      `INSERT INTO payments (transaction, order_id, method, amount, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (transaction) DO NOTHING
       RETURNING ${PUBLIC_FIELDS}`,
      [transaction, order_id, method, amount, status]
    );

    if (rows[0]) return rows[0];

    // Someone else (the other of verify/webhook) inserted it first —
    // fetch and return that row instead.
    return Payment.findByTransaction(transaction);
  },

  // Kept for any callers that specifically want a hard insert and are
  // sure no duplicate will be attempted (e.g. an admin manually adding
  // a record for an offline payment).
  async create({ transaction, order_id, method, amount, status = "pending" }) {
    const { rows } = await pool.query(
      `INSERT INTO payments (transaction, order_id, method, amount, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${PUBLIC_FIELDS}`,
      [transaction, order_id, method, amount, status]
    );
    return rows[0];
  },

  async findAll() {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS} FROM payments ORDER BY date DESC`
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS} FROM payments WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  // Most recent payment for an order — what you want when checking
  // "has this order been paid".
  async findByOrderId(order_id) {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS} FROM payments WHERE order_id = $1 ORDER BY date DESC LIMIT 1`,
      [order_id]
    );
    return rows[0] || null;
  },

  // All attempts for an order — useful for support/admin views where you
  // want to see failed retries, not just the successful one.
  async findAllByOrderId(order_id) {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS} FROM payments WHERE order_id = $1 ORDER BY date DESC`,
      [order_id]
    );
    return rows;
  },

  async findByTransaction(transaction) {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS} FROM payments WHERE transaction = $1`,
      [transaction]
    );
    return rows[0] || null;
  },

  async updateStatus(id, status) {
    const { rows } = await pool.query(
      `UPDATE payments SET status = $2 WHERE id = $1 RETURNING ${PUBLIC_FIELDS}`,
      [id, status]
    );
    return rows[0] || null;
  },

  async delete(id) {
    await pool.query(`DELETE FROM payments WHERE id = $1`, [id]);
  },
};

module.exports = Payment;