const pool = require("../Config/db");

// Kept server-side on purpose — never trust a delivery fee or total sent
// from the client. Swap this for a real shipping calculation later if needed.
const DELIVERY_FEE = 20;

const PUBLIC_FIELDS = `
  id, user_id, first_name, last_name, email, phone_number,
  subtotal, delivery_fee, total, status, payment_reference, created_at
`;

const Order = {
  DELIVERY_FEE,

  /**
   * Insert a new order.
   * `client` is optional — pass a checked-out pg client when this needs to
   * run inside the same transaction as the order items insert (see
   * OrdersController.createOrder). Defaults to the pool for standalone use.
   */
  async createOrder(
    { user_id, first_name, last_name, email, phone_number, subtotal },
    client = pool
  ) {
    const subtotalNum = Number(subtotal);
    const total = subtotalNum + DELIVERY_FEE;

    const { rows } = await client.query(
      `INSERT INTO orders
       (user_id, first_name, last_name, email, phone_number, subtotal, delivery_fee, total, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING ${PUBLIC_FIELDS}`,
      [user_id, first_name, last_name, email, phone_number, subtotalNum, DELIVERY_FEE, total]
    );
    return rows[0];
  },

  async getOrderById(id) {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS} FROM orders WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  // Used by the Paystack webhook — the only signal it has is the reference
  // it's telling us about, so this is how it finds which order to update.
  async findByReference(payment_reference) {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS} FROM orders WHERE payment_reference = $1`,
      [payment_reference]
    );
    return rows[0] || null;
  },

  // Logged-in user's own order history
  async getOrdersByUser(user_id) {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS} FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    );
    return rows;
  },

  // Admin — all orders
  async getAllOrders() {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS} FROM orders ORDER BY created_at DESC`
    );
    return rows;
  },

  // Used after Paystack verification
  async updateOrderStatus(id, status, payment_reference = null) {
    const { rows } = await pool.query(
      `UPDATE orders
       SET status = $2,
           payment_reference = COALESCE($3, payment_reference)
       WHERE id = $1
       RETURNING ${PUBLIC_FIELDS}`,
      [id, status, payment_reference]
    );
    return rows[0] || null;
  },
};

module.exports = Order;