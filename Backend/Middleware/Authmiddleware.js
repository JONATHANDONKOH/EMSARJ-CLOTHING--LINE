const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
  const token = req.cookies?.token;

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // The verified JWT is now the sole source of identity — no Redis
    // lookup to confirm an active session. A valid signature + unexpired
    // token is sufficient.
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please sign in again." });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = authMiddleware;