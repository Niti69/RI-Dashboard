const express = require("express");
const router = express.Router();

const getDashboardStats = require("../api/dashboard-stats");

router.get("/dashboard-stats", getDashboardStats);

module.exports = router;