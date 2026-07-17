import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { authMiddleware } from "./Middleware/Authmiddleware.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "https://emsarj-clothing-line.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Multer setup (temporary local storage)
const upload = multer({ dest: "uploads/" });

// Upload controller: Cloudinary logic lives here, kept separate from the route
// definition so authMiddleware and multer stay easy to read as a pipeline.
async function uploadController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "products", // auto-creates folder if not exists
    });

    // Clean up local temp file
    fs.unlinkSync(req.file.path);

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    // Best-effort cleanup if upload failed after multer already wrote the temp file
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
}

// Upload route → auth check → multer parses file → Cloudinary upload
app.post("/upload", authMiddleware, upload.single("image"), uploadController);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});