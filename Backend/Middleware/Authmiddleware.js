const jwt = require("jsonwebtoken");
const redis = require("../utils/cache");

// Must match SESSION_TTL_SECONDS in AuthController.js — this is the TTL
// sliding renewal resets back to on every authenticated request.
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

async function authMiddleware(req, res, next) {
  const token = req.cookies?.token;

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const cacheKey = `session:${decoded.id}`;

    // 🔹 Redis is the source of truth for "is this session active". A
    // valid JWT signature is necessary but not sufficient — the session
    // must also still exist in Redis.
    const cachedUser = await redis.get(cacheKey);

    if (!cachedUser) {
      // No active session in Redis — signed out, expired from inactivity,
      // or evicted. Reject rather than recreating from the JWT, since that
      // would let a logged-out (but still-unexpired) JWT keep working.
      return res.status(401).json({ error: "Session expired. Please sign in again." });
    }

    // 🔹 Sliding renewal: an active user's session TTL resets to 7 days on
    // every authenticated request, so it expires 7 days after their *last*
    // activity rather than 7 days after login. If this fails, don't block
    // the request over it — worst case the session expires a bit earlier
    // than expected, which just means an extra re-login, not a security
    // hole.
    redis.expire(cacheKey, SESSION_TTL_SECONDS).catch((err) => {
      console.error("Session renewal error:", err);
    });

    req.user = JSON.parse(cachedUser);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please sign in again." });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = authMiddleware;