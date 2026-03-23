require("dotenv").config();
require("express-async-errors"); // patches Express to forward async errors to error handler

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const { seedAdmin } = require("./utils/seeder");
const errorHandler = require("./middlewares/errorHandler");

// ── Route imports ─────────────────────────────────────
const authRoutes    = require("./routes/authRoutes");
const userRoutes    = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const auditRoutes   = require("./routes/auditRoutes");

// ── App init ──────────────────────────────────────────
const app = express();

// ── Connect to MongoDB + seed default admin ───────────
connectDB().then(() => seedAdmin());

// ── Security middleware ───────────────────────────────
app.use(helmet());

// CORS — allow requests from React dev server
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true, // needed for cookies (refresh token)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Global rate limiter — 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again after 15 minutes." },
});
app.use(globalLimiter);

// Stricter limiter for auth routes — 20 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many auth attempts. Please try again after 15 minutes." },
});

// ── Body parsing ──────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ── HTTP request logging (dev only) ──────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Health check ──────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "UserBase API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Mount routes ──────────────────────────────────────
app.use("/api/auth",    authLimiter, authRoutes);
app.use("/api/users",   userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/audit",   auditRoutes);

// ── 404 handler for unmatched routes ─────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global error handler (must be last) ──────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀  Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  console.log(`📡  API base URL: http://localhost:${PORT}/api`);
  console.log(`❤️   Health check: http://localhost:${PORT}/api/health\n`);
});

// ── Handle unhandled promise rejections ───────────────
process.on("unhandledRejection", (err) => {
  console.error("💥 UNHANDLED REJECTION:", err.name, err.message);
  server.close(() => process.exit(1));
});

// ── Handle uncaught exceptions ────────────────────────
process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION:", err.name, err.message);
  process.exit(1);
});

module.exports = app; // exported for testing
