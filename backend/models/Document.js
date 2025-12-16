const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
    },

    // Example: "aadhaar_front", "pan_card", "rc_vehicle", etc.
    documentType: {
      type: String,
      required: true,
    },

    displayName: {
      type: String,
      required: true,
    },

    category: {
      type: String, 
      enum: ["identity", "address", "business", "fleet", "bank"],
      required: true,
    },

    fileUrl: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["not_uploaded", "uploaded", "verified", "requires_action", "rejected", "not_required"],
      default: "uploaded",
    },

    reason: {
      type: String,
      default: null,
    },

    reviewedBy: {
      type: String,
      default: null,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", DocumentSchema);