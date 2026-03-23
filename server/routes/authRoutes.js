const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../middlewares/validate");
const { protect } = require("../middlewares/authMiddleware");
const {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
} = require("../controllers/authController");

// ── Validation chains ─────────────────────────────────

const registerValidation = [
  body("username")
    .trim()
    .notEmpty().withMessage("Username is required")
    .isLength({ min: 3, max: 30 }).withMessage("Username must be 3–30 characters")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers and underscores"),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("fullName")
    .trim()
    .notEmpty().withMessage("Full name is required")
    .isLength({ max: 80 }).withMessage("Full name cannot exceed 80 characters"),
  body("dob")
    .optional()
    .isISO8601().withMessage("Date of birth must be a valid date (YYYY-MM-DD)"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other", "prefer_not_to_say"]).withMessage("Invalid gender value"),
];

const loginValidation = [
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidation = [
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email"),
];

const resetPasswordValidation = [
  body("password")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

// ── Routes ────────────────────────────────────────────

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", registerValidation, validate, register);

// @route   GET /api/auth/verify-email
// @desc    Verify email with token
// @access  Public
router.get("/verify-email", verifyEmail);

// @route   POST /api/auth/login
// @desc    Log in and receive access + refresh tokens
// @access  Public
router.post("/login", loginValidation, validate, login);

// @route   POST /api/auth/refresh-token
// @desc    Get a new access token using the refresh token cookie
// @access  Public (requires valid refresh token cookie)
router.post("/refresh-token", refreshToken);

// @route   POST /api/auth/logout
// @desc    Log out and clear refresh cookie
// @access  Private
router.post("/logout", protect, logout);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset link to email
// @access  Public
router.post("/forgot-password", forgotPasswordValidation, validate, forgotPassword);

// @route   POST /api/auth/reset-password
// @desc    Reset password using token from email
// @access  Public (requires valid reset token query param)
router.post("/reset-password", resetPasswordValidation, validate, resetPassword);

// @route   GET /api/auth/me
// @desc    Get currently authenticated user
// @access  Private
router.get("/me", protect, getMe);

module.exports = router;
