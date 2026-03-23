const User = require("../models/User");
const { ApiError, ApiResponse } = require("../utils/ApiError");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");
const { createAuditLog } = require("../services/auditService");

// ── GET /api/profile/me ────────────────────────────────
exports.getMyProfile = async (req, res) => {
  res.json(new ApiResponse(200, { user: req.user.toPublicJSON() }));
};

// ── PUT /api/profile/me ────────────────────────────────
exports.updateMyProfile = async (req, res) => {
  const ALLOWED = [
    "fullName", "phone", "dob", "gender", "bio",
    "occupation", "company", "address", "socialLinks",
  ];

  const updates = {};
  ALLOWED.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  if (Object.keys(updates).length === 0) throw new ApiError(400, "No valid fields provided.");

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  await createAuditLog({
    action: "USER_UPDATED",
    performedBy: req.user._id,
    targetUser: req.user._id,
    details: { updatedFields: Object.keys(updates), selfUpdate: true },
    req,
  });

  res.json(new ApiResponse(200, { user: user.toPublicJSON() }, "Profile updated successfully."));
};

// ── POST /api/profile/me/avatar ────────────────────────
exports.uploadMyAvatar = async (req, res) => {
  if (!req.file) throw new ApiError(400, "Please upload an image file.");

  const user = await User.findById(req.user._id);

  if (user.avatar?.public_id) {
    await deleteFromCloudinary(user.avatar.public_id);
  }

  const { url, public_id } = await uploadToCloudinary(req.file.buffer);
  user.avatar = { url, public_id };
  await user.save({ validateBeforeSave: false });

  await createAuditLog({
    action: "AVATAR_UPDATED",
    performedBy: req.user._id,
    targetUser: req.user._id,
    req,
  });

  res.json(new ApiResponse(200, { avatar: user.avatar }, "Avatar updated successfully."));
};

// ── PUT /api/profile/me/change-password ────────────────
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current and new password are required.");
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect.");
  }

  user.password = newPassword;
  await user.save();

  res.json(new ApiResponse(200, null, "Password changed successfully."));
};
