const { GROQ_API_KEY, GROQ_MODEL, GEMINI_API_KEY, GEMINI_MODEL } = require("../config/constants");

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 10);
}

function normalizeAnalysis(payload = {}) {
  return {
    runId: String(payload.runId || "").trim(),
    blockedApps: normalizeList(payload.blockedApps),
    summary: {
      totalPackets: toNumber(payload.summary?.totalPackets, 0),
      processedPackets: toNumber(payload.summary?.processedPackets, 0),
      activeFlows: toNumber(payload.summary?.activeFlows, 0),
      blockedAppsCount: toNumber(payload.summary?.blockedAppsCount, 0)
    },
    threadStats: payload.threadStats && typeof payload.threadStats === "object" ? payload.threadStats : {},
    applications: Array.isArray(payload.applications) ? payload.applications.slice(0, 8) : [],
    domains: Array.isArray(payload.domains) ? payload.domains.slice(0, 24) : [],
    outputFileName: String(payload.outputFileName || "").trim(),
    resultMeta: payload.resultMeta && typeof payload.resultMeta === "object" ? payload.resultMeta : {}
  };
}

function buildFallbackInsights(analysis) {
  const apps = Array.isArray(analysis.applications) ? analysis.applications : [];
  const domains = Array.isArray(analysis.domains) ? analysis.domains : [];
  const blockedApps = analysis.blockedApps || [];
  const topApp = apps[0]?.name || "unknown traffic";
  const packetCount = analysis.summary.totalPackets || analysis.summary.processedPackets || 0;
  const riskLevel = blockedApps.length > 0 || domains.length > 8 ? "medium" : "low";

  return {
    provider: "fallback",
    model: "heuristic-summary",
    generatedAt: new Date().toISOString(),
    title: "DPI analysis summary",
    riskLevel,
    executiveSummary: `Processed ${packetCount} packets across ${analysis.summary.activeFlows || 0} active flows. Top detected traffic is ${topApp}.`,
    blockedImpact: blockedApps.length
      ? `Block rules were applied to ${blockedApps.join(", ")}.`
      : "No block rules were selected for this run.",
    keySignals: [
      `Detected applications: ${apps.length}`,
      `Detected domains: ${domains.length}`,
      `Blocked apps selected: ${blockedApps.length}`
    ],
    recommendations: [
      "Review the top detected applications and confirm they match the expected workload.",
      "Use a second capture with a larger sample window if this traffic looks incomplete.",
      "If you need deeper context, enable Groq or Gemini summarization with an API key."
    ],
    confidence: "moderate",
    notes: "Generated locally because no AI provider key is configured."
  };
}

function buildPrompt(analysis) {
  return [
    "You are a senior network security analyst reviewing DPI results.",
    "Return STRICT JSON only, no markdown, no code fences.",
    "Schema: {",
    '  "title": string,',
    '  "executiveSummary": string,',
    '  "riskLevel": "low" | "medium" | "high",',
    '  "blockedImpact": string,',
    '  "keySignals": string[],',
    '  "recommendations": string[],',
    '  "confidence": "low" | "moderate" | "high",',
    '  "notes": string',
    "}",
    "Keep the summary concrete and operational.",
    "Analyze this DPI JSON:",
    JSON.stringify(analysis, null, 2)
  ].join("\n");
}

function parseJsonBlock(text) {
  const cleaned = String(text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not contain JSON");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

function normalizeInsights(raw, analysis, provider, model) {
  const keySignals = Array.isArray(raw?.keySignals) ? raw.keySignals : [];
  const recommendations = Array.isArray(raw?.recommendations) ? raw.recommendations : [];

  return {
    provider,
    model,
    generatedAt: new Date().toISOString(),
    title: String(raw?.title || "DPI analysis summary").trim(),
    executiveSummary: String(raw?.executiveSummary || "").trim() || buildFallbackInsights(analysis).executiveSummary,
    riskLevel: ["low", "medium", "high"].includes(String(raw?.riskLevel)) ? raw.riskLevel : "medium",
    blockedImpact: String(raw?.blockedImpact || "").trim() || buildFallbackInsights(analysis).blockedImpact,
    keySignals: keySignals.map((item) => String(item).trim()).filter(Boolean).slice(0, 6),
    recommendations: recommendations.map((item) => String(item).trim()).filter(Boolean).slice(0, 6),
    confidence: ["low", "moderate", "high"].includes(String(raw?.confidence))
      ? raw.confidence
      : "moderate",
    notes: String(raw?.notes || "").trim() || "",
    sourceSnapshot: {
      packets: analysis.summary.totalPackets,
      processedPackets: analysis.summary.processedPackets,
      activeFlows: analysis.summary.activeFlows,
      blockedApps: analysis.blockedApps,
      applications: analysis.applications,
      domains: analysis.domains
    }
  };
}

function isQuotaError(err) {
  const status = Number(err?.status || err?.response?.status || 0);
  const message = String(err?.message || "").toLowerCase();
  return (
    status === 429 ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("resource_exhausted")
  );
}

async function callGemini(analysis) {
  if (!GEMINI_API_KEY) {
    return buildFallbackInsights(analysis);
  }

  if (typeof fetch !== "function") {
    return buildFallbackInsights(analysis);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    GEMINI_MODEL
  )}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: buildPrompt(analysis) }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 512,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part?.text || "").join("") || "";
  const parsed = parseJsonBlock(text);
  return normalizeInsights(parsed, analysis, "google-gemini", GEMINI_MODEL);
}

async function callGroq(analysis) {
  if (!GROQ_API_KEY) {
    return buildFallbackInsights(analysis);
  }

  if (typeof fetch !== "function") {
    return buildFallbackInsights(analysis);
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: buildPrompt(analysis)
        }
      ]
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Groq request failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || "";
  const parsed = parseJsonBlock(text);
  return normalizeInsights(parsed, analysis, "groq", GROQ_MODEL);
}

async function callAnyProvider(analysis) {
  if (GROQ_API_KEY) {
    return callGroq(analysis);
  }

  if (GEMINI_API_KEY) {
    return callGemini(analysis);
  }

  return buildFallbackInsights(analysis);
}

async function buildDpiInsights(payload = {}) {
  const analysis = normalizeAnalysis(payload);

  try {
    return await callAnyProvider(analysis);
  } catch (err) {
    const fallback = buildFallbackInsights(analysis);

    if (isQuotaError(err)) {
      if (GROQ_API_KEY && String(err.message || "").toLowerCase().includes("groq")) {
        return {
          ...fallback,
          provider: "fallback",
          model: "heuristic-summary",
          confidence: "moderate",
          notes: "Groq quota or rate limits are blocking AI generation, so the app is showing a local summary instead."
        };
      }

      return {
        ...fallback,
        provider: "fallback",
        model: "heuristic-summary",
        confidence: "moderate",
        notes: GROQ_API_KEY
          ? "Groq quota or rate limits are blocking AI generation, so the app is showing a local summary instead."
          : "AI provider quota is unavailable for this project, so the app is showing a local summary instead."
      };
    }

    return {
      ...fallback,
      provider: "fallback",
      model: GROQ_API_KEY ? GROQ_MODEL : GEMINI_MODEL,
      notes: GROQ_API_KEY
        ? "Groq summary is unavailable right now, so the app is showing a local fallback summary."
        : "AI summary is unavailable right now, so the app is showing a local fallback summary."
    };
  }
}

module.exports = { buildDpiInsights };