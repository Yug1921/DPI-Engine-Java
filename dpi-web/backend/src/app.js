require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const { generatedDirAbs, uploadDirAbs } = require("./utils/paths");
const routes = require("./routes/dpi.routes");
const { PORT } = require("./config/constants");
const { startCleanupJob } = require("./services/cleanup.service");

const app = express();

// Ensure required directories exist
if (!fs.existsSync(uploadDirAbs)) fs.mkdirSync(uploadDirAbs, { recursive: true });
if (!fs.existsSync(generatedDirAbs)) fs.mkdirSync(generatedDirAbs, { recursive: true });

app.use(cors());
app.use(express.json());

app.use("/api", routes);

app.use((err, req, res, next) => {
  if (err) {
    console.error("[APP ERROR]", err);
    return res.status(400).json({ error: err.message || "Bad request" });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`DPI web backend running on http://localhost:${PORT}`);
  startCleanupJob(); // start after server boots
});