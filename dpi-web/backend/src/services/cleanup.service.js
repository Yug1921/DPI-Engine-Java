const fs = require("fs");
const path = require("path");
const { uploadsDirAbs, generatedDirAbs } = require("../utils/paths");

const UPLOAD_TTL_MS = 10 * 60 * 1000;      // 10 min
const GENERATED_TTL_MS = 30 * 60 * 1000;   // 30 min

function cleanupDir(dir, ttlMs) {
  if (!fs.existsSync(dir)) return;
  const now = Date.now();

  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    try {
      const st = fs.statSync(full);
      if (!st.isFile()) continue;
      if (now - st.mtimeMs > ttlMs) fs.unlinkSync(full);
    } catch (_) {}
  }
}

function startCleanupJob() {
  setInterval(() => {
    cleanupDir(uploadsDirAbs, UPLOAD_TTL_MS);
    cleanupDir(generatedDirAbs, GENERATED_TTL_MS);
  }, 10 * 60 * 1000);
}
module.exports = { startCleanupJob };

console.log("[CLEANUP] job started (every 10 min)");