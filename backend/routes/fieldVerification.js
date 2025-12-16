const express = require("express");
const router = express.Router();
const upload = require("../Middleware/multer");
const { sendEmail } = require("../utils/sendEmail");
const FieldVerification = require("../models/FieldVerificationSchema");
const Franchise = require("../models/FranchiseRegestriationSchema");
const Fleetowner = require("../models/Fleetowner");

const { submitFieldVerification } = require("../controller/fieldVerification");


// ------------------------------------------------------
// UNIVERSAL FIND APPLICATION BY applicationNumber
// ------------------------------------------------------
async function findApplication(applicationNumber) {
  const [franchise, fleet] = await Promise.all([
    Franchise.findOne({ applicationNumber }),
    Fleetowner.findOne({ applicationNumber }),
  ]);

  return franchise || fleet;
}


// ------------------------------------------------------
// CREATE FIELD VERIFICATION RECORD
// ------------------------------------------------------
router.post("/field-verification/create", async (req, res) => {
  try {
    const { applicationId, staffId, applicationType } = req.body;

    const app = await findApplication(applicationId);
    if (!app)
      return res.status(404).json({ success: false, msg: "Application not found" });

    // already exists
    let existing = await FieldVerification.findOne({ applicationId });
    if (existing) return res.json({ success: true, data: existing });

    const record = await FieldVerification.create({
      applicationId, // stored as applicationNumber
      applicationType,
      staffId,
    });

    app.fieldVisitStatus = "Field Pending";
    await app.save();

    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
});


// ------------------------------------------------------
// SCHEDULE VISIT
// ------------------------------------------------------
router.post("/field-verification/schedule", async (req, res) => {
  try {
    const { applicationNumber, scheduledDate, scheduledTime, staffId } = req.body;

    // 1. Save visit schedule
    const record = await FieldVerification.findOneAndUpdate(
      { applicationNumber },
      {
        scheduledDate,
        scheduledTime,
        staffId,
        fieldVisitStatus: "Scheduled",
      },
      { new: true, upsert: true }
    );

    // 2. Get applicant
    const app = await findApplication(applicationNumber);
    if (!app) {
      return res.status(404).json({ msg: "Application not found" });
    }

    app.fieldVisitStatus = "Field Visit Scheduled";
    await app.save();
    console.log(app.email)
    // 3. Send Email
    await sendEmail({
          to: app.email,
          subject: "Field Visit Scheduled",
          html: `
            <p>Dear ${app.fullName || "Applicant"},</p>
        <p>Your field verification visit has been scheduled.</p>
        <p><strong>Date:</strong> ${scheduledDate}</p>
        <p><strong>Time:</strong> ${scheduledTime}</p>
        <p>Please be available at your business address.</p>
        <br/>
        <p>Regards,<br/>Verification Team</p>
          `,
        });

    res.json({ success: true, data: record });
    console.log("Email sent!")
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
});


// ------------------------------------------------------
// STORE GPS LOCATION
// ------------------------------------------------------
router.post("/field-verification/gps", async (req, res) => {
  try {
    const { applicationId, latitude, longitude, accuracy } = req.body;

    const record = await FieldVerification.findOneAndUpdate(
      { applicationId },
      {
        gpsLocation: {
          latitude,
          longitude,
          accuracy,
          capturedAt: new Date(),
        },
      },
      { new: true }
    );

    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
});


// ------------------------------------------------------
// MAIN SUBMISSION ROUTE (ALL FORM DATA + FILES)
// ------------------------------------------------------
router.post(
  "/field-verification/submit",
  upload.any(), // all files accepted
  submitFieldVerification
);


// ------------------------------------------------------
// GET FIELD VERIFICATION RECORD
// ------------------------------------------------------
router.get("/field-verification/:applicationId", async (req, res) => {
  try {
    const record = await FieldVerification.findOne({
      applicationId: req.params.applicationId,
    });

    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
});


// ------------------------------------------------------
// FRONTEND APPLICATION LOADER
// ------------------------------------------------------
router.get("/applications/:id", async (req, res) => {
  try {
    const id = req.params.id;

    let app = await Fleetowner.findOne({ applicationNumber: id }).lean();
    if (app)
      return res.json({
        success: true,
        data: { ...app, applicationType: "FleetOwner" },
      });

    app = await Franchise.findOne({ applicationNumber: id }).lean();
    if (app)
      return res.json({
        success: true,
        data: { ...app, applicationType: "FranchisePartner" },
      });

    res.status(404).json({ success: false, message: "Application not found" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
