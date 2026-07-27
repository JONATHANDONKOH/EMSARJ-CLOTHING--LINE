const express = require("express");
const router = express.Router();

const { upload, uploadImage } = require("../Controllers/UploadController");
const authMiddleware = require("../Middleware/AuthMiddleware");

router.post("/", authMiddleware, upload.single("image"), uploadImage);

module.exports = router;