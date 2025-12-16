// models/AdminReview.js
const mongoose = require("mongoose");

const adminReviewSchema = new mongoose.Schema(
  {
    applicationNumber: { type: String, required: true, index: true },

    assignedAdmin: {
      adminId: String,
      name: String,
    },

    finalDecision: {
      status: {
        type: String,
        enum: ["APPROVED", "REJECTED", "ON_HOLD"],
        required: true,
      },
      reason: String,
      details: String,
    },

    complianceNotes: String,
    followUpDate: Date,

    approvedAt: Date,
    rejectedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminReview", adminReviewSchema);
