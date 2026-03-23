const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { getAuditLogs } = require("../services/auditService");
const { ApiResponse } = require("../utils/ApiError");

// All audit routes: admin only
router.use(protect, restrictTo("admin"));

// @route   GET /api/audit
// @desc    Get paginated audit logs with filters
// @query   page, limit, action, performedBy, targetUser, startDate, endDate
// @access  Admin only
router.get("/", async (req, res) => {
  const { page, limit, action, performedBy, targetUser, startDate, endDate } = req.query;
  const result = await getAuditLogs({ page, limit, action, performedBy, targetUser, startDate, endDate });
  res.json(new ApiResponse(200, result));
});

module.exports = router;
