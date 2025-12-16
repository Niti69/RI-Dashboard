  const mongoose = require("mongoose");

  // ---------------- VEHICLE SUB-SCHEMA ----------------
  const VehicleSchema = new mongoose.Schema({
    registrationNumber: String,
    vehicleType: String,
    colorMake: String,

    photoFront: String,
    photoSide: String,
    photoRear: String,
    photoPlate: String,

    rcMatch: { type: Boolean, default: null },
    insuranceVerified: { type: Boolean, default: null },

    verificationStatus: {
      type: String,
      enum: ["verified", "not_verified", ""],
      default: "",
    },
  });

  // ---------------- FEE DATA SUB-SCHEMA ----------------
  const FeeDataSchema = new mongoose.Schema({
    standardFee: { type: Number, default: 5000 },
    amountCollected: String,
    paymentMode: String,
    paymentReference: String,
    receiptNumber: String,
    paymentEvidenceUrl: String,

    agreementSigned: { type: Boolean, default: false },
    applicantConfirmed: { type: Boolean, default: false },
    termsAccepted: { type: Boolean, default: false },

    staffSignature: String,
  });

  // ---------------- FIELD VERIFICATION MAIN SCHEMA ----------------
  const FieldVerificationSchema = new mongoose.Schema(
    {
      // VERY IMPORTANT: STRING type (NO ObjectId)
      applicationNumber: {
        type: String,
        required: true,
        index: true
      },

      staffId: {  
        type: String,   // ← FIXED
      },
      // VISIT DETAILS
      scheduledDate: String,
      scheduledTime: String,

      gpsLocation: {
        latitude: String,
        longitude: String,
        accuracy: String,
        capturedAt: Date,
      },

      // BASIC CHECKS
      addressExists: Boolean,
      businessSignVisible: Boolean,
      applicantPresent: Boolean,

      personMetName: String,
      staffCount: Number,

      businessOperatingStatus: String,
      operatingHours: String,

      counterDisplayArea: Boolean,
      seatingForCustomers: Boolean,
      itSetupComputer: Boolean,
      itSetupInternet: Boolean,
      signagePresent: Boolean,

      warehouseSize: String,
      storageCapacity: String,

      parkingArea: Boolean,
      safetyEquipment: Boolean,
      cleanlinessRating: String,

      interviewSummary: String,
      applicantDemeanor: String,
      businessClarity: String,

      addressAuthenticity: String,
      businessLegitimacy: String,
      applicantCredibility: String,
      neighborhoodSafety: String,

      unlicensedOperation: Boolean,
      cashHeavyOperations: Boolean,
      illegalActivitySigns: Boolean,

      redFlags: [String],
      redFlagDetails: String,

      verificationResult: String,
      resultNotes: String,

      // PHOTOS
      photoExterior: String,
      photoInterior: String,
      photoWarehouse: String,
      photoVehicle1: String,
      photoVehicle2: String,
      photoLicense: String,

      // VEHICLE LIST
      vehicleData: [VehicleSchema],

      // FEE DETAILS
      feeData: FeeDataSchema,

      applicationStatus: {
        type: String,
        enum: [
          "field_verification_in_progress",
          "field_verification_complete",
          "field_verification_failed",
        ],
        default: "field_verification_in_progress",
      },
    },
    { timestamps: true }
  );

  // IMPORTANT — disable ObjectId casting for these fields
  FieldVerificationSchema.path("applicationNumber").cast(false);
  FieldVerificationSchema.path("staffId").cast(false);

  module.exports =
    mongoose.models.FieldVerification ||
    mongoose.model("FieldVerification", FieldVerificationSchema);