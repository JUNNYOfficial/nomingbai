const jwt = require("jsonwebtoken");
const config = require("../config");

const secret = config.JWT_SECRET || "nomingbai_default_secret";

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

module.exports = {
  signToken,
  verifyToken
};
