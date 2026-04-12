const path = require("path");
const fs = require("fs");
const {
  JAVA_OUT_DIR,
  UPLOAD_DIR,
  GENERATED_DIR
} = require("../config/constants");

const backendRoot = path.resolve(__dirname, "../../");

function resolveJavaOutDir() {
  const configuredPath = path.isAbsolute(JAVA_OUT_DIR)
    ? JAVA_OUT_DIR
    : path.resolve(backendRoot, JAVA_OUT_DIR);

  const candidates = [
    configuredPath,
    path.resolve(backendRoot, "../out"),
    path.resolve(backendRoot, "../../out"),
    "/app/out",
    "/out"
  ];

  const existing = candidates.find((candidate) => fs.existsSync(candidate));
  const selected = existing || configuredPath;

  if (selected !== configuredPath) {
    console.warn(
      `[PATHS] JAVA_OUT_DIR '${configuredPath}' not found; using '${selected}' instead.`
    );
  }

  return selected;
}

const javaOutDirAbs = resolveJavaOutDir();

module.exports = {
  backendRoot,
  uploadDirAbs: path.resolve(backendRoot, UPLOAD_DIR),
  generatedDirAbs: path.resolve(backendRoot, GENERATED_DIR),
  javaOutDirAbs,
  projectRootAbs: path.resolve(backendRoot, "../../")
};