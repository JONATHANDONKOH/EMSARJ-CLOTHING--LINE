const User = require("../Models/UsersModule");

// GET /api/users  (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (err) {
    console.error("GetAllUsers error:", err);
    res.status(500).json({ message: "Failed to load users." });
  }
};

// DELETE /api/users/:id  (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted", user: deleted });
  } catch (err) {
    console.error("DeleteUser error:", err);
    res.status(500).json({ message: "Failed to delete user." });
  }
};