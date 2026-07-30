const pool = require('../db');

// Send a new message (sender = logged-in user)
// receiverId is optional — if omitted (e.g. the site-wide "contact us" form,
// which has no way to know an admin's UUID), the message is routed to the
// first admin user found.
exports.sendMessage = async (req, res) => {
  const { receiverId, subject, body } = req.body;
  const senderId = req.user.id; // comes from authMiddleware

  if (!body || !body.trim()) {
    return res.status(400).json({ success: false, error: "Message body is required" });
  }

  try {
    let finalReceiverId = receiverId;

    if (!finalReceiverId) {
      const adminResult = await pool.query(
        `SELECT id FROM users WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1`
      );
      if (adminResult.rows.length === 0) {
        return res.status(500).json({ success: false, error: "No admin account found to receive this message" });
      }
      finalReceiverId = adminResult.rows[0].id;
    }

    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, subject, body)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [senderId, finalReceiverId, subject || null, body]
    );

    res.status(201).json({ success: true, message: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all messages for the logged-in admin (receiver_id = admin)
exports.getMessagesForAdmin = async (req, res) => {
  const adminId = req.user.id; // comes from authMiddleware

  try {
    const result = await pool.query(
      `SELECT m.id, m.subject, m.body, m.created_at,
              u.username AS sender_name, u.role AS sender_role
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.receiver_id = $1
       ORDER BY m.created_at DESC`,
      [adminId]
    );

    res.json({ success: true, messages: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all messages sent by the logged-in user (sender_id = user)
exports.getMessagesForUser = async (req, res) => {
  const userId = req.user.id; // comes from authMiddleware

  try {
    const result = await pool.query(
      `SELECT m.id, m.subject, m.body, m.created_at,
              u.username AS receiver_name, u.role AS receiver_role
       FROM messages m
       JOIN users u ON m.receiver_id = u.id
       WHERE m.sender_id = $1
       ORDER BY m.created_at DESC`,
      [userId]
    );

    res.json({ success: true, messages: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete a message — only the sender or receiver of that message may delete it
exports.deleteMessage = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // comes from authMiddleware

  try {
    const result = await pool.query(
      `DELETE FROM messages
       WHERE id = $1 AND (sender_id = $2 OR receiver_id = $2)
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Message not found or you don't have permission to delete it",
      });
    }

    res.json({ success: true, message: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};