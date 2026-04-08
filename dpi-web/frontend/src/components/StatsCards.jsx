export default function StatsCards({ summary = {}, blockedApps = [], blockedDomains = [], domains = [], insightsReady = false }) {
  const totalPackets = Number(summary.totalPackets ?? summary.total ?? 0);
  const processed = Number(summary.processedPackets ?? summary.processed ?? totalPackets);
  const activeFlows = Number(summary.activeFlows ?? summary.flows ?? 0);

  const blockedAppsCount = blockedApps.length;
  const detectedDomains = Array.isArray(domains) ? domains.length : 0;
  const blockedDomainsCount = Array.isArray(blockedDomains) ? blockedDomains.length : 0;

  const fmt = (n) => Number(n || 0).toLocaleString();

  const cards = [
    { label: "Total Packets", value: fmt(totalPackets), note: "Input capture size", tone: "up" },
    { label: "Processed", value: fmt(processed), note: "Engine throughput", tone: "up" },
    { label: "Active Flows", value: fmt(activeFlows), note: "Live flow count", tone: "up" },
    { label: "Blocked Apps", value: fmt(blockedAppsCount), note: "Selected policy set", tone: "flat" },
    { label: "Detected Domains", value: fmt(detectedDomains), note: "Visible destinations", tone: "up" },
    { label: "Blocked Domains", value: fmt(blockedDomainsCount), note: insightsReady ? "AI summary ready" : "Waiting for summary", tone: insightsReady ? "up" : "flat" }
  ];

  const toneStyles = {
    up: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    flat: "text-text-300 border-border bg-bg-900/60"
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-[22px] border border-border/80 bg-bg-800/80 p-4 shadow-panel min-h-[126px]">
          <div className="flex items-start justify-between gap-3">
            <div className="text-sm text-text-300">{c.label}</div>
            <div className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] ${toneStyles[c.tone]}`}>
              {c.tone === "up" ? "+" : ""}live
            </div>
          </div>
          <div className="mt-3 text-4xl font-black tracking-tight text-white">{c.value}</div>
          <div className="mt-2 text-xs text-text-300">{c.note}</div>
        </div>
      ))}
    </div>
  );
}