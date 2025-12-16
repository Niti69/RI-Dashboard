const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    /* ================= BASIC IDENTITY ================= */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      trim: true,
    },

    /* ================= AUTH ================= */

    // Password is NOT required at creation
    // Will be set after activation
    password: {
      type: String,
      minlength: 8,
    },

    resetPasswordToken: {
      type: String,
      index: true,
    },

    resetPasswordExpiry: {
      type: Date,
    },

    /* ================= ROLE & ACCESS ================= */

    role: {
      type: String,
      enum: [
        "PARTNER",
        "Broker",
        "Vehicle Owner",
        "Driver",
        "Shipper",
        "Admin",
        "Verification Team",
        "Field RM",
        "Support Staff",
      ],
      required: true,
    },

    partnerType: {
      type: String,
      enum: ["Fleet Owner", "Franchise Partner"],
    },

    applicationNumber: {
      type: String,
      index: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "DISABLED"],
      default: "ACTIVE",
    },

    /* ================= SECURITY FLAGS ================= */

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isFirstLogin: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);