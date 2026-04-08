import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { clearRunHistory, getRunHistory } from "../utils/runHistory";
import { makeDownloadUrl } from "../services/api";

export default function ReportsPage() {
  const [rows, setRows] = useState(getRunHistory());

  const onClear = () => {
    clearRunHistory();
    setRows([]);
  };

  return (
    <div className="flex min-h-screen bg-bg-900 text-text-100">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 space-y-4">
        <div className="rounded-[28px] border border-border/80 bg-bg-800/80 px-5 py-5 shadow-panel flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.32em] text-text-300">Dashboard / Reports</div>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Reports</h1>
            <p className="mt-2 text-sm text-text-300">Review local run history and reopen filtered captures without leaving the console.</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="px-4 py-2 rounded-2xl border border-border bg-bg-900 text-text-100 hover:bg-bg-700 transition"
          >
            Clear Local History
          </button>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-[24px] border border-border/80 bg-bg-800/80 p-5 text-text-300 shadow-panel">
            No report history found.
          </div>
        ) : (
          <div className="rounded-[24px] border border-border/80 bg-bg-800/80 p-5 overflow-auto shadow-panel">
            <table className="w-full text-left min-w-[950px]">
              <thead>
                <tr className="text-text-300 border-b border-border">
                  <th className="py-2">Time</th>
                  <th className="py-2">Run ID</th>
                  <th className="py-2">Blocked Apps</th>
                  <th className="py-2">Total Packets</th>
                  <th className="py-2">Detected Domains</th>
                  <th className="py-2">Output</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => {
                  const href = makeDownloadUrl(r.downloadUrl);
                  return (
                    <tr key={`${r.runId}-${r.at}-${idx}`} className="border-b border-border/50">
                      <td className="py-2">{new Date(r.at).toLocaleString()}</td>
                      <td className="py-2 break-all">{r.runId}</td>
                      <td className="py-2">{(r.blockedApps || []).join(", ") || "None"}</td>
                      <td className="py-2">{r.summary?.totalPackets ?? "-"}</td>
                      <td className="py-2">{Array.isArray(r.domains) ? r.domains.length : r.domainsCount ?? 0}</td>
                      <td className="py-2">
                        {href ? (
                          <a className="text-cyan-400 underline" href={href} download>
                            {r.outputFileName || "Download"}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}