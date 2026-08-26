const express = require("express");
const router = express.Router();

const { getProfile } = require("../Controllers/ProfileController");
const authMiddleware = require("../Middleware/authMiddleware");

router.get("/", authMiddleware, getProfile);

module.exports = router;