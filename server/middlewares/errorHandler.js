const { ApiError } = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // ── Mongoose: bad ObjectId ────────────────────────
  if (err.name === "CastError") {
    error = new ApiError(400, `Invalid ID: ${err.value}`);
  }

  // ── Mongoose: duplicate key ───────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = new ApiError(409, `${field} '${value}' is already taken. Please use a different one.`);
  }

  // ── Mongoose: validation error ────────────────────
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, "Validation failed", messages);
  }

  // ── JWT errors ────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid token. Please log in again.");
  }
  if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Your session has expired. Please log in again.");
  }

  // ── Log non-operational errors ────────────────────
  if (!err.isOperational) {
    console.error("💥 UNHANDLED ERROR:", err);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || "Internal server error",
    errors: error.errors || [],
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
