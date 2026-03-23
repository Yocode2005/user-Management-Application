const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const validate = require("../middlewares/validate");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  bulkDeleteUsers,
  exportUsers,
  getStats,
  uploadAvatar,
} = require("../controllers/userController");

// ── Validation chains ─────────────────────────────────

const createUserValidation = [
  body("username").trim().notEmpty().withMessage("Username is required")
    .isLength({ min: 3, max: 30 }).withMessage("Username must be 3–30 characters"),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("role").optional().isIn(["user", "admin", "moderator"]).withMessage("Invalid role"),
  body("status").optional().isIn(["active", "inactive", "banned"]).withMessage("Invalid status"),
];

const updateUserValidation = [
  param("id").isMongoId().withMessage("Invalid user ID"),
  body("email").optional().isEmail().withMessage("Invalid email").normalizeEmail(),
  body("fullName").optional().trim().notEmpty().withMessage("Full name cannot be empty"),
  body("dob").optional().isISO8601().withMessage("Invalid date format"),
  body("gender").optional().isIn(["male", "female", "other", "prefer_not_to_say"]).withMessage("Invalid gender"),
];

const statusValidation = [
  param("id").isMongoId().withMessage("Invalid user ID"),
  body("status").isIn(["active", "inactive", "banned"]).withMessage("Status must be active, inactive, or banned"),
];

const roleValidation = [
  param("id").isMongoId().withMessage("Invalid user ID"),
  body("role").isIn(["user", "admin", "moderator"]).withMessage("Role must be user, admin, or moderator"),
];

const mongoIdParam = [param("id").isMongoId().withMessage("Invalid user ID")];

// ── Apply auth + admin restriction to all routes ──────
router.use(protect, restrictTo("admin", "moderator"));

// @route   GET /api/users/stats/overview
// @desc    Get dashboard stats overview
// @access  Admin, Moderator
router.get("/stats/overview", getStats);

// @route   GET /api/users/export
// @desc    Export users as CSV download
// @access  Admin only
router.get("/export", restrictTo("admin"), exportUsers);

// @route   GET /api/users
// @desc    Get all users (paginated, filterable, sortable)
// @access  Admin, Moderator
router.get("/", getAllUsers);

// @route   POST /api/users
// @desc    Admin creates a user directly
// @access  Admin only
router.post("/", restrictTo("admin"), createUserValidation, validate, createUser);

// @route   DELETE /api/users/bulk
// @desc    Bulk soft-delete multiple users
// @access  Admin only
router.delete("/bulk", restrictTo("admin"), bulkDeleteUsers);

// @route   GET /api/users/:id
// @desc    Get a single user by ID
// @access  Admin, Moderator
router.get("/:id", mongoIdParam, validate, getUserById);

// @route   PUT /api/users/:id
// @desc    Update a user's profile fields
// @access  Admin, Moderator
router.put("/:id", updateUserValidation, validate, updateUser);

// @route   PATCH /api/users/:id/status
// @desc    Change a user's status (active/inactive/banned)
// @access  Admin only
router.patch("/:id/status", restrictTo("admin"), statusValidation, validate, updateUserStatus);

// @route   PATCH /api/users/:id/role
// @desc    Change a user's role
// @access  Admin only
router.patch("/:id/role", restrictTo("admin"), roleValidation, validate, updateUserRole);

// @route   DELETE /api/users/:id
// @desc    Soft-delete a user
// @access  Admin only
router.delete("/:id", restrictTo("admin"), mongoIdParam, validate, deleteUser);

// @route   POST /api/users/:id/avatar
// @desc    Upload/replace avatar for any user (admin override)
// @access  Admin only
router.post("/:id/avatar", restrictTo("admin"), upload.single("avatar"), uploadAvatar);

module.exports = router;
