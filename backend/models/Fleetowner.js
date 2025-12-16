const mongoose = require("mongoose");

const TruckSchema = new mongoose.Schema({
  type: {
    type: String,
  },
  regNumber: {
    type: String,
  },
  capacity: {
    type: String, // frontend sends string "32"
  },
  photos: {
    type: [mongoose.Schema.Types.Mixed], 
    default: [], // frontend sends [{}]
  },
});

const FleetownerSchema = new mongoose.Schema(
  {
    fullName: { type: String },
    mobile: { type: String },
    email: { type: String },
    address: { type: String },

    // KYC
    aadhaar: { type: String },
    pan: { type: String },
    gst: { type: String },

    // Bank
    bankName: { type: String },
    ifsc: { type: String },
    accountNumber: { type: String },
    accountHolder: { type: String },

    // Files (frontend sends {})
    aadhaarFile: { type: mongoose.Schema.Types.Mixed },
    panFile: { type: mongoose.Schema.Types.Mixed },
    rcFile: { type: mongoose.Schema.Types.Mixed },
    insuranceFile: { type: mongoose.Schema.Types.Mixed },
    fitnessFile: { type: mongoose.Schema.Types.Mixed },

    // Trucks
    trucksCount: { type: Number },
    trucks: [TruckSchema],

    // Agreement
    agree: { type: Boolean },

    // Auto number (optional)
    applicationNumber: { type: String },

    //Dashboard Application tab fields
     partnerType: { type: String, default: "Fleet Owner" },
    feeStatus: { type: String, default: "Pending" },
    feeAmount: { type: Number, default: 10000 },

    // Status
      status: {
      type: String,
      enum: ["New","In Kyc", "Tele Verification","Field Pending","Field Verified — Under Admin Review","Under Review","Approved", "Rejected"],
      default: "New",
    },

    // Doc status
    documentStatus: {
        aadhaarFile: { type: String, default: "uploaded" },
        panFile: { type: String, default: "uploaded" },
        rcFile: { type: String, default: "uploaded" },
        insuranceFile: { type: String, default: "uploaded" },
        fitnessFile: { type: String, default: "uploaded" }
    },
    // Doc reason
    documentReason: {
      aadhaarFile: { type: String, default: "" },
      panFile: { type: String, default: "" },
      rcFile: { type: String, default: "" },
      insuranceFile: { type: String, default: "" },
      fitnessFile: { type: String, default: "" }
    },
    // STPE 3 Kyc approval
    kycApproval: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected", "on_hold"],
        default: "pending"
      },

      checklist: {
        identity: { type: Boolean, default: false },
        address: { type: Boolean, default: false },
        business: { type: Boolean, default: false },
        fleet: { type: Boolean, default: false },
        bank: { type: Boolean, default: false },
        blacklist: { type: Boolean, default: false },
        consent: { type: Boolean, default: false }
      },

      riskLevel: { type: String, default: "LOW" },

      approvedBy: { type: String, default: "" },
      kycReference: { type: String, default: "" },
      validUntil: { type: Date, default: null },

      rejectionReason: { type: String, default: "" },
      holdReason: { type: String, default: "" },
      escalatedTo: { type: String, default: "" },

      approvedAt: { type: Date }
    },
    // Field Verification (Step 4)
    fieldAssignedTo: { type: String, default: null },

    fieldVisitStatus: {
      type: String,
      enum: [
        "Field Pending",
        "Field Visit Scheduled",
        "Field Verification In Progress",
        "Field Verified",
        "Field Verified With Issues",
        "Field Verification Failed",
        "Field Verification Complete – Under Admin Review"
      ],
      default: "Field Pending"
    },

    // Step 5 - Fee Collection
    feeCollection: {
      amount: { type: Number, default: 0 },
      mode: { type: String, default: null },
      transactionId: { type: String, default: null },
      paymentProof: { type: Object, default: {} },
      agreementSigned: { type: Boolean, default: false }
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fleetowner", FleetownerSchema);