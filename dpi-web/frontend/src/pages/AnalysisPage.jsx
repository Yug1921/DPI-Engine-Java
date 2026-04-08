import { useMemo } from "react";
import Sidebar from "../components/Sidebar";
import { getRunHistory } from "../utils/runHistory";

function normalizeApps(apps = []) {
  return apps
    .map((a) => ({
      name: a?.name || a?.app || a?.application || "Unknown",
      count: Number(a?.count ?? a?.packets ?? a?.value ?? 0)
    }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);
}

export default function AnalysisPage() {
  const runs = getRunHistory();
  const latest = runs[0];

  const appRows = useMemo(() => normalizeApps(latest?.applications || []), [latest]);
  const domains = latest?.domains || [];

  return (
    <div className="flex min-h-screen bg-bg-900 text-text-100">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 space-y-4">
        <div className="rounded-[28px] border border-border/80 bg-bg-800/80 px-5 py-5 shadow-panel">
          <div className="text-xs uppercase tracking-[0.32em] text-text-300">Dashboard / Analysis</div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Analysis</h1>
          <p className="mt-2 text-sm text-text-300">Review the latest run, top applications, and detected domains in a compact audit view.</p>
        </div>

        {!latest ? (
          <div className="rounded-[24px] border border-border/80 bg-bg-800/80 p-5 text-text-300 shadow-panel">
            No runs yet. Go to Dashboard and run a PCAP first.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-[24px] border border-border/80 bg-bg-800/80 p-5 shadow-panel">
                <div className="text-sm text-text-300">Latest Run ID</div>
                <div className="font-semibold break-all">{latest.runId}</div>
              </div>
              <div className="rounded-[24px] border border-border/80 bg-bg-800/80 p-5 shadow-panel">
                <div className="text-sm text-text-300">Time</div>
                <div className="font-semibold">{new Date(latest.at).toLocaleString()}</div>
              </div>
              <div className="rounded-[24px] border border-border/80 bg-bg-800/80 p-5 shadow-panel">
                <div className="text-sm text-text-300">Detected Domains</div>
                <div className="text-2xl font-bold">{domains.length}</div>
              </div>
            </div>

            <div className="rounded-[24px] border border-border/80 bg-bg-800/80 p-5 shadow-panel">
              <h2 className="text-xl font-semibold mb-3">Top Applications (latest run)</h2>
              {appRows.length === 0 ? (
                <div className="text-text-300">No application breakdown available.</div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-text-300 border-b border-border">
                        <th className="py-2">Application</th>
                        <th className="py-2">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appRows.map((r) => (
                        <tr key={r.name} className="border-b border-border/50">
                          <td className="py-2">{r.name}</td>
                          <td className="py-2">{r.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-[24px] border border-border/80 bg-bg-800/80 p-5 shadow-panel">
              <h2 className="text-xl font-semibold mb-3">Detected Domains / SNI (latest run)</h2>
              {domains.length === 0 ? (
                <div className="text-text-300">No domains recorded in latest run.</div>
              ) : (
                <div className="max-h-[280px] overflow-auto">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-bg-700">
                      <tr className="text-text-300 border-b border-border">
                        <th className="py-2">Domain</th>
                        <th className="py-2">Application</th>
                      </tr>
                    </thead>
                    <tbody>
                      {domains.map((d, idx) => (
                        <tr key={`${d.domain}-${idx}`} className="border-b border-border/50">
                          <td className="py-2 break-all">{d.domain || "-"}</td>
                          <td className="py-2">{d.application || "Unknown"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}