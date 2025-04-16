const express = require("express");
const router = express.Router();

const { userAuthorization } = require("../../middleware/authorization");

const { climate, getNotification, new_danger_zone, approach_danger_zone, game } = require("../../controllers/notification/climate");

router.get("/notification/climate",  climate);

router.get("/notification/approach_danger_zone", userAuthorization, approach_danger_zone);

router.get("/notification/game", userAuthorization ,game);

router.get("/notification/", userAuthorization, getNotification);
router.get("/notification/new_danger_zone", new_danger_zone);

module.exports = router;