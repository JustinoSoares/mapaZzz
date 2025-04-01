const express = require("express");
const router = express.Router();

const { createUser } = require("../../controllers/users/create");
const { create } = require("../../validator/users/create");

router.post("/users/create", create,  createUser);

module.exports = router;