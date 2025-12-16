const mongoose = require("mongoose");
const crypto = require("crypto");
const FleetOwner = require("../models/Fleetowner");
const FranchisePartner = require("../models/FranchiseRegestriationSchema");
const TeleVerificationLog = require("../models/TeleVerificationLog");
const FieldVerification = require("../models/FieldVerificationSchema");
const AdminReview = require("../models/AdminReview");
const AdminAuditLog = require("../models/AdminAuditLog");
const User = require("../models/User");
const { sendEmail } = require("../utils/sendEmail");

// Check if application is ready for admin approval
async function isApplicationReady(applicationNumber) {
  const tele = await TeleVerificationLog.findOne({ applicationNumber });
  const field = await FieldVerification.findOne({ applicationNumber });

  if (!tele || tele.callStatus !== "verified") return false;
  if (!field || field.applicationStatus !== "field_verification_complete") return false;

  return true;
}

// Generate password reset token
function generateResetToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return {
    rawToken,
    hashedToken,
    expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
}

/* ======================================================
   APPROVE APPLICATION & CREATE USER
====================================================== */

exports.approveApplication = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { applicationNumber, complianceNotes } = req.body;
    const admin = req.user;

    const application =
      (await FleetOwner.findOne({ applicationNumber }).session(session)) ||
      (await FranchisePartner.findOne({ applicationNumber }).session(session));

    if (!application) throw new Error("Application not found");
    if (application.status === "Approved")
      throw new Error("Application already approved");

    const ready = await isApplicationReady(applicationNumber);
    if (!ready)
      throw new Error("Application not ready for admin approval");

    // ---- Generate reset token ----
    const { rawToken, hashedToken, expiry } = generateResetToken();

    // ---- Create user ----
    const user = await User.create(
      [
        {
          name: application.fullName,
          email: application.email,
          mobile: application.mobile,
          role: "PARTNER",
          partnerType: application.partnerType,
          applicationNumber,
          status: "ACTIVE",
          resetPasswordToken: hashedToken,
          resetPasswordExpiry: expiry,
        },
      ],
      { session }
    );

    // ---- Admin review ----
    await AdminReview.create(
      [
        {
          applicationNumber,
          assignedAdmin: {
            adminId: admin.id,
            name: admin.name,
          },
          finalDecision: { status: "APPROVED" },
          complianceNotes,
          approvedAt: new Date(),
        },
      ],
      { session }
    );

    // ---- Update application ----
    application.status = "Approved";
    application.userId = user[0]._id;
    await application.save({ session });

    // ---- Audit log ----
    await AdminAuditLog.create(
      [
        {
          adminId: admin.id,
          action: "APPROVE_APPLICATION",
          applicationNumber,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    /* ---------- EMAIL (OUTSIDE TRANSACTION) ---------- */

    const activationLink = `${process.env.FRONTEND_URL}/set-password/${rawToken}`;

    await sendEmail({
      to: application.email,
      subject: "Welcome to RILogistics – Account Activation",
      html: `
        <p>Hello <b>${application.fullName}</b>,</p>

        <p>Your RILogistics partner account has been <b>approved</b>.</p>

        <p><b>User ID:</b> ${user[0]._id}</p>
        <p><b>Account Type:</b> ${application.partnerType}</p>

        <p>Click the button below to set your password (valid for 24 hours):</p>

        <p>
          <a href="${activationLink}"
             style="display:inline-block;padding:12px 18px;
                    background:#0f172a;color:#fff;
                    text-decoration:none;border-radius:6px;">
            Activate Account
          </a>
        </p>

        <p>If the link expires, you can request a new one from login.</p>

        <br/>
        <p>— RILogistics Team</p>
      `,
    });

    res.json({
      success: true,
      message: "Application approved & activation email sent",
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

/* ======================================================
   REJECT APPLICATION
====================================================== */

exports.rejectApplication = async (req, res) => {
  try {
    const { applicationNumber, reason, details } = req.body;
    const admin = req.user;

    if (!reason)
      return res
        .status(400)
        .json({ message: "Rejection reason required" });

    const application =
      (await FleetOwner.findOne({ applicationNumber })) ||
      (await FranchisePartner.findOne({ applicationNumber }));

    if (!application)
      return res.status(404).json({ message: "Application not found" });

    if (application.status === "APPROVED")
      return res
        .status(400)
        .json({ message: "Approved application cannot be rejected" });

    await AdminReview.create({
      applicationNumber,
      assignedAdmin: {
        adminId: admin.id,
        name: admin.name,
      },
      finalDecision: {
        status: "REJECTED",
        reason,
        details,
      },
      rejectedAt: new Date(),
    });

    application.status = "REJECTED";
    await application.save();

    await AdminAuditLog.create({
      adminId: admin.id,
      action: "REJECT_APPLICATION",
      applicationNumber,
    });

    await sendEmail({
      to: application.email,
      subject: "RILogistics Application Status – Rejected",
      html: `
        <p>Hello <b>${application.fullName}</b>,</p>

        <p>We regret to inform you that your application has been <b>rejected</b>.</p>

        <p><b>Reason:</b> ${reason}</p>
        ${details ? `<p><b>Details:</b> ${details}</p>` : ""}

        <p>You may appeal this decision within 30 days.</p>

        <br/>
        <p>— RILogistics Team</p>
      `,
    });

    res.json({
      success: true,
      message: "Application rejected successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
   PUT APPLICATION ON HOLD
====================================================== */

exports.holdApplication = async (req, res) => {
  try {
    const { applicationNumber, clarification, followUpDate } = req.body;
    const admin = req.user;

    if (!clarification)
      return res
        .status(400)
        .json({ message: "Clarification reason required" });

    const application =
      (await FleetOwner.findOne({ applicationNumber })) ||
      (await FranchisePartner.findOne({ applicationNumber }));

    if (!application)
      return res.status(404).json({ message: "Application not found" });

    await AdminReview.create({
      applicationNumber,
      assignedAdmin: {
        adminId: admin.id,
        name: admin.name,
      },
      finalDecision: {
        status: "ON_HOLD",
        reason: clarification,
      },
      followUpDate,
    });

    application.status = "ON_HOLD";
    await application.save();

    await AdminAuditLog.create({
      adminId: admin.id,
      action: "HOLD_APPLICATION",
      applicationNumber,
    });

    await sendEmail({
      to: application.email,
      subject: "RILogistics Application – Clarification Required",
      html: `
        <p>Hello <b>${application.fullName}</b>,</p>

        <p>Your application is currently <b>on hold</b>.</p>

        <p><b>Clarification required:</b></p>
        <p>${clarification}</p>

        ${
          followUpDate
            ? `<p><b>Expected follow-up date:</b> ${followUpDate}</p>`
            : ""
        }

        <br/>
        <p>— RILogistics Team</p>
      `,
    });

    res.json({
      success: true,
      message: "Application put on hold",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};