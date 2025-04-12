const express = require("express");
const router = express.Router();

const { climate } = require("../../controllers/notification/climate");

router.get("/notification/climate",  climate);


module.exports = router;