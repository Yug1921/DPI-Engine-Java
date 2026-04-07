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
    <div className="bg-bg-800 border border-border rounded-2xl p-4 min-h-[220px]">
      <h3 className="text-2xl font-semibold mb-4">Controls</h3>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {AVAILABLE_APPS.map((app) => {
          const checked = selectedApps.includes(app);
          return (
            <label
              key={app}
              className={`flex items-center gap-2 px-2 py-1 rounded ${
                loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:bg-bg-700/50"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={loading}
                onChange={() => toggleApp(app)}
                className="accent-cyan-400"
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