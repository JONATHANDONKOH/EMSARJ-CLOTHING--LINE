const express = require("express");
const router = express.Router();

const { upload, uploadImage } = require("../Controllers/UploadController");
const authMiddleware = require("../Middleware/Authmiddleware");

router.post("/", authMiddleware, upload.single("image"), uploadImage);

module.exports = router;