const riskStyles = {
  low: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  medium: "border-sky-500/20 bg-sky-500/10 text-sky-100",
  high: "border-rose-500/20 bg-rose-500/10 text-rose-100"
};

function Pill({ children, warm = false }) {
  const toneClass = warm
    ? "border-accent-500/30 bg-accent-500/10 text-accent-100"
    : "border-white/10 bg-white/5 text-text-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {children}
    </span>
  );
}

export default function AiInsightsPanel({ insights = null, loading = false, error = "" }) {
  const riskLevel = String(insights?.riskLevel || "medium").toLowerCase();
  const signals = Array.isArray(insights?.keySignals) ? insights.keySignals : [];
  const recommendations = Array.isArray(insights?.recommendations) ? insights.recommendations : [];

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-border/80 bg-bg-800/80 shadow-panel">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,195,238,0.08),transparent_28%)]" />
      <div className="relative p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-text-100">
              {insights?.title || "Traffic summary"}
            </h2>
          </div>
          {insights?.generatedAt ? (
            <div className="text-xs text-text-300 font-mono">
              {new Date(insights.generatedAt).toLocaleString()}
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border bg-black/20 p-4 text-text-200">
            Generating summary...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">
            {error}
          </div>
        ) : insights ? (
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-4">
              <div className={`rounded-2xl border p-4 ${riskStyles[riskLevel] || riskStyles.medium}`}>
                <div className="text-xs uppercase tracking-[0.24em] opacity-70 mb-2">Executive take</div>
                <p className="text-sm md:text-base leading-7 text-text-100">
                  {insights.executiveSummary || "No summary returned by the model."}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-text-300 mb-3">Blocked impact</div>
                <p className="text-sm leading-7 text-text-100">
                  {insights.blockedImpact || "No blocked-impact narrative available."}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-text-300 mb-3">Key signals</div>
                <div className="flex flex-wrap gap-2">
                  {signals.length ? (
                    signals.map((signal, index) => (
                      <Pill key={`${signal}-${index}`} warm>
                        {signal}
                      </Pill>
                    ))
                  ) : (
                    <div className="text-sm text-text-300">No extra signals returned.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-text-300 mb-3">Follow-up</div>
              <ul className="space-y-2 text-sm text-text-100">
                {recommendations.length ? (
                  recommendations.map((item, index) => (
                    <li key={`${item}-${index}`} className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-orange-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-text-300">No recommendations returned.</li>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-black/20 p-4 text-text-300">
            Run a DPI analysis to generate a concise analyst summary.
          </div>
        )}
      </div>
    </section>
  );
}