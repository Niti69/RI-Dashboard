const FleetOwner = require("../models/Fleetowner");
const FranchisePartner = require("../models/FranchiseRegestriationSchema");
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // -------- Fleet Owner Stats ----------
    const fleetTotal = await FleetOwner.countDocuments();
    const fleetToday = await FleetOwner.countDocuments({
      createdAt: { $gte: today }
    });
    const fleetPending = await FleetOwner.countDocuments({ status: "pending" });
    const fleetVerified = await FleetOwner.countDocuments({ status: "verified" });
    const fleetRejected = await FleetOwner.countDocuments({ status: "rejected" });

    // -------- Franchise Partner Stats ----------
    const franchiseTotal = await FranchisePartner.countDocuments();
    const franchiseToday = await FranchisePartner.countDocuments({
      createdAt: { $gte: today }
    });
    const franchisePending = await FranchisePartner.countDocuments({ status: "pending" });
    const franchiseVerified = await FranchisePartner.countDocuments({ status: "verified" });
    const franchiseRejected = await FranchisePartner.countDocuments({ status: "rejected" });

    return res.json({
      success: true,
      data: {
        fleet: {
          total: fleetTotal,
          today: fleetToday,
          pending: fleetPending,
          verified: fleetVerified,
          rejected: fleetRejected
        },
        franchise: {
          total: franchiseTotal,
          today: franchiseToday,
          pending: franchisePending,
          verified: franchiseVerified,
          rejected: franchiseRejected
        }
      }
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = getDashboardStats;