const fs = require("fs");
const path = require("path");
const { runDpiEngine } = require("../services/dpiRunner.service");
const { buildDpiInsights } = require("../services/aiInsights.service");
const { BACKEND_BASE_URL } = require("../config/constants");
const { generatedDirAbs } = require("../utils/paths");

let isRunInProgress = false;
const DEMO_MODE = String(process.env.DEMO_MODE || "false").toLowerCase() === "true";

function createRunId() {
  const now = new Date();
  const ts = now.toISOString().replace(/[-:.TZ]/g, "");
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}_${rand}`;
}

function normalizeBlockApps(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean);

  if (typeof raw === "string") {
    const s = raw.trim();

    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed.map(String).map((v) => v.trim()).filter(Boolean);
      if (typeof parsed === "string") return [parsed.trim()];
    } catch (_) {}

    return s
      .replace(/^\[/, "")
      .replace(/\]$/, "")
      .split(",")
      .map((x) => x.replace(/^"+|"+$/g, "").replace(/^'+|'+$/g, "").trim())
      .filter(Boolean);
  }

  return [];
}

function strHash(s = "") {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pickDeterministic(arr, seed, count) {
  const out = [];
  if (!arr.length || count <= 0) return out;
  let x = seed || 1;
  const used = new Set();

  while (out.length < Math.min(count, arr.length)) {
    x = (x * 1664525 + 1013904223) % 4294967296;
    const idx = x % arr.length;
    if (!used.has(idx)) {
      used.add(idx);
      out.push(arr[idx]);
    }
  }
  return out;
}

function buildSmartDemoPayload({ reqFile, runId, blockApps }) {
  const fileName = reqFile?.originalname || reqFile?.filename || "capture.pcap";
  const bytes = Number(reqFile?.size || 0);
  const kb = Math.max(1, Math.round(bytes / 1024));
  const seed = strHash(`${fileName}:${bytes}:${blockApps.join("|")}`);

  // Dynamic but bounded totals
  const totalPackets = Math.max(60, Math.min(5000, kb * 8 + (seed % 120)));
  const processedPackets = totalPackets;
  const activeFlows = Math.max(6, Math.min(320, Math.floor(totalPackets / 9) + (seed % 11)));

  const knownApps = ["YouTube", "TikTok", "Netflix", "Instagram", "Discord", "Google", "GitHub", "Microsoft"];
  const boosted = blockApps.length ? blockApps : ["YouTube"];
  const appUniverse = [...new Set([...boosted, ...knownApps])];

  const appCount = Math.max(3, Math.min(6, 3 + (seed % 4)));
  const chosenApps = pickDeterministic(appUniverse, seed, appCount);

  // Build app distribution
  let remaining = Math.max(10, Math.floor(totalPackets / 12));
  const applications = chosenApps.map((name, i) => {
    const left = chosenApps.length - i;
    const base = i === chosenApps.length - 1 ? remaining : Math.max(1, Math.floor(remaining / left) + ((seed >> i) % 4));
    remaining -= base;
    return { name, count: base };
  });

  const domainPool = {
    YouTube: ["www.youtube.com", "i.ytimg.com", "googlevideo.com"],
    TikTok: ["www.tiktok.com", "v16-web.tiktokcdn.com"],
    Netflix: ["www.netflix.com", "nflxvideo.net"],
    Instagram: ["www.instagram.com", "cdninstagram.com"],
    Discord: ["discord.com", "gateway.discord.gg"],
    Google: ["www.google.com", "dns.google"],
    GitHub: ["github.com", "api.github.com"],
    Microsoft: ["www.microsoft.com", "login.microsoftonline.com"]
  };

  const domains = [];
  for (const a of applications) {
    const dList = domainPool[a.name] || [`${a.name.toLowerCase()}.example.com`];
    const dPickCount = Math.max(1, Math.min(3, 1 + ((seed + a.count) % 3)));
    const picked = pickDeterministic(dList, seed + a.count, dPickCount);
    picked.forEach((d) => domains.push({ domain: d, application: a.name }));
  }

  const threadStats = {
    "worker-1": Math.floor(processedPackets * 0.42),
    "worker-2": Math.floor(processedPackets * 0.33),
    "worker-3": processedPackets - Math.floor(processedPackets * 0.42) - Math.floor(processedPackets * 0.33)
  };

  return {
    ok: true,
    runId,
    blockedApps: blockApps,
    summary: {
      totalPackets,
      processedPackets,
      activeFlows,
      blockedAppsCount: blockApps.length
    },
    threadStats,
    applications,
    domains,
    rawOutput: `SMART_DEMO_MODE file=${fileName} size=${bytes}B`,
    outputFileName: "",
    downloadUrl: "",
    resultMeta: {
      hasOutputFile: false,
      demoMode: true,
      smartDemo: true,
      sourceFile: fileName,
      sourceBytes: bytes
    }
  };
}

async function runDpi(req, res) {
  if (isRunInProgress) {
    return res.status(429).json({
      error: "A DPI run is already in progress. Please wait for it to finish."
    });
  }
  isRunInProgress = true;

  try {
    if (!req.file) return res.status(400).json({ error: "pcapFile is required" });

    const blockApps = normalizeBlockApps(req.body.blockApps);
    const runId = createRunId();

    console.log("[RUN_DPI] start", { runId, blockApps, demoMode: DEMO_MODE });

    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 220));
      const payload = buildSmartDemoPayload({
        reqFile: req.file,
        runId,
        blockApps
      });
      return res.status(200).json(payload);
    }

    const runResult = await runDpiEngine({
      inputPath: req.file.path,
      runId,
      blockApps
    });

    console.log("[RUN_DPI] done", {
      runId,
      outputFileName: runResult.outputFileName
    });

    return res.status(200).json({
      ok: true,
      runId,
      blockedApps: blockApps,
      summary: {
        ...(runResult?.parsed?.summary || {}),
        blockedAppsCount: blockApps.length
      },
      threadStats: runResult?.parsed?.threadStats || {},
      applications: runResult?.parsed?.applications || [],
      domains: runResult?.parsed?.domains || [],
      rawOutput: `${runResult?.stdout || ""}\n${runResult?.stderr || ""}`,
      outputFileName: runResult?.outputFileName || "",
      downloadUrl: `${BACKEND_BASE_URL}/api/dpi/download/${encodeURIComponent(
        runResult?.outputFileName || ""
      )}`,
      resultMeta: {
        hasOutputFile: !!runResult?.outputFileName,
        runInProgress: false,
        demoMode: false
      }
    });
  } catch (err) {
    console.error("[RUN_DPI] error", err);
    return res.status(500).json({
      error: "Failed to run DPI engine",
      details: err.message || "Unknown error"
    });
  } finally {
    isRunInProgress = false;
  }
}

function downloadPcap(req, res) {
  try {
    const { fileName } = req.params;
    if (!fileName || fileName.includes("..")) {
      return res.status(400).json({ error: "Invalid file name" });
    }

    const fullPath = path.join(generatedDirAbs, fileName);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "File not found" });
    }

    return res.download(fullPath);
  } catch (err) {
    console.error("[DOWNLOAD] error", err);
    return res.status(500).json({ error: "Failed to download file" });
  }
}

function health(req, res) {
  return res.json({ status: "ok", service: "dpi-web-backend", demoMode: DEMO_MODE });
}

async function generateInsights(req, res) {
  try {
    const analysis = req.body || {};
    const insights = await buildDpiInsights(analysis);
    return res.json({ ok: true, ...insights });
  } catch (err) {
    console.error("[INSIGHTS] error", err);
    return res.status(500).json({
      error: "Failed to generate insights",
      details: err.message || "Unknown error"
    });
  }
}

module.exports = { runDpi, downloadPcap, health, generateInsights };