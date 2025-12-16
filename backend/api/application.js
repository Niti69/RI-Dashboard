const FleetOwner = require("../models/Fleetowner");
const FranchisePartner = require("../models/FranchiseRegestriationSchema");
const TeleVerificationLog = require("../models/TeleVerificationLog");
const fieldVerification = require("../models/FieldVerificationSchema")

exports.getAllApplications = async (req, res) => {
  try {
    const fleet = await FleetOwner.find().lean();
    const franchise = await FranchisePartner.find().lean();

    const formattedFleet = fleet.map(item => ({
      id: item.applicationNumber,
      name: item.fullName,
      mobile: item.mobile,
      type: "Fleet Owner",
      step: item.step || "Step 1",
      status: item.status || "New",
      feeCollected: item.feeStatus === "Collected",
      amount: item.feeAmount ? "₹" + item.feeAmount : "-",
      createdDate: item.createdAt?.toISOString().split("T")[0],
      sla: getSLA(item.createdAt),
    }));

    const formattedFranchise = franchise.map(item => ({
      id: item.applicationNumber,
      name: item.fullName,
      mobile: item.mobile,
      type: "Franchise Partner",
      step: item.step || "Step 1",
      status: item.status || "New",
      feeCollected: item.feeStatus === "Collected",
      amount: item.feeAmount ? "₹" + item.feeAmount : "-",
      createdDate: item.createdAt?.toISOString().split("T")[0],
      sla: getSLA(item.createdAt),
    }));

    return res.json([...formattedFleet, ...formattedFranchise]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Document Verification - Step 1 API
exports.getApplicationByNumber = async (req, res) => {
  try {
    const { id } = req.params;

    let application = await FranchisePartner
      .findOne({ applicationNumber: id })
      .lean();

    let type = "Franchise Partner";

    if (!application) {
      application = await FleetOwner
        .findOne({ applicationNumber: id })
        .lean();
      type = "Fleet Owner";
    }

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const getFileUrl = (field) => {
      if (!field) return null;
      if (typeof field === "string") return field;
      if (field.url) return field.url;
      if (field.secure_url) return field.secure_url;
      if (field.path) return field.path;
      return null;
    };

    const documents = {};

    if (type === "Fleet Owner") {
      documents.aadhaarFile = {
        url: getFileUrl(application.aadhaarFile),
        status: application.documentStatus?.aadhaarFile || "uploaded",
        reason: application.documentReason?.aadhaarFile || "",
      };

      documents.panFile = {
        url: getFileUrl(application.panFile),
        status: application.documentStatus?.panFile || "uploaded",
        reason: application.documentReason?.panFile || "",
      };

      documents.rcFile = {
        url: getFileUrl(application.rcFile),
        status: application.documentStatus?.rcFile || "uploaded",
        reason: application.documentReason?.rcFile || "",
      };

      documents.insuranceFile = {
        url: getFileUrl(application.insuranceFile),
        status: application.documentStatus?.insuranceFile || "uploaded",
        reason: application.documentReason?.insuranceFile || "",
      };

      documents.fitnessFile = {
        url: getFileUrl(application.fitnessFile),
        status: application.documentStatus?.fitnessFile || "uploaded",
        reason: application.documentReason?.fitnessFile || "",
      };
    } else {
      documents.applicantPhoto = {
        url: getFileUrl(application.applicantPhoto),
        status: application.documentStatus?.applicantPhoto || "uploaded",
        reason: application.documentReason?.applicantPhoto || "",
      };

      documents.aadhaarCopy = {
        url: getFileUrl(application.aadhaarCopy),
        status: application.documentStatus?.aadhaarCopy || "uploaded",
        reason: application.documentReason?.aadhaarCopy || "",
      };

      documents.panCopy = {
        url: getFileUrl(application.panCopy),
        status: application.documentStatus?.panCopy || "uploaded",
        reason: application.documentReason?.panCopy || "",
      };

      documents.gstCertificate = {
        url: getFileUrl(application.gstCertificate),
        status: application.documentStatus?.gstCertificate || "uploaded",
        reason: application.documentReason?.gstCertificate || "",
      };

      documents.shopOwnershipDoc = {
        url: getFileUrl(application.shopOwnershipDoc),
        status: application.documentStatus?.shopOwnershipDoc || "uploaded",
        reason: application.documentReason?.shopOwnershipDoc || "",
      };
    }

    return res.json({
      success: true,
      applicationNumber: id,
      type,
      application,
      documents,
    });

  } catch (err) {
    console.error("getApplicationByNumber error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    let app = await FleetOwner.findOne({ applicationNumber: id }).lean();
    let type = "Fleet Owner";

    if (!app) {
      app = await FranchisePartner.findOne({ applicationNumber: id }).lean();
      type = "Franchise Partner";
    }

    if (!app) {
      return res.json({ success: false, message: "Application not found" });
    }

    // ✅ FIX 1: await tele verification
    const teleData = await TeleVerificationLog
      .findOne({ applicationNumber: id })
      .lean();
    const fieldData = await fieldVerification
    .findOne({ applicationNumber: id })
    .lean();
    // Helper function
    const getFileUrl = (field) => {
      if (!field) return null;
      if (typeof field === "string") return field;
      if (field.url) return field.url;
      if (field.secure_url) return field.secure_url;
      if (field.path) return field.path;
      return null;
    };

    // Documents
    const documents = {};

    if (type === "Fleet Owner") {
      documents.aadhaarFile = {
        url: getFileUrl(app.aadhaarFile),
        status: app.documentStatus?.aadhaarFile || "uploaded",
        reason: app.documentReason?.aadhaarFile || "",
      };

      documents.panFile = {
        url: getFileUrl(app.panFile),
        status: app.documentStatus?.panFile || "uploaded",
        reason: app.documentReason?.panFile || "",
      };

      documents.rcFile = {
        url: getFileUrl(app.rcFile),
        status: app.documentStatus?.rcFile || "uploaded",
        reason: app.documentReason?.rcFile || "",
      };

      documents.insuranceFile = {
        url: getFileUrl(app.insuranceFile),
        status: app.documentStatus?.insuranceFile || "uploaded",
        reason: app.documentReason?.insuranceFile || "",
      };

      documents.fitnessFile = {
        url: getFileUrl(app.fitnessFile),
        status: app.documentStatus?.fitnessFile || "uploaded",
        reason: app.documentReason?.fitnessFile || "",
      };
    } 
    else {
      documents.applicantPhoto = {
        url: getFileUrl(app.applicantPhoto),
        status: app.documentStatus?.applicantPhoto || "uploaded",
        reason: app.documentReason?.applicantPhoto || "",
      };

      documents.aadhaarCopy = {
        url: getFileUrl(app.aadhaarCopy),
        status: app.documentStatus?.aadhaarCopy || "uploaded",
        reason: app.documentReason?.aadhaarCopy || "",
      };

      documents.panCopy = {
        url: getFileUrl(app.panCopy),
        status: app.documentStatus?.panCopy || "uploaded",
        reason: app.documentReason?.panCopy || "",
      };

      documents.gstCertificate = {
        url: getFileUrl(app.gstCertificate),
        status: app.documentStatus?.gstCertificate || "uploaded",
        reason: app.documentReason?.gstCertificate || "",
      };

      documents.shopOwnershipDoc = {
        url: getFileUrl(app.shopOwnershipDoc),
        status: app.documentStatus?.shopOwnershipDoc || "uploaded",
        reason: app.documentReason?.shopOwnershipDoc || "",
      };
    }

    // ✅ Clean admin-friendly response
    return res.json({
      success: true,
      applicationNumber: id,
      type,
      application: app,
      teleVerification: teleData || null,
      fieldVerificationData:fieldData || null,
      documents,
    });

  } catch (err) {
    console.error("getApplicationById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateDocumentStatus = async (req, res) => {
    try {
        const { applicationId, documentId, status, reason } = req.body;

        if (!applicationId || !documentId || !status) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // Find application
        let app = await FleetOwner.findOne({ applicationNumber: applicationId }) 
               || await FranchisePartner.findOne({ applicationNumber: applicationId });

        if (!app) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        // Valid doc IDs
        const fleetOwnerDocs = ["aadhaarFile", "panFile", "rcFile", "insuranceFile", "fitnessFile"];
        const franchiseDocs = ["applicantPhoto", "aadhaarCopy", "panCopy", "gstCertificate", "shopOwnershipDoc"];

        const validDocIds = app.trucks ? fleetOwnerDocs : franchiseDocs;

        if (!validDocIds.includes(documentId)) {
            return res.status(400).json({
                success: false,
                message: `Invalid documentId: ${documentId}`
            });
        }

        // Valid statuses
        const validStatuses = ["uploaded", "verified", "rejected", "requires_action"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid document status"
            });
        }

        // Reason is required only for rejected or requires_action
        if ((status === "rejected" || status === "requires_action") && !reason?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Reason required"
            });
        }

        // Ensure JSON fields exist
        if (!app.documentStatus) app.documentStatus = {};
        if (!app.documentReason) app.documentReason = {};

        // Update document fields
        app.documentStatus[documentId] = status;

        if (status === "rejected" || status === "requires_action") {
            app.documentReason[documentId] = reason.trim();
        } else {
            app.documentReason[documentId] = "";
        }

        app.markModified("documentStatus");
        app.markModified("documentReason");

        await app.save();

        // 🚨 MOST IMPORTANT: NO STATUS UPDATE ANYWHERE
        // NOTHING touches app.status

        return res.json({
            success: true,
            message: "Document updated",
            documentId,
            status,
            reason: app.documentReason[documentId],
            documentStatus: app.documentStatus
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.requestDocuments = async (req, res) => {
    try {
        const { applicationId, documents, reason } = req.body;

        if (!reason?.trim()) {
            return res.json({ success: false, message: "Reason required" });
        }

        // FIXED: Use applicationNumber instead of _id
        let app = await FleetOwner.findOne({ applicationNumber: applicationId });

        if (!app) {
            app = await FranchisePartner.findOne({ applicationNumber: applicationId });
        }

        if (!app) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        // Initialize objects if they don't exist
        if (!app.documentStatus) app.documentStatus = {};
        if (!app.documentReason) app.documentReason = {};

        documents.forEach(doc => {
            app.documentStatus[doc] = "requires_action";
            app.documentReason[doc] = reason;
        });

        // Mark as modified for nested objects
        app.markModified('documentStatus');
        app.markModified('documentReason');

        app.status = "In KYC";
        await app.save();

        return res.json({ success: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.completeStep1 = async (req, res) => {
    try {
        const { applicationId } = req.body;

        let app = await FleetOwner.findOne({ applicationNumber: applicationId });

        if (!app) {
            app = await FranchisePartner.findOne({ applicationNumber: applicationId });
        }

        if (!app) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        app.step = "Step 2";
        app.status = "Tele Verification";
        await app.save();

        return res.json({ success: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationNumber, status } = req.body;

    // Optional: Add validation for valid status values
    const validStatuses = ["New", "In Kyc", "Tele Verification", "Field Pending", "Under Review", "Approved", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    let updated = await FleetOwner.findOneAndUpdate(
      { applicationNumber: applicationNumber },
      { status },
      { new: true }
    );

    if (!updated) {
      updated = await FranchisePartner.findOneAndUpdate(
        { applicationNumber: applicationNumber },
        { status },
        { new: true }
      );
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: "Application not found" }); 
    }

    return res.json({ success: true, updated });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message }); 
  }
};

function getSLA(date) {
  const diff = (new Date() - new Date(date)) / (1000 * 60 * 60 * 24);
  if (diff <= 1) return "green";
  if (diff <= 2) return "orange";
  return "red";
}

// Tele Verification
// GET /api/tele/log/:id

exports.getTeleApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id)
        let app = await FleetOwner.findOne({ applicationNumber: id }).lean();
        let type = "Fleet Owner";

        if (!app) {
            app = await FranchisePartner.findOne({ applicationNumber: id }).lean();
            type = "Franchise Partner";
        }

        if (!app) {
            return res.json({ success: false, message: "Application not found" });
        }

        console.log("Raw app data from DB:", app); // Debug log

        // Helper function to extract URL from various formats
        const getFileUrl = (field) => {
            if (!field) return null;
            if (typeof field === 'string') return field;
            if (field.url) return field.url;
            if (field.secure_url) return field.secure_url;
            if (field.path) return field.path;
            return null;
        };

        // Build unified document structure
        const documents = {};

        if (type === "Fleet Owner") {
            documents.aadhaarFile = {
                url: getFileUrl(app.aadhaarFile),
                status: app.documentStatus?.aadhaarFile || "uploaded",
                reason: app.documentReason?.aadhaarFile || ""
            };

            documents.panFile = {
                url: getFileUrl(app.panFile),
                status: app.documentStatus?.panFile || "uploaded",
                reason: app.documentReason?.panFile || ""
            };

            documents.rcFile = {
                url: getFileUrl(app.rcFile),
                status: app.documentStatus?.rcFile || "uploaded",
                reason: app.documentReason?.rcFile || ""
            };

            documents.insuranceFile = {
                url: getFileUrl(app.insuranceFile),
                status: app.documentStatus?.insuranceFile || "uploaded",
                reason: app.documentReason?.insuranceFile || ""
            };

            documents.fitnessFile = {
                url: getFileUrl(app.fitnessFile),
                status: app.documentStatus?.fitnessFile || "uploaded",
                reason: app.documentReason?.fitnessFile || ""
            };

        } else {
            documents.applicantPhoto = {
                url: getFileUrl(app.applicantPhoto),
                status: app.documentStatus?.applicantPhoto || "uploaded",
                reason: app.documentReason?.applicantPhoto || ""
            };

            documents.aadhaarCopy = {
                url: getFileUrl(app.aadhaarCopy),
                status: app.documentStatus?.aadhaarCopy || "uploaded",
                reason: app.documentReason?.aadhaarCopy || ""
            };

            documents.panCopy = {
                url: getFileUrl(app.panCopy),
                status: app.documentStatus?.panCopy || "uploaded",
                reason: app.documentReason?.panCopy || ""
            };

            documents.gstCertificate = {
                url: getFileUrl(app.gstCertificate),
                status: app.documentStatus?.gstCertificate || "uploaded",
                reason: app.documentReason?.gstCertificate || ""
            };

            documents.shopOwnershipDoc = {
                url: getFileUrl(app.shopOwnershipDoc),
                status: app.documentStatus?.shopOwnershipDoc || "uploaded",
                reason: app.documentReason?.shopOwnershipDoc || ""
            };
        }

        console.log("Formatted documents:", documents); // Debug log

        return res.json({
            success: true,
            id,
            type,
            data: {
                ...app,
                documents
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
};



// id = applicationNumber (same as used in /api/application/:id)

exports.getTeleLogByApplicationId = async (req, res) => {
  try {
    const { id } = req.params;
    
    let app = await FleetOwner.findOne({ applicationNumber: id });

    if (!app) {
      app = await FranchisePartner.findOne({ applicationNumber: id });
    }

     if (!app) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.json({
      success: true,
      app:app|| null,
    });

  } catch (err) {
    console.error("Error loading tele log:", err);
    res.status(500).json({ success: false });
  }
};


// POST /api/tele/submit
// 🔥 FIXED VERSION
exports.saveTeleVerification = async (req, res) => {
  try {
    const { applicationId, staffId, formData } = req.body;

    if (!applicationId || !staffId || !formData) {
      return res.status(400).json({
        success: false,
        message: "Missing applicationId, staffId, or formData",
      });
    }

    // 1️⃣ Find application
    // Note: applicationId from frontend = applicationNumber in database
    let app = await FleetOwner.findOne({ applicationNumber: applicationId });

    if (!app) {
      app = await FranchisePartner.findOne({ applicationNumber: applicationId });
    }

    if (!app) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // 2️⃣ Detect applicant type
    const applicantType = app.constructor.modelName === "FranchisePartner"
      ? "FranchisePartner"
      : "FleetOwner";

    // 3️⃣ Save Tele-Verification log
    // Note: Schema field name is 'applicationNumber'
    await TeleVerificationLog.create({
      applicationNumber: applicationId, // applicationId maps to schema's applicationNumber field
      staffId,
      applicantType,
      ...formData,
    });

    // 4️⃣ Update application status based on decision
    if (formData.decision === "approve") {
      app.step = "Step 3";
      app.status = "Under Review";
    } else if (formData.decision === "reject") {
      app.status = "Rejected";
    } else if (formData.decision === "on_hold") {
      app.status = "Field Pending";
    }

    await app.save();

    return res.json({
      success: true,
      message: "Tele-verification saved successfully",
      newStatus: app.status,
      step: app.step,
    });
  } catch (err) {
    console.error("Save Tele Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};