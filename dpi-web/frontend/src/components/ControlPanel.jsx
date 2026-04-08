const AVAILABLE_APPS = ["YouTube", "TikTok", "Netflix", "Instagram", "Discord"];

export default function ControlPanel({
  selectedApps = [],
  setSelectedApps,
  onRun,
  loading = false
}) {
  const toggleApp = (app) => {
    if (loading) return;
    setSelectedApps((prev) =>
      prev.includes(app) ? prev.filter((x) => x !== app) : [...prev, app]
    );
  };

  return (
    <div className="rounded-[24px] border border-border/80 bg-bg-800/80 p-5 shadow-panel min-h-[220px]">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-text-300 mb-1">Rules</div>
          <h3 className="text-2xl font-semibold">Controls</h3>
        </div>
        <div className="rounded-full border border-border bg-bg-900 px-3 py-1 text-xs text-text-300">
          blocklist
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {AVAILABLE_APPS.map((app) => {
          const checked = selectedApps.includes(app);
          return (
            <label
              key={app}
              className={`flex items-center gap-2 px-3 py-2 rounded-2xl border border-transparent ${
                loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:bg-bg-700/50"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={loading}
                onChange={() => toggleApp(app)}
                className="accent-accent-500"
              />
              <span>{app}</span>
            </label>
          );
        })}
      </div>

      <div className="text-sm text-text-300 mb-3">
        Selected to block:{" "}
        <span className="text-text-100 font-medium">
          {selectedApps.length ? selectedApps.join(", ") : "None"}
        </span>
      </div>

      <button
        type="button"
        onClick={onRun}
        disabled={loading}
        className={`px-5 py-2 rounded font-semibold transition ${
          loading
            ? "bg-gray-500 text-gray-100 cursor-not-allowed"
            : "bg-accent-500 text-black hover:brightness-110"
        }`}
      >
        {loading ? "Running DPI... please wait" : "Run DPI Analysis"}
      </button>
    </div>
  );
}