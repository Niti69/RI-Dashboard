const Fleetowner = require("../models/Fleetowner");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

exports.registerFleetOwner = async (req, res) => {
  try {
    console.log("Body:", req.body);
    console.log("Files:", req.files);
    const body = req.body;

    // Upload single files
    const getFileUrl = async (field) => {
      const file = req.files.find(f => f.fieldname === field);
      return file ? await uploadToCloudinary(file.path, "fleetowners") : null;
    };

    const aadhaarUrl = await getFileUrl("aadhaarFile");
    const panUrl = await getFileUrl("panFile");
    const rcUrl = await getFileUrl("rcFile");
    const insuranceUrl = await getFileUrl("insuranceFile");
    const fitnessUrl = await getFileUrl("fitnessFile");

    // TRUCKS
    const trucks = [];
    const count = Number(body.trucksCount);

    for (let i = 0; i < count; i++) {
      const type = body[`trucks[${i}][type]`];
      const regNumber = body[`trucks[${i}][regNumber]`];
      const capacity = body[`trucks[${i}][capacity]`];

      // Collect all photos for this truck
      const filesForTruck = req.files.filter(f =>
        f.fieldname.startsWith(`trucks[${i}][photos]`)
      );

      const photoUrls = [];

      for (const file of filesForTruck) {
        const url = await uploadToCloudinary(file.path, "fleetowners/trucks");
        photoUrls.push(url);
      }

      trucks.push({
        type,
        regNumber,
        capacity,
        photos: photoUrls,
      });
    }

    // SAVE
    const newFleetOwner = await Fleetowner.create({
      ...body,
      aadhaarFile: aadhaarUrl,
      panFile: panUrl,
      rcFile: rcUrl,
      insuranceFile: insuranceUrl,
      fitnessFile: fitnessUrl,
      trucks,
      status: "New",
    });

    return res.status(200).json({
      success: true,
      message: "Fleet Owner Registered Successfully",
      data: newFleetOwner,
    });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
