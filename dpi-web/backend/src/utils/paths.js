const path = require("path");
const {
  JAVA_OUT_DIR,
  UPLOAD_DIR,
  GENERATED_DIR
} = require("../config/constants");

const backendRoot = path.resolve(__dirname, "../../");

module.exports = {
  backendRoot,
  uploadDirAbs: path.resolve(backendRoot, UPLOAD_DIR),
  generatedDirAbs: path.resolve(backendRoot, GENERATED_DIR),
  javaOutDirAbs: path.resolve(backendRoot, JAVA_OUT_DIR),
  projectRootAbs: path.resolve(backendRoot, "../../")
};