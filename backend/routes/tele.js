const express = require("express");
const router = express.Router();

const {
  getAllApplications,
  getApplicationById,
  getTeleLogByApplicationId,
  saveTeleVerification,
} = require("../api/application");

// NEW:
router.get("/tele/log/:id", getTeleLogByApplicationId);
router.post("/tele/submit", saveTeleVerification);

module.exports = router;