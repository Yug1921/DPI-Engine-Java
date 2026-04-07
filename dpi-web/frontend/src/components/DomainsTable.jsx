export default function DomainsTable({ domains = [] }) {
  return (
    <div className="bg-bg-800 border border-border rounded-2xl p-4">
      <h3 className="text-2xl font-semibold mb-4">Detected Domains / SNI</h3>

      {domains.length === 0 ? (
        <div className="text-text-300">No domains available.</div>
      ) : (
        <div className="max-h-[360px] overflow-auto rounded border border-border">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-bg-700">
              <tr className="text-text-300 border-b border-border">
                <th className="py-2 px-3 w-[70px]">#</th>
                <th className="py-2 px-3 w-[55%]">Domain</th>
                <th className="py-2 px-3">Application</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((row, idx) => {
                const domain = row?.domain || row?.host || row?.sni || "-";
                const app = row?.application || row?.app || row?.name || "Unknown";

                return (
                  <tr
                    key={`${domain}-${idx}`}
                    className={`border-b border-border/50 ${
                      idx % 2 === 0 ? "bg-bg-800" : "bg-bg-900/40"
                    } hover:bg-bg-700/50 transition`}
                  >
                    <td className="py-2 px-3 text-text-300">{idx + 1}</td>
                    <td className="py-2 px-3 break-all font-mono text-sm">
                      {domain}
                      {row?.inferred ? (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded bg-yellow-700/40 text-yellow-300 border border-yellow-500/40">
                          inferred
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 px-3">{app}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}