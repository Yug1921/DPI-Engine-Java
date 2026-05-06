const path = require("path");

const constants = {
  PORT: process.env.PORT || 5000,
  BACKEND_BASE_URL: process.env.BACKEND_BASE_URL || "http://localhost:5000",
  JAVA_OUT_DIR: process.env.JAVA_OUT_DIR || "../../out",
  JAVA_MAIN_CLASS: process.env.JAVA_MAIN_CLASS || "Main",
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "",
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
  UPLOAD_DIR: process.env.UPLOAD_DIR || "uploads",
  GENERATED_DIR: process.env.GENERATED_DIR || "generated",
  ALLOWED_EXTENSIONS: [".pcap"],
  MAX_FILE_SIZE_BYTES: 100 * 1024 * 1024
};

console.log("[CONFIG] JAVA_OUT_DIR =", constants.JAVA_OUT_DIR);
console.log("[CONFIG] JAVA_MAIN_CLASS =", constants.JAVA_MAIN_CLASS);

module.exports = constants;