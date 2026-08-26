const express = require("express");
const router = express.Router();

const { upload, uploadImage } = require("../Controllers/UploadController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/", authMiddleware, upload.single("image"), uploadImage);

module.exports = router;