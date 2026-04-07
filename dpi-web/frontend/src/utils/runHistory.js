const KEY = "dpi_run_history_v2";

function safeParse(json) {
  try {
    const parsed = JSON.parse(json || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getRunHistory() {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(KEY));
}

export function addRunHistoryItem(item) {
  if (typeof window === "undefined") return [];
  const prev = getRunHistory();

  const normalized = {
    runId: item?.runId || `run_${Date.now()}`,
    at: item?.at || new Date().toISOString(),
    blockedApps: Array.isArray(item?.blockedApps) ? item.blockedApps : [],
    summary: item?.summary || {},
    applications: Array.isArray(item?.applications) ? item.applications : [],
    domains: Array.isArray(item?.domains) ? item.domains : [],
    domainsCount:
      typeof item?.domainsCount === "number"
        ? item.domainsCount
        : Array.isArray(item?.domains)
        ? item.domains.length
        : 0,
    outputFileName: item?.outputFileName || "",
    downloadUrl: item?.downloadUrl || ""
  };

  const next = [normalized, ...prev].slice(0, 100);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearRunHistory() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}