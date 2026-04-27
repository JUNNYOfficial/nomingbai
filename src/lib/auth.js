const jwt = require("jsonwebtoken");
const config = require("../config");

const secret = config.JWT_SECRET;

function signToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: "6h" });
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Forbidden: admin access required" });
  }
  next();
}

function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return { valid: false, message: "密码不能为空" };
  }
  if (password.length < 6) {
    return { valid: false, message: "密码长度至少为 6 位" };
  }
  if (password.length > 128) {
    return { valid: false, message: "密码长度不能超过 128 位" };
  }
  return { valid: true };
}

module.exports = {
  signToken,
  verifyToken,
  requireAdmin,
  validatePassword
};
