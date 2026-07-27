// roleMiddleware.js
function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    // Make sure user is attached to request (e.g. from auth middleware)
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check role
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    // Role matches → continue
    next();
  };
}

module.exports = roleMiddleware;
