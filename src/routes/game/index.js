const express = require("express");
const router = express.Router();

const { getQuestion, getResponse, alert } = require("../../controllers/game/index");

router.get("/game/get_question",  getQuestion);
router.get("/game/get_response",  getResponse);
router.get("/alert/",  alert);

module.exports = router;