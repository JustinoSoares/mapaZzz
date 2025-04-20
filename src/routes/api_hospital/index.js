const express = require("express");
const router = express.Router();
const {userAuthorization, adminAuthorization} = require("../../middleware/authorization");

const { danger_zones, most_effected,statistics, nearbyHospitals } = require("../../controllers/api_hospital/index");


router.get("/hospital/danger_zones", danger_zones);
router.get("/hospital/most_effected", most_effected);
router.get("/hospital/statistics", statistics);
router.get("/hospital/nearby", nearbyHospitals);


module.exports = router;         