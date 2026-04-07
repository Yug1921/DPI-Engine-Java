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
      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Reports</h1>
          <button
            type="button"
            onClick={onClear}
            className="px-3 py-2 rounded bg-red-600 hover:bg-red-500 text-white"
          >
            Clear Local History
          </button>
        </div>

        {rows.length === 0 ? (
          <div className="bg-bg-800 border border-border rounded-xl p-4 text-text-300">
            No report history found.
          </div>
        ) : (
          <div className="bg-bg-800 border border-border rounded-xl p-4 overflow-auto">
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