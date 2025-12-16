const express = require("express");
const router = express.Router();
const upload = require("../Middleware/multer");  
const { registerFranchise } = require("../controller/franchisePartner");

router.post(
  "/register",
  upload.any(),
  registerFranchise
);

module.exports = router;