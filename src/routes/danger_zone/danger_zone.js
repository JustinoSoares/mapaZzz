const express = require("express");
const router = express.Router();
const {userAuthorization, adminAuthorization} = require("../../middleware/authorization");

const { register, report, getDangerZoneForReportage, allZones } = require("../../controllers/danger_zone/danger.zone");


router.post("/danger_zone/report/:dangerZoneId", userAuthorization, report);
router.post("/danger_zone/register", userAuthorization, register);
router.get("/danger_zone/getZoneRandom", userAuthorization, getDangerZoneForReportage);
router.get("/danger_zone/all", allZones);
module.exports = router;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            