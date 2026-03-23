const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../middlewares/validate");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const {
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar,
  changePassword,
} = require("../controllers/profileController");

// ── All profile routes require authentication ─────────
router.use(protect);

// ── Validation chains ─────────────────────────────────
const updateProfileValidation = [
  body("fullName").optional().trim().notEmpty().withMessage("Full name cannot be empty")
    .isLength({ max: 80 }).withMessage("Full name cannot exceed 80 characters"),
  body("phone").optional().isMobilePhone().withMessage("Invalid phone number"),
  body("dob").optional().isISO8601().withMessage("Date of birth must be YYYY-MM-DD"),
  body("gender").optional().isIn(["male", "female", "other", "prefer_not_to_say"]).withMessage("Invalid gender"),
  body("bio").optional().isLength({ max: 500 }).withMessage("Bio cannot exceed 500 characters"),
  body("occupation").optional().isLength({ max: 100 }).withMessage("Occupation cannot exceed 100 characters"),
  body("company").optional().isLength({ max: 100 }).withMessage("Company cannot exceed 100 characters"),
];

const changePasswordValidation = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .custom((val, { req }) => {
      if (val === req.body.currentPassword) throw new Error("New password must be different from current password");
      return true;
    }),
];

// @route   GET /api/profile/me
// @desc    Get logged-in user's own profile
// @access  Private
router.get("/me", getMyProfile);

// @route   PUT /api/profile/me
// @desc    Update own profile (limited fields — cannot change role/status)
// @access  Private
router.put("/me", updateProfileValidation, validate, updateMyProfile);

// @route   POST /api/profile/me/avatar
// @desc    Upload own profile picture
// @access  Private
router.post("/me/avatar", upload.single("avatar"), uploadMyAvatar);

// @route   PUT /api/profile/me/change-password
// @desc    Change own password (requires current password)
// @access  Private
router.put("/me/change-password", changePasswordValidation, validate, changePassword);

module.exports = router;
