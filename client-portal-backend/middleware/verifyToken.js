const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // contains id and role
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(400).json({ message: "Invalid or expired token." });
  }
}

module.exports = verifyToken;
