const express = require("express");
const router = express.Router();

const { login } = require("../../controllers/auth/auth.controller");
// const { create } = require("../../validator/users/create");

router.post("/users/auth/login",  login);

module.exports = router;