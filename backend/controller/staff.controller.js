const Staff = require("../models/Staff");
const bcrypt = require("bcryptjs");

/**
 * POST /api/staff/create
 * Only SUPER_ADMIN / ADMIN should be allowed (middleware)
 */
 const createStaff = async (req, res) => {
  try {
    const {
      staffCode,
      name,
      userId,
      email,
      mobile,
      password,
      role,
      district,
      status,
    } = req.body;

    // -----------------------------
    // 1. BASIC VALIDATION
    // -----------------------------
    if (!staffCode || !name || !userId || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // -----------------------------
    // 2. ROLE VALIDATION
    // -----------------------------
    const allowedRoles = [
      "SUPER_ADMIN",
      "ADMIN",
      "KYC_STAFF",
      "TELE_VERIFICATION",
      "FIELD_RM",
      "SUPPORT",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // -----------------------------
    // 3. DUPLICATE CHECKS
    // -----------------------------
    const existingStaff = await Staff.findOne({
      $or: [{ staffCode }, { userId }],
    });

    if (existingStaff) {
      return res.status(409).json({
        success: false,
        message: "Staff with same ID already exists",
      });
    }

    // -----------------------------
    // 4. HASH PASSWORD
    // -----------------------------
    const hashedPassword = await bcrypt.hash(password, 10);

    // -----------------------------
    // 5. CREATE STAFF
    // -----------------------------
    const staff = await Staff.create({
      staffCode,
      name,
      userId: userId.toUpperCase(),
      email,
      mobile,
      password: hashedPassword,
      role,
      district,
      status: status || "ACTIVE",
      isFirstLogin: true,
      createdBy: req.staff?._id || null, // set by auth middleware
    });

    // -----------------------------
    // 6. RESPONSE (NO PASSWORD)
    // -----------------------------
    return res.status(201).json({
      success: true,
      message: "Staff created successfully",
      data: {
        id: staff._id,
        staffCode: staff.staffCode,
        name: staff.name,
        userId: staff.userId,
        role: staff.role,
        status: staff.status,
      },
    });
  } catch (error) {
    console.error("CREATE STAFF ERROR:", error);

    // Mongo duplicate key fallback
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Staff ID or User ID already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating staff",
    });
  }
};

// Create Staff ID

const generateStaffId = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    // Safety: allow only valid roles
    const allowedRoles = [
      "SUPER_ADMIN",
      "ADMIN",
      "KYC_STAFF",
      "TELE_VERIFICATION",
      "FIELD_RM",
      "SUPPORT",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Find last staffCode for this role
    // Example: KYC_STAFF_007
    const lastStaff = await Staff.findOne({
      staffCode: { $regex: `^${role}_` },
    })
      .sort({ createdAt: -1 })
      .lean();

    let nextNumber = 1;

    if (lastStaff?.staffCode) {
      const parts = lastStaff.staffCode.split("_");
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) {
        nextNumber = lastNum + 1;
      }
    }

    const staffId = `${role}_${String(nextNumber).padStart(3, "0")}`;

    return res.json({
      success: true,
      userId: staffId,
    });
  } catch (error) {
    console.error("GENERATE STAFF ID ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate staff ID",
    });
  }
};

const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: staff,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff",
    });
  }
};
const toggleStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    staff.status =
      staff.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    await staff.save();

    res.json({
      success: true,
      message: "Status updated",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update status",
    });
  }
};

// controller/createStaff.controller.js
const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findById(id).select("-password");

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    res.json({
      success: true,
      data: staff,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff profile",
    });
  }
};


module.exports = {
  createStaff,
  generateStaffId,
  getAllStaff,
  toggleStaffStatus,
  getStaffById,
};