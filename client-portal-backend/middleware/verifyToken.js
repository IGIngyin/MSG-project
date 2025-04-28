const jwt = require("jsonwebtoken"); // For JWT token verification

// Secret key for JWT (make sure to store it securely in a real app)
const secretKey = process.env.JWT_SECRET;

// Middleware to check for token
function verifyToken(req, res, next) {
  // Get the token from token header
  const token = req.header("token")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid token." });
  }
}

module.exports = verifyToken;
