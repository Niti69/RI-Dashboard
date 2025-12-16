const FieldVerification = require("../models/FieldVerificationSchema");
const Franchise = require("../models/FranchiseRegestriationSchema");
const Fleetowner = require("../models/Fleetowner");
const uploadToCloudinary = require("../utils/uploadToCloudinary");


// FIND APPLICATION BY applicationNumber ONLY
async function findApplication(appId) {
  return (
    (await Franchise.findOne({ applicationNumber: appId })) ||
    (await Fleetowner.findOne({ applicationNumber: appId }))
  );
}


// FINAL SUBMIT FIELD VERIFICATION

exports.submitFieldVerification = async (req, res) => {
  try {
    const body = req.body;
    const files = req.files || [];

    console.log("BODY:", body);
    console.log("FILES:", files);

    const applicationNumber = body.applicationNumber;

    if (!applicationNumber) {
      return res.status(400).json({
        success: false,
        message: "applicationNumber is required",
      });
    }

    // 1️⃣ VALIDATE APPLICATION
    const app = await findApplication(applicationNumber);
    if (!app)
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });

    // 2️⃣ Determine applicationType AUTOMATICALLY
    const applicationType = app.constructor.modelName === "Franchise"
      ? "FranchisePartner"
      : "FleetOwner";

    // 3️⃣ GET OR CREATE FV RECORD
    let fv = await FieldVerification.findOne({ applicationNumber });

    if (!fv) {
      fv = await FieldVerification.create({
        applicationNumber,
        applicationType,
        staffId: body.staffId,
      });
    }


    // CLOUDINARY UPLOAD HELPER

    async function uploadFile(fieldName, folder = "field_verification") {
      const file = files.find((f) => f.fieldname === fieldName);
      if (!file) return fv[fieldName] || "";
      return await uploadToCloudinary(file.path, folder);
    }

    // GPS LOCATION & SCHEDULING

    const gpsLocationObj = body.gpsLocation || {};
    
    fv.gpsLocation = {
      latitude: gpsLocationObj.latitude || "",
      longitude: gpsLocationObj.longitude || "",
      accuracy: gpsLocationObj.accuracy || "",
      capturedAt: gpsLocationObj.capturedAt || new Date().toISOString(),
    };

    fv.scheduledDate = body.scheduledDate || "";
    fv.scheduledTime = body.scheduledTime || "";


    // MAIN BUSINESS PHOTOS

    fv.photoExterior = await uploadFile("photoExterior");
    fv.photoInterior = await uploadFile("photoInterior");
    fv.photoWarehouse = await uploadFile("photoWarehouse");
    fv.photoVehicle1 = await uploadFile("photoVehicle1");
    fv.photoVehicle2 = await uploadFile("photoVehicle2");
    fv.photoLicense = await uploadFile("photoLicense");

  
    // FEE DOCUMENT PHOTO
   
    const paymentEvidenceUrl = await uploadFile("paymentEvidence");

    
    // VEHICLE DATA - FIXED

    const vehicles = [];
    const vehicleCount = Number(body.vehicleCount || 0);

    for (let i = 0; i < vehicleCount; i++) {
      const vehicle = {
        registrationNumber: body[`vehicleData[${i}][registrationNumber]`] || "",
        vehicleType: body[`vehicleData[${i}][vehicleType]`] || "",
        colorMake: body[`vehicleData[${i}][colorMake]`] || "",
        rcMatch: body[`vehicleData[${i}][rcMatch]`] === "true",
        insuranceVerified: body[`vehicleData[${i}][insuranceVerified]`] === "true",
        verificationStatus: body[`vehicleData[${i}][verificationStatus]`] || "",
      };

      // Upload each vehicle photo
      vehicle.photoFront = await uploadFile(`vehicleData[${i}][photoFront]`, "vehicles");
      vehicle.photoSide = await uploadFile(`vehicleData[${i}][photoSide]`, "vehicles");
      vehicle.photoRear = await uploadFile(`vehicleData[${i}][photoRear]`, "vehicles");
      vehicle.photoPlate = await uploadFile(`vehicleData[${i}][photoPlate]`, "vehicles");

      vehicles.push(vehicle);
    }

    fv.vehicleData = vehicles;


    // FEE DATA - FIXED

    const feeDataObj = body.feeData || {};

    fv.feeData = {
      standardFee: Number(feeDataObj.standardFee || 5000),
      amountCollected: feeDataObj.amountCollected || "",
      paymentMode: feeDataObj.paymentMode || "",
      paymentReference: feeDataObj.paymentReference || "",
      receiptNumber: feeDataObj.receiptNumber || "",
      paymentEvidenceUrl,
      agreementSigned: feeDataObj.agreementSigned === "true",
      applicantConfirmed: feeDataObj.applicantConfirmed === "true",
      termsAccepted: feeDataObj.termsAccepted === "true",
      staffSignature: feeDataObj.staffSignature || "",
    };

    // UPDATE ALL CHECKLISTS
    
    fv.addressExists = body.addressExists === "true";
    fv.businessSignVisible = body.businessSignVisible === "true";
    fv.applicantPresent = body.applicantPresent === "true";

    fv.personMetName = body.personMetName || "";
    fv.staffCount = Number(body.staffCount || 0);

    fv.businessOperatingStatus = body.businessOperatingStatus || "";
    fv.operatingHours = body.operatingHours || "";

    fv.counterDisplayArea = body.counterDisplayArea === "true";
    fv.seatingForCustomers = body.seatingForCustomers === "true";
    fv.itSetupComputer = body.itSetupComputer === "true";
    fv.itSetupInternet = body.itSetupInternet === "true";
    fv.signagePresent = body.signagePresent === "true";

    fv.warehouseSize = body.warehouseSize || "";
    fv.storageCapacity = body.storageCapacity || "";
    fv.parkingArea = body.parkingArea === "true";
    fv.safetyEquipment = body.safetyEquipment === "true";
    fv.cleanlinessRating = body.cleanlinessRating || "";

    fv.interviewSummary = body.interviewSummary || "";
    fv.applicantDemeanor = body.applicantDemeanor || "";
    fv.businessClarity = body.businessClarity || "";

    fv.addressAuthenticity = body.addressAuthenticity || "";
    fv.businessLegitimacy = body.businessLegitimacy || "";
    fv.applicantCredibility = body.applicantCredibility || "";
    fv.neighborhoodSafety = body.neighborhoodSafety || "";

    fv.unlicensedOperation = body.unlicensedOperation === "true";
    fv.cashHeavyOperations = body.cashHeavyOperations === "true";
    fv.illegalActivitySigns = body.illegalActivitySigns === "true";

    fv.redFlags = JSON.parse(body.redFlags || "[]");
    fv.redFlagDetails = body.redFlagDetails || "";


    // FINAL VERIFICATION RESULT
    fv.verificationResult = body.verificationResult || "";
    fv.resultNotes = body.resultNotes || "";

   
    // STATUS UPDATES

    fv.applicationStatus = "field_verification_complete";

    if (body.verificationResult === "verified_ok") {
      app.fieldVisitStatus = "Field Verified";
      app.status = "Field Verified — Under Admin Review";
    } else if (body.verificationResult === "verified_issues") {
      app.fieldVisitStatus = "Field Verified With Issues";
      app.status = "Under Review";
    } else {
      app.fieldVisitStatus = "Field Verification Failed";
      app.status = "Rejected";
    }

    await fv.save();
    await app.save();

    return res.status(200).json({
      success: true,
      message: "Field verification submitted successfully",
      data: fv,
    });
  } catch (error) {
    console.error("FIELD VERIFICATION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};