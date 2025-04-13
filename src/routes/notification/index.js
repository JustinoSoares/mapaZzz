const express = require("express");
const router = express.Router();

const { userAuthorization } = require("../../middleware/authorization");

const { climate, getNotification } = require("../../controllers/notification/climate");

router.get("/notification/climate",  climate);
router.get("/notification", userAuthorization, getNotification);

module.exports = router;