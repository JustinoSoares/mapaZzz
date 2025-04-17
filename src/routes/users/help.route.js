const express = require("express");
const router = express.Router();

const { createHelp } = require("../../controllers/users/help");
// const { create } = require("../../validator/users/");
const { userAuthorization } = require("../../middleware/authorization");

router.post("/help/create", userAuthorization, createHelp);

module.exports = router;