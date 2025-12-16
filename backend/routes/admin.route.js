const express = require("express");
const router = express.Router();
const staffAuth = require("../middleware/StaffAuth");
const adminOnly = require("../middleware/adminOnly");

const { createStaff } = require("../controller/admin.controller");

router.post("/staff", staffAuth, adminOnly, createStaff);

module.exports = router;
