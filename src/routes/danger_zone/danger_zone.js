const express = require("express");
const router = express.Router();
const {userAuthorization, adminAuthorization} = require("../../middleware/authorization");

const { register, report, getDangerZoneForReportage, allZones, deleteZone, approach } = require("../../controllers/danger_zone/danger.zone");
const { sendHelpToReport, nearHospitais } = require("../../controllers/ussd");


router.post("/danger_zone/report/:dangerZoneId", userAuthorization, report);
router.post("/danger_zone/register", userAuthorization, register);
router.get("/danger_zone/getZoneRandom", userAuthorization, getDangerZoneForReportage);
router.get("/danger_zone/all", allZones);
router.get("/danger_zone/all/:id", userAuthorization, allZones);
router.delete("/danger_zone/delete/:dangerZoneId", userAuthorization, deleteZone);
router.get("/danger_zone/approach_danger_zone", approach);
router.post("/danger_zone/sendHelpToReport", sendHelpToReport);
router.post("/danger_zone/sendHelpHospital", nearHospitais);
module.exports = router;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               