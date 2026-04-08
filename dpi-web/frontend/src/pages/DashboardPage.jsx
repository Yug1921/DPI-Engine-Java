import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import UploadPanel from "../components/UploadPanel";
import ControlPanel from "../components/ControlPanel";
import StatsCards from "../components/StatsCards";
import ChartsPanel from "../components/ChartsPanel";
import DomainsTable from "../components/DomainsTable";
import AiInsightsPanel from "../components/AiInsightsPanel";
import { runDpiAnalysis, makeDownloadUrl, requestDpiInsights } from "../services/api";
import { addRunHistoryItem } from "../utils/runHistory";

const DASHBOARD_CACHE_KEY = "dpi_dashboard_latest_v2";

function loadCachedDashboard() {
  try {
    const raw = sessionStorage.getItem(DASHBOARD_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function saveCachedDashboard(payload) {
  try {
    if (!payload) {
      sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
      return;
    }
    sessionStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(payload));
  } catch {}
}

function clearCachedDashboard() {
  try {
    sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
  } catch {}
}

function isHardReload() {
  try {
    const nav = performance.getEntriesByType("navigation");
    if (nav && nav.length > 0) {
      return nav[0].type === "reload";
    }
  } catch {}
  return false;
}

export default function DashboardPage() {
  const [file, setFile] = useState(null);
  const [selectedApps, setSelectedApps] = useState(["YouTube"]);
  const [loading, setLoading] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [result, setResult] = useState(() => {
    if (isHardReload()) {
      clearCachedDashboard();
      return null;
    }
    return loadCachedDashboard();
  });
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [insightError, setInsightError] = useState("");
  const toastTimerRef = useRef(null);

  const showToast = (msg, ms = 2500) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), ms);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    saveCachedDashboard(result);
  }, [result]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateInsights() {
      if (!result || result.aiInsights || insightLoading) return;
      setInsightLoading(true);
      setInsightError("");

      try {
        const insights = await requestDpiInsights(result);
        if (cancelled) return;
        setResult((current) => (current ? { ...current, aiInsights: insights } : current));
      } catch (err) {
        if (!cancelled) {
          setInsightError(err?.response?.data?.details || err?.message || "Failed to generate AI summary.");
        }
      } finally {
        if (!cancelled) setInsightLoading(false);
      }
    }

    hydrateInsights();

    return () => {
      cancelled = true;
    };
  }, [result, insightLoading]);

  const onRun = async () => {
    if (!file) {
      setError("Please upload a .pcap file first.");
      showToast("Please upload a .pcap file first.", 2200);
      return;
    }

    setError("");
    setInsightError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("pcapFile", file);
      formData.append("blockApps", selectedApps.join(","));

      const data = await runDpiAnalysis(formData);

      let insights = null;
      try {
        setInsightLoading(true);
        insights = await requestDpiInsights(data);
      } catch (aiErr) {
        setInsightError(aiErr?.response?.data?.details || aiErr?.message || "Failed to generate AI summary.");
      } finally {
        setInsightLoading(false);
      }

      const merged = { ...data, aiInsights: insights };
      setResult(merged);

      addRunHistoryItem({
        runId: data?.runId || "",
        at: new Date().toISOString(),
        blockedApps: data?.blockedApps || [],
        summary: data?.summary || {},
        applications: data?.applications || [],
        domains: data?.domains || [],
        aiInsights: insights,
        domainsCount: (data?.domains || []).length,
        outputFileName: data?.outputFileName || "",
        downloadUrl: data?.downloadUrl || ""
      });

      showToast("DPI analysis completed successfully.");
    } catch (e) {
      const msg =
        e?.response?.data?.details ||
        e?.response?.data?.error ||
        e.message ||
        "Failed to run analysis";

      setError(msg);
      showToast("DPI analysis failed. Check error details.", 3000);
    } finally {
      setLoading(false);
    }
  };

  const blockedApps = result?.blockedApps || [];
  const downloadHref = makeDownloadUrl(result?.downloadUrl);

  const visibleDomains = useMemo(() => {
    const list = result?.domains || [];
    if (!blockedApps.length) return list;
    const blocked = new Set(blockedApps.map((x) => String(x).toLowerCase()));
    return list.filter((d) => {
      const app = String(d?.application || d?.app || d?.name || "").toLowerCase();
      return !blocked.has(app);
    });
  }, [result?.domains, blockedApps]);

  const blockedDomains = useMemo(() => {
    const list = result?.domains || [];
    if (!blockedApps.length) return [];
    const blocked = new Set(blockedApps.map((x) => String(x).toLowerCase()));
    return list.filter((d) => {
      const app = String(d?.application || d?.app || d?.name || "").toLowerCase();
      return blocked.has(app);
    });
  }, [result?.domains, blockedApps]);

  return (
    <div className="flex min-h-screen bg-bg-950 text-text-100">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 space-y-4">
        <header className="rounded-[28px] border border-border/80 bg-bg-800/80 px-5 py-5 shadow-panel backdrop-blur">
          <div>
            <div className="text-xs uppercase tracking-[0.32em] text-text-300">Dashboard / CMS</div>
            <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight">DPI Engine Analysis Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-text-300">
              Inspect captures, apply block rules, and review the local engine output with a concise analyst summary.
            </p>
          </div>
        </header>

        {toast && (
          <div className="fixed top-4 right-4 bg-accent-500 text-black px-4 py-2 rounded shadow-lg z-50 font-medium">
            {toast}
          </div>
        )}

        {error && (
          <div className="bg-red-900/40 border border-red-500 rounded-2xl p-3 text-sm">{error}</div>
        )}

        {insightError && !result?.aiInsights && (
          <div className="bg-orange-900/30 border border-orange-500/30 rounded-2xl p-3 text-sm text-orange-100">
            {insightError}
          </div>
        )}

        {loading && (
          <div className="bg-orange-900/20 border border-orange-500/30 rounded-2xl p-3 text-sm text-orange-100">
            DPI engine is processing your PCAP...
          </div>
        )}

        {!!blockedApps.length && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-3 text-sm text-orange-50">
            Applied block rules: <b>{blockedApps.join(", ")}</b>
          </div>
        )}

        {result && blockedApps.length > 0 && (
          <div className="bg-bg-800 border border-border rounded-2xl p-4">
            <h3 className="text-xl font-semibold mb-2">Blocking Impact</h3>
            <div className="text-sm text-text-300">
              Blocked apps selected: <b>{blockedApps.join(", ")}</b>
            </div>
            <div className="text-sm text-text-300">
              Domains matched blocked apps (from detection): <b>{blockedDomains.length}</b>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <UploadPanel file={file} setFile={setFile} />
          <ControlPanel
            selectedApps={selectedApps}
            setSelectedApps={setSelectedApps}
            onRun={onRun}
            loading={loading}
          />
        </div>

        <StatsCards
          summary={result?.summary || {}}
          blockedApps={blockedApps}
          blockedDomains={blockedDomains}
          domains={visibleDomains}
          insightsReady={Boolean(result?.aiInsights)}
        />

        <AiInsightsPanel
          insights={result?.aiInsights || null}
          loading={insightLoading}
          error={insightError && !result?.aiInsights ? insightError : ""}
        />

        <ChartsPanel applications={result?.applications || []} threadStats={result?.threadStats || {}} />
        <DomainsTable domains={visibleDomains} />

        {downloadHref && (
          <div className="flex items-center gap-3 rounded-[20px] border border-border/80 bg-bg-800/80 px-4 py-3 shadow-panel">
            <a
              href={downloadHref}
              className="inline-flex items-center px-4 py-2 rounded-2xl bg-accent-500 text-black font-semibold hover:brightness-110"
              download
            >
              Download Filtered PCAP
            </a>
            <span className="text-sm text-text-300">{result?.outputFileName || ""}</span>
          </div>
        )}
      </main>
    </div>
  );
}