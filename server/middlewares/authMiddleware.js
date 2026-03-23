const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ApiError } = require("../utils/ApiError");

/**
 * Protect routes — verifies JWT access token
 */
const protect = async (req, res, next) => {
  let token;

  // Accept token from Authorization header or cookie
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) throw new ApiError(401, "Not authenticated. Please log in.");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password");

  if (!user) throw new ApiError(401, "User belonging to this token no longer exists.");
  if (user.status === "banned") throw new ApiError(403, "Your account has been suspended. Contact support.");

  req.user = user;
  next();
};

/**
 * Restrict access to specific roles
 * Usage: restrictTo("admin") or restrictTo("admin", "moderator")
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "You do not have permission to perform this action.");
    }
    next();
  };
};

module.exports = { protect, restrictTo };
