export default function StatsCards({ summary = {}, blockedApps = [], domains = [] }) {
  const totalPackets = Number(summary.totalPackets ?? summary.total ?? 0);
  const processed = Number(summary.processedPackets ?? summary.processed ?? totalPackets);
  const activeFlows = Number(summary.activeFlows ?? summary.flows ?? 0);

  const blockedAppsCount = blockedApps.length;
  const detectedDomains = Array.isArray(domains) ? domains.length : 0;

  const fmt = (n) => Number(n || 0).toLocaleString();

  const cards = [
    { label: "Total Packets (Input)", value: fmt(totalPackets) },
    { label: "Processed (Engine)", value: fmt(processed) },
    { label: "Active Flows", value: fmt(activeFlows) },
    { label: "Blocked Apps Selected", value: fmt(blockedAppsCount) },
    { label: "Detected Domains", value: fmt(detectedDomains) }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-bg-800 border border-border rounded-2xl p-4 min-h-[112px]">
          <div className="text-sm text-text-300">{c.label}</div>
          <div className="text-4xl font-bold mt-1">{c.value}</div>
        </div>
      ))}
    </div>
  );
}