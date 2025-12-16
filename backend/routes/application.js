const express = require("express");
const router = express.Router();
const {getAllApplications,getApplicationById,getTeleApplicationById,getTeleLogByApplicationId} = require('../api/application')

router.get("/application", getAllApplications);

//  /api/application/:id
router.get("/application/:id",getApplicationById)

// fot tele 
router.get("tele/application/:id",getTeleLogByApplicationId)

module.exports = router;