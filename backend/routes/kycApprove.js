const { sendEmail } = require("../utils/sendEmail");
const express = require("express");
const router = express.Router();
const FranchisePartner = require("../models/FranchiseRegestriationSchema");
const Fleetowner = require("../models/Fleetowner");
const TeleVerificationLogSchema = require('../models/TeleVerificationLog')
// STEP 3 QUEUE: Applications ready for KYC Final Approval
router.get("/kyc-approval/queue", async (req, res) => {
  try {
    const franchise = await FranchisePartner.find({ status: "Under Review" })
      .select("applicationNumber fullName mobile partnerType status");

    const fleet = await Fleetowner.find({ status: "Under Review" })
      .select("applicationNumber fullName mobile partnerType status");

    const combined = [...franchise, ...fleet];

    res.json({ success: true, applications: combined });
  } catch (error) {
    console.error("KYC approval queue error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET BY ID

router.get("/kyc-approval/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let application =
      (await FranchisePartner.findOne({ applicationNumber: id })) ||
      (await Fleetowner.findOne({ applicationNumber: id }));

    if (!application) {
      return res.json({ success: false, message: "Application not found" });
    }

    if (application.status !== "Under Review") {
      return res.json({
        success: false,
        message: "Application not ready for KYC Approval"
      });
    }

    // FETCH TELE LOG
    const tele = await TeleVerificationLogSchema.findOne({ applicationId: id }).lean();

    res.json({
      success: true,
      application,
      teleLog: tele || {},
    });
  } catch (err) {
    console.error("Get application error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// IN case Approved
router.post("/kyc-approval/approve", async (req, res) => {
  try {
    const { applicationNumber, staffId, checklist, riskLevel } = req.body;

    let app =
      (await FranchisePartner.findOne({ applicationNumber })) ||
      (await Fleetowner.findOne({ applicationNumber }));

    if (!app) {
      return res.json({ success: false, message: "Application not found" });
    }

    const ref = `KYC-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${Math.floor(10000 + Math.random() * 90000)}`;

    app.kycApproval = {
      status: "approved",
      checklist,
      riskLevel,
      approvedBy: staffId,
      kycReference: ref,
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(),
    };

    // Step update
    app.status = "Field Pending";

    await app.save();

    // 📧 SEND EMAIL TO APPLICANT
    await sendEmail({
      to: app.email,
      subject: "KYC Approved – Field Verification Next",
      html: `
        <p>Dear ${app.fullName || "Applicant"},</p>

        <p>
          We are pleased to inform you that your application ${app.applicationNumber} <strong>KYC has been approved</strong>.
        </p>

        <p>
          <strong>Next Step:</strong><br/>
          Field verification will be scheduled within <strong>24–48 hours</strong>.
        </p>

        <p>
          Please ensure you are available at your registered address.
        </p>

        <br/>
        <p>Regards,<br/>
        <strong>Admeasy Verification Team</strong></p>
      `,
    });

    res.json({
      success: true,
      message: "KYC Approved successfully",
      reference: ref,
    });
    console.log("Email send!")
  } catch (error) {
    console.error("KYC Approval error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


// IN case rejected
router.post("/kyc-approval/reject", async (req, res) => {
  try {
    const { applicationNumber, staffId, reason } = req.body;

    let app =
      (await FranchisePartner.findOne({ applicationNumber })) ||
      (await Fleetowner.findOne({ applicationNumber }));

    if (!app) return res.json({ success: false, message: "Application not found" });

    app.kycApproval = {
      status: "rejected",
      rejectionReason: reason,
      approvedBy: staffId,
      approvedAt: new Date()
    };

    app.status = "Rejected";

    await app.save();

    res.json({
      success: true,
      message: "Application rejected successfully"
    });
  } catch (err) {
    console.error("KYC Reject error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// IN case of HOLD

router.post("/kyc-approval/hold", async (req, res) => {
  try {
    const { applicationNumber, staffId, reason, escalateTo } = req.body;

    let app =
      (await FranchisePartner.findOne({ applicationNumber })) ||
      (await Fleetowner.findOne({ applicationNumber }));

    if (!app) return res.json({ success: false, message: "Application not found" });

    app.kycApproval = {
      status: "on_hold",
      holdReason: reason,
      escalatedTo: escalateTo || "admin",
      approvedBy: staffId,
      approvedAt: new Date()
    };

    app.status = "Under Review"; // stays same

    await app.save();

    res.json({
      success: true,
      message: "Application placed on hold"
    });
  } catch (err) {
    console.error("KYC Hold error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router