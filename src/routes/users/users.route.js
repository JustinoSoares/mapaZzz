const express = require("express");
const router = express.Router();

const { createUser, detalhes, getUserById } = require("../../controllers/users/create");
const { create } = require("../../validator/users/create");
const { userAuthorization } = require("../../middleware/authorization");

router.post("/users/create", create,  createUser);
router.get("/users/:userId", getUserById);
router.get("/users/", userAuthorization, detalhes);

module.exports = router;