const FranchiseRegistration = require("../models/FranchiseRegestriationSchema");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

exports.registerFranchise = async (req, res) => {
  try {
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    const body = req.body;

    const getFileUrl = async (field) => {
      const file = req.files.find((f) => f.fieldname === field);
      return file
        ? await uploadToCloudinary(file.path, "franchise_applications")
        : null;
    };

    const applicantPhoto = await getFileUrl("applicantPhoto");
    const aadhaarCopy = await getFileUrl("aadhaarCopy");
    const panCopy = await getFileUrl("panCopy");
    const gstCertificate = await getFileUrl("gstCertificate");
    const shopOwnershipDoc = await getFileUrl("shopOwnershipDoc");

    const newApplication = await FranchiseRegistration.create({
      ...body,
      applicantPhoto,
      aadhaarCopy,
      panCopy,
      gstCertificate,
      shopOwnershipDoc,
      status: "New",
      applicationNumber: "FRP-" + Date.now(),
    });

    return res.status(200).json({
      success: true,
      message: "Franchise Application Submitted Successfully",
      data: newApplication,
    });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
