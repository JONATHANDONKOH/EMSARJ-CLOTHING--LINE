const jwt = require("jsonwebtoken");
const User = require("../Models/UsersModule");
const redis = require("../utils/cache");

// Single source of truth for session lifetime — JWT expiry, cookie maxAge,
// and Redis TTL all derive from this so they can't silently drift apart.
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "none",
  maxAge: SESSION_TTL_SECONDS * 1000, // ms — 7 days, aligned with JWT + Redis
};

// Same identity as COOKIE_OPTIONS minus maxAge — res.clearCookie() needs to
// be called with matching httpOnly/secure/sameSite for the browser to
// actually match and remove the cookie; maxAge is irrelevant for clearing.
const CLEAR_COOKIE_OPTIONS = {
  httpOnly: COOKIE_OPTIONS.httpOnly,
  secure: COOKIE_OPTIONS.secure,
  sameSite: COOKIE_OPTIONS.sameSite,
};

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

    // Establish the Redis session immediately, so authMiddleware finds a
    // valid session on the very first protected request after signup.
    await redis.set(
      `session:${user.id}`,
      JSON.stringify({ id: user.id, role: user.role }),
      { EX: SESSION_TTL_SECONDS }
    );

    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(201).json(user);
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

    // Establish the Redis session immediately — this is what makes Redis
    // the active-session source of truth from the moment of login.
    await redis.set(
      `session:${publicUser.id}`,
      JSON.stringify({ id: publicUser.id, role: publicUser.role }),
      { EX: SESSION_TTL_SECONDS }
    );

    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(200).json(publicUser);
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// POST /auth/signout
// Runs behind authMiddleware (see AuthRoute.js), so req.user is set and we
// can invalidate the Redis session — not just clear the cookie. This is
// what makes the old JWT unusable afterward: authMiddleware will reject it
// on the next request since session:<id> is gone, even though the JWT
// itself is still cryptographically valid for up to 7 more days.
exports.signout = async (req, res) => {
  try {
    await redis.del(`session:${req.user.id}`);
  } catch (err) {
    // Don't block signout on a Redis hiccup — the cookie is still cleared
    // below. Log for visibility.
    console.error("Signout Redis error:", err);
  }

  res.clearCookie("token", CLEAR_COOKIE_OPTIONS);
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