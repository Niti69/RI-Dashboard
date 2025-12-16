const express = require("express");
const router = express.Router();
const upload = require("../Middleware/multer");
const { registerFleetOwner } = require("../controller/fleetownerController");

router.post(
  "/register",
  upload.any(),
  registerFleetOwner
);
module.exports = router;