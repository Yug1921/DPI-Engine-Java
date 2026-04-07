const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  runDpi,
  downloadPcap,
  health,
  generateInsights
} = require("../controllers/dpi.controller");
const { uploadDirAbs } = require("../utils/paths");
const { ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES } = require("../config/constants");

const router = express.Router();

if (!fs.existsSync(uploadDirAbs)) {
  fs.mkdirSync(uploadDirAbs, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDirAbs),
  filename: (_, file, cb) => {
    const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    cb(null, `${unique}_${file.originalname}`);
  }
});

const fileFilter = (_, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error("Only .pcap files are allowed"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES }
});

router.get("/health", health);
router.post("/dpi/run", upload.single("pcapFile"), runDpi);
router.post("/dpi/insights", generateInsights);
router.get("/dpi/download/:fileName", downloadPcap);

module.exports = router;