const mongoose = require("mongoose");

const TeleVerificationLogSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      required: true,
      index: true
    },
   // FRP-xxxx / FOT-xxxx
    applicantType: {
      type: String,
      enum: ["FleetOwner", "FranchisePartner"],
      required: true,
    },

    staffId: { type: String, required: true },         // kyc_staff_001
    handledByName: { type: String, default: "" },      // Optional: UI convenience

    callDate: { type: Date, default: Date.now },       // When call happened

    // Call info
    callStatus: {
      type: String,
      enum: ["not_called", "verified", "mismatch", "cannot_reach"],
      default: "not_called",
    },
    durationMinutes: { type: Number },

    // Personal verification
    nameVerified: { type: Boolean, default: false },
    addressVerified: { type: Boolean, default: false },
    ageVerified: { type: Boolean, default: false },
    employmentStatus: { type: String, default: "" },

    // Business verification
    businessTypeVerified: { type: Boolean, default: false },
    businessAddressVerified: { type: Boolean, default: false },
    natureOfOperation: { type: String, default: "" },
    yearsExperience: { type: String, default: "" },
    previousLogistics: { type: Boolean, default: false },

    // Service expectations
    serviceExpectationsNotes: { type: String, default: "" },
    expectedVolume: { type: String, default: "" },
    applicantQuestions: { type: String, default: "" },

    // Red flags
    infoInconsistent: { type: Boolean, default: false },
    suspiciousResponses: { type: Boolean, default: false },
    communicationBarrier: { type: Boolean, default: false },
    incompleteInfo: { type: Boolean, default: false },

    // Final decision
    decision: {
      type: String,
      enum: ["", "approve", "reject", "on_hold"],
      default: "",
    },
    decisionReason: { type: String, default: "" },
    detailedNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeleVerificationLog", TeleVerificationLogSchema);