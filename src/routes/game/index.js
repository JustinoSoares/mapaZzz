const express = require("express");
const router = express.Router();

const { getQuestion, getResponse, alert } = require("../../controllers/game/index");
const {userAuthorization} = require("../../middleware/authorization");

router.get("/game/get_question",  getQuestion);
router.get("/game/get_response",  getResponse);
router.get("/alert/", userAuthorization, alert);

module.exports = router;