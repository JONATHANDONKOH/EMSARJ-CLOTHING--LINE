const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Multer setup (temporary local storage before handing off to Cloudinary)
const upload = multer({ dest: "uploads/" });

async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "products", // auto-creates folder if not exists
    });

    fs.unlinkSync(req.file.path);

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  upload,        // multer instance — the route needs this for .single("image")
  uploadImage,
};