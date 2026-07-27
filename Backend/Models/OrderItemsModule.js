const pool = require("../Config/db");

const PUBLIC_FIELDS = "id, order_id, product_id, product_name, size, qty, price";

const OrderItem = {
  /**
   * Bulk-insert order items in one query.
   * `items`: [{ product_id, product_name, size, qty, price }, ...]
   * `client` is optional — pass a checked-out pg client to run inside the
   * same transaction as the parent order insert (see OrdersController.createOrder).
   */
  async createOrderItems(order_id, items, client = pool) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("At least one order item is required");
    }

    const values = [];
    const placeholders = items.map((item, i) => {
      const base = i * 6;
      values.push(
        order_id,
        item.product_id,
        item.product_name,
        item.size ?? null,
        item.qty,
        item.price
      );
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`;
    });

    const { rows } = await client.query(
      `INSERT INTO "orderItems" (order_id, product_id, product_name, size, qty, price)
       VALUES ${placeholders.join(", ")}
       RETURNING ${PUBLIC_FIELDS}`,
      values
    );
    return rows;
  },

  async getItemsByOrderId(order_id) {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS} FROM "orderItems" WHERE order_id = $1`,
      [order_id]
    );
    return rows;
  },
};

module.exports = OrderItem;