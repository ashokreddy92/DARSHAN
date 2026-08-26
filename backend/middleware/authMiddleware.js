const jwt = require("jsonwebtoken");
const User = require("../models/User");

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "darshaneasemenjwtsecret12345!";

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    const authHeader = req.headers.authorization;

    if (
      authHeader &&
      authHeader.startsWith("Bearer ")
    ) {
      // Get token after "Bearer "
      token = authHeader.split(" ")[1];
    }

    // No token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
        code: "NO_TOKEN",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from token
    // Exclude password from returned user
    const user = await User.findById(decoded.id).select("-password");

    // User does not exist
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Attach user to request
    req.user = user;

    // Continue to protected route
    next();

  } catch (error) {
    // JWT expired
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired, please log in again",
        code: "TOKEN_EXPIRED",
      });
    }

    // JWT invalid
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token, please log in again",
        code: "INVALID_TOKEN",
      });
    }

    // JWT malformed
    if (error.name === "NotBeforeError") {
      return res.status(401).json({
        success: false,
        message: "Token is not active yet",
        code: "TOKEN_NOT_ACTIVE",
      });
    }

    // Database or unexpected error
    console.error("Authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
      code: "AUTH_ERROR",
    });
  }
};


// ======================================================
// Authorize user roles
// ======================================================

const authorize = (...roles) => {
  return (req, res, next) => {

    // User should already be attached by protect middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
        code: "NO_USER",
      });
    }

    // Check user's role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
        code: "FORBIDDEN",
      });
    }

    next();
  };
};


// ======================================================
// Optional authentication - attaches user if valid token exists
// ======================================================
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (user) {
          req.user = user;
        }
      }
    }
    next();
  } catch (error) {
    // If token expired or invalid, proceed as guest without error
    next();
  }
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
};