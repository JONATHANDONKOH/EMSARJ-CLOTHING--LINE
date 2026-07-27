const jwt = require("jsonwebtoken");
const User = require("../Models/UsersModule");

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// POST /auth/signup
exports.signup = async (req, res) => {
  try {
    const { name, email, location, number, password } = req.body;

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const user = await User.create({ name, email, location, number, password });
    const token = signToken(user);

    res.status(201).json({ ...user, token });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
};

// POST /auth/signin
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmailWithPassword(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const valid = await User.verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const { password_hash, ...publicUser } = user;
    const token = signToken(publicUser);

    res.status(200).json({ ...publicUser, token });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// POST /auth/signout
exports.signout = async (req, res) => {
  // Stateless JWT: nothing to invalidate server-side. If the token is ever
  // stored in an httpOnly cookie instead of localStorage, clear it here too:
  res.clearCookie("token");
  res.status(200).json({ message: "Signed out" });
};

// GET /auth/me  (used to rehydrate session on app load, protected by authMiddleware)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // req.user set by authMiddleware
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// PUT /auth/me  (protected — used by Account.jsx to save profile edits)
// Email is intentionally excluded — Account.jsx keeps it read-only, and
// changing it here would need its own uniqueness check + re-verification
// flow, which isn't in scope for a simple profile edit.
exports.updateMe = async (req, res) => {
  try {
    const { name, number, location } = req.body;

    const user = await User.update(req.user.id, { name, number, location });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("UpdateMe error:", err);
    res.status(500).json({ message: "Failed to update profile." });
  }
};