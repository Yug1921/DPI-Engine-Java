import {
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  LineChart,
  Line
} from "recharts";

function normalizeAppData(applications = []) {
  return applications
    .map((a) => ({
      name: a?.name || a?.app || a?.application || "Unknown",
      value: Number(a?.count ?? a?.packets ?? a?.value ?? 0)
    }))
    .filter((x) => x.value > 0);
}

function normalizeThreadData(threadStats = {}) {
  return Object.entries(threadStats || {})
    .map(([name, value]) => ({
      name,
      value: Number(value || 0)
    }))
    .filter((x) => x.value > 0);
}

export default function ChartsPanel({ applications = [], threadStats = {} }) {
  const appData = normalizeAppData(applications).slice(0, 8);
  const threadData = normalizeThreadData(threadStats);

  const tooltipStyle = {
    background: "#0f1722",
    border: "1px solid #233244",
    borderRadius: 14,
    color: "#e8eef5",
    boxShadow: "0 18px 50px rgba(0,0,0,0.35)"
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-[24px] border border-border/80 bg-bg-800/80 p-5 shadow-panel min-h-[340px]">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-text-300 mb-1">Overview</div>
            <h3 className="text-2xl font-semibold">Traffic Trend</h3>
          </div>
          <div className="rounded-full border border-border bg-bg-900 px-3 py-1 text-xs text-text-300">
            last scan
          </div>
        </div>

        {appData.length === 0 ? (
          <div className="text-text-300">No application data available</div>
        ) : (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={appData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#223140" />
                <XAxis dataKey="name" stroke="#a9b4c2" tickLine={false} axisLine={false} />
                <YAxis stroke="#a9b4c2" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: "#cbd5e1" }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Packets"
                  stroke="#22c3ee"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#22c3ee", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="rounded-[24px] border border-border/80 bg-bg-800/80 p-5 shadow-panel min-h-[340px]">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-text-300 mb-1">Distribution</div>
            <h3 className="text-2xl font-semibold">Protocol Mix</h3>
          </div>
          <div className="rounded-full border border-border bg-bg-900 px-3 py-1 text-xs text-text-300">
            this run
          </div>
        </div>

        {threadData.length === 0 ? (
          <div className="text-text-300">No thread stats available</div>
        ) : (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={threadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#223140" />
                <XAxis dataKey="name" stroke="#a9b4c2" tickLine={false} axisLine={false} />
                <YAxis stroke="#a9b4c2" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: "#cbd5e1" }} />
                <Bar dataKey="value" name="Packets" fill="#3b82f6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}