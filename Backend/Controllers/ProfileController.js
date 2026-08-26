const User = require("../Models/User");

// GET /profile — returns the signed-in user's basic profile fields.
// Relies on authMiddleware having set req.user (from the JWT) beforehand.
async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email, location, number } = user;
    return res.json({ name, email, location, number });
  } catch (err) {
    console.error("getProfile error:", err);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
}

module.exports = { getProfile };