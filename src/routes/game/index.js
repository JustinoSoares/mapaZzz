const express = require("express");
const router = express.Router();

const { getQuestion, getResponse, alert } = require("../../controllers/game/index");
const {userAuthorization} = require("../../middleware/authorization");

router.get("/game/get_question", getQuestion);
router.post("/game/get_response", userAuthorization,  getResponse);
router.get("/alert/", userAuthorization, alert);

module.exports = router;