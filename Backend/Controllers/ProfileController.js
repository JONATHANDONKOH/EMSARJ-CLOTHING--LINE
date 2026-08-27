const User = require("../Models/UsersModule");

// GET /profile
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

// PUT /profile
async function updateProfile(req, res) {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { name, email, location, number } = user;
    return res.json({ name, email, location, number });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ message: "Failed to update profile" });
  }
}

module.exports = { getProfile, updateProfile };
