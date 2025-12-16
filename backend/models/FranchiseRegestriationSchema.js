const mongoose = require("mongoose");

const FranchiseRegistrationSchema = new mongoose.Schema(
  {
    // ID Of application
    applicationNumber:{type:String},
    // 1. Personal & Contact Details
   
    fullName: { type: String, required: true },
    businessName: { type: String, default: "" },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    pinCode: { type: String, required: true },

   
    // 2. Franchise & Location Details
  
    franchiseType: { type: String, required: true },
    shopSize: { type: String, required: true },
    locationType: { type: String, required: true },

    facilities: {
      type: [String],
      default: [], // Furniture, Computer/Internet, Storage Area, Signage
    },

    investmentCapacity: { type: String, required: true },
    staffCount: { type: String, required: true },
    priorExperience: { type: String, default: "" },

    // 3. Document Uploads
  
    // These will store uploaded file metadata or URLs (example: Cloudinary)
    applicantPhoto: { type: Object, default: {} },
    aadhaarCopy: { type: Object, default: {},required:true },
    panCopy: { type: Object, default: {},required:true },
    gstCertificate: { type: Object, default: {} },
    shopOwnershipDoc: { type: Object, default: {} },
    
    // 4. Bank Details

    bankName: { type: String, required: true },
    bankBranch: { type: String, required: true },
    ifsc: { type: String, required: true },
    accountHolder: { type: String, required: true },
    accountNumber: { type: String, required: true },

    // 5. Declaration

    declaration: { type: Boolean, required: true },

      //Dashboard Application tab fields
     partnerType: { type: String, default: "Franchise Partner" },
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
      applicantPhoto: { type: String, default: "uploaded" },
      aadhaarCopy: { type: String, default: "uploaded" },
      panCopy: { type: String, default: "uploaded" },
      gstCertificate: { type: String, default: "uploaded" },
      shopOwnershipDoc: { type: String, default: "uploaded" }
    },
    
    //Doc reason
    documentReason: {
      applicantPhoto: { type: String, default: "" },
      aadhaarCopy: { type: String, default: "" },
      panCopy: { type: String, default: "" },
      gstCertificate: { type: String, default: "" },
      shopOwnershipDoc: { type: String, default: "" }
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

  },
 
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FranchiseRegistration", FranchiseRegistrationSchema);