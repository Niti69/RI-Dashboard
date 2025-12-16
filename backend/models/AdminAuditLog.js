// models/AdminAuditLog.js
const mongoose = require("mongoose");

const adminAuditLogSchema = new mongoose.Schema(
  {
    adminId: { type: String, required: true },
    action: {
      type: String,
      enum: [
        "APPROVE_APPLICATION",
        "REJECT_APPLICATION",
        "HOLD_APPLICATION",
      ],
      required: true,
    },
    applicationNumber: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminAuditLog", adminAuditLogSchema);