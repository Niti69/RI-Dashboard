const express = require("express");
const router = express.Router();
const auth = require('../Middleware/authMiddleware')
const {
  approveApplication,
  rejectApplication,
  holdApplication,
} = require("../controller/adminReview");

router.post("/admin/approve",auth, approveApplication);
router.post("/admin/reject",auth, rejectApplication);
router.post("/admin/hold",auth, holdApplication);

module.exports = router;