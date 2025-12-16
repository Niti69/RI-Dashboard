const express = require("express");
const router = express.Router();
const {createStaff,generateStaffId,getAllStaff,toggleStaffStatus,getStaffById, } = require("../controller/staff.controller");
const staffAuth = require("../Middleware/StaffAuth");
const allowRoles = require("../Middleware/allowRoles");
// Only SUPER_ADMIN / ADMIN can create staff
router.post(
  "/create",
  staffAuth,
  allowRoles("SUPER_ADMIN", "ADMIN"),
  createStaff
);


// Only SUPER_ADMIN / ADMIN can generate staff IDs

router.post(
  "/generate-id",
    staffAuth,
    allowRoles("SUPER_ADMIN", "ADMIN"),
     generateStaffId
);

// STAFF LIST
router.get(
  "/",
  staffAuth,
  allowRoles("SUPER_ADMIN", "ADMIN"),
  getAllStaff
);

// TOGGLE STATUS
router.patch(
  "/:id/status",
  staffAuth,
  allowRoles("SUPER_ADMIN", "ADMIN"),
  toggleStaffStatus
);
// routes/staff.js
router.get(
  "/:id",
  staffAuth,
  allowRoles(
    "SUPER_ADMIN",
    "ADMIN",
    "KYC_STAFF",
    "TELE_VERIFICATION",
    "FIELD_RM",
    "SUPPORT"
  ),
  getStaffById
);


module.exports = router;