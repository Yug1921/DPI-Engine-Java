const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const { javaOutDirAbs, generatedDirAbs } = require("../utils/paths");
const { parseDpiOutput } = require("./reportParser.service");

const WEB_MAX_PACKETS = Number(process.env.WEB_MAX_PACKETS || 5000);

function runDpiEngine({ inputPath, runId, blockApps = [] }) {
  return new Promise((resolve, reject) => {
    const outputFileName = `filtered_${runId}.pcap`;
    const outputPath = path.join(generatedDirAbs, outputFileName);

    const args = [
      "-Xms32m",
      "-Xmx192m",
      "-Xss256k",
      "-XX:+UseSerialGC",
      "-cp",
      javaOutDirAbs,
      "Main",
      inputPath,
      outputPath
    ];

    for (const app of blockApps) {
      args.push("--block-app", app);
    }

    if (WEB_MAX_PACKETS > 0) {
      args.push("--max-packets", String(WEB_MAX_PACKETS));
    }

    console.log("[DPI RUNNER CMD] java", args.join(" "));

    execFile(
      "java",
      args,
      {
        timeout: 120000,
        windowsHide: true,
        maxBuffer: 20 * 1024 * 1024
      },
      (error, stdout, stderr) => {
        const out = stdout || "";
        const err = stderr || "";
        const combined = `${out}\n${err}`;
        const hasOutputFile = fs.existsSync(outputPath);

        console.log("[DPI RUNNER CALLBACK]", {
          hasError: !!error,
          stdoutLen: out.length,
          stderrLen: err.length,
          hasOutputFile
        });

        const crashIndicators = [
          "There is insufficient memory",
          "Out of Memory Error",
          "Native memory allocation",
          "hs_err_pid"
        ];
        const hasCrashText = crashIndicators.some((k) => combined.includes(k));

        if (combined.toLowerCase().includes("unknown option") && combined.includes("--max-packets")) {
          console.warn("[DPI RUNNER] Java Main may not support --max-packets; continuing.");
        }

        // Hard fail only if unusable result
        if (error && (!hasOutputFile || hasCrashText)) {
          return reject(new Error(`DPI Engine failed: ${error.message}\n${err || out}`));
        }

        let parsed;
        try {
          // IMPORTANT: parse combined output (stdout + stderr)
          parsed = parseDpiOutput(combined);
        } catch (parseErr) {
          console.warn("[DPI RUNNER] parseDpiOutput failed:", parseErr.message);
          parsed = {
            summary: {},
            threadStats: {},
            applications: [],
            domains: []
          };
        }

        // Minimal fallback if parser found nothing but output exists
        const noSummary =
          !parsed.summary ||
          (Number(parsed.summary.totalPackets || 0) === 0 &&
            Number(parsed.summary.processedPackets || 0) === 0 &&
            Number(parsed.summary.activeFlows || 0) === 0);

        if (hasOutputFile && noSummary) {
          parsed.summary = {
            totalPackets: 1,
            processedPackets: 1,
            activeFlows: 0
          };
        }

        resolve({
          outputPath,
          outputFileName,
          stdout: out,
          stderr: err,
          parsed
        });
      }
    );
  });
}

module.exports = { runDpiEngine };