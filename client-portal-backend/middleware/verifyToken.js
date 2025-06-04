const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
  const authHeader = req.header("Authorization");

  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // contains id and role
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid token." });
  }
}

module.exports = verifyToken;
