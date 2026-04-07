const riskStyles = {
  low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  medium: "border-orange-500/30 bg-orange-500/10 text-orange-100",
  high: "border-red-500/30 bg-red-500/10 text-red-100"
};

function Pill({ children, warm = false }) {
  const toneClass = warm
    ? "border-orange-500/40 bg-orange-500/10 text-orange-100"
    : "border-white/10 bg-white/5 text-text-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {children}
    </span>
  );
}

export default function AiInsightsPanel({ insights = null, loading = false, error = "" }) {
  const provider = insights?.provider || "google-gemini";
  const riskLevel = String(insights?.riskLevel || "medium").toLowerCase();
  const signals = Array.isArray(insights?.keySignals) ? insights.keySignals : [];
  const recommendations = Array.isArray(insights?.recommendations) ? insights.recommendations : [];

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-orange-500/20 bg-gradient-to-br from-bg-800 via-bg-900 to-black shadow-ember">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,122,0,0.18),transparent_28%)]" />
      <div className="relative p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Pill warm>AI Analyst</Pill>
              <Pill>{provider}</Pill>
              <Pill>Risk: {riskLevel}</Pill>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-text-100">
              {insights?.title || "AI-generated DPI summary"}
            </h2>
          </div>
          {insights?.generatedAt ? (
            <div className="text-xs text-text-300 font-mono">
              {new Date(insights.generatedAt).toLocaleString()}
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-orange-500/20 bg-black/20 p-4 text-text-200">
            Generating analyst summary with Google Gemini...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">
            {error}
          </div>
        ) : insights ? (
          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-4">
              <div className={`rounded-2xl border p-4 ${riskStyles[riskLevel] || riskStyles.medium}`}>
                <div className="text-xs uppercase tracking-[0.24em] opacity-70 mb-2">Executive Summary</div>
                <p className="text-sm md:text-base leading-7 text-text-100">
                  {insights.executiveSummary || "No summary returned by the model."}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-text-300 mb-3">Blocked Impact</div>
                <p className="text-sm leading-7 text-text-100">
                  {insights.blockedImpact || "No blocked-impact narrative available."}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-text-300 mb-3">Key Signals</div>
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

              <div className="rounded-2xl border border-border bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-text-300 mb-3">Next Steps</div>
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

              {insights.notes ? (
                <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm text-orange-50/90">
                  {insights.notes}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-orange-500/20 bg-black/20 p-4 text-text-300">
            Run a DPI analysis to generate an AI summary.
          </div>
        )}
      </div>
    </section>
  );
}