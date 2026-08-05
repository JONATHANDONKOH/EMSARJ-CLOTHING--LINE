const express = require("express");
const { subscribe, notifyAll } = require("../Controllers/EmailController");
const authMiddleware = require("../Middleware/Authmiddleware");
const roleMiddleware = require("../Middleware/Rolemiddleware");

const router = express.Router();

router.post("/subscribe", subscribe);

router.post(
  "/notify-all",
  authMiddleware,
  roleMiddleware("admin"),
  notifyAll
);

module.exports = router;