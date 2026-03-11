const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.warn(`[auth] 401 No token for ${req.method} ${req.originalUrl}`);
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.warn(`[auth] 403 Invalid token for ${req.method} ${req.originalUrl}: ${err.message}`);
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user; // attach decoded payload (id, role)
    next();
  });
}

// Role-based authorization
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.warn(
        `[auth] 403 Access denied for ${req.method} ${req.originalUrl}. role=${req.user.role}, allowed=${roles.join(",")}, userId=${req.user.id}`
      );
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };