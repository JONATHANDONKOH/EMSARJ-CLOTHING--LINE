const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded = { id, role, iat, exp } — matches the payload signToken()
    // puts in every JWT at signup/signin. role rides along in the token
    // itself, so roleMiddleware("admin") can check req.user.role directly
    // without a DB round trip on every request.
    req.user = { id: decoded.id, role: decoded.role };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please sign in again." });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = authMiddleware;