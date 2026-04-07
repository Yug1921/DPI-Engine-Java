import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar
} from "recharts";

const PIE_COLORS = [
  "#22d3ee", // cyan
  "#a78bfa", // violet
  "#f59e0b", // amber
  "#34d399", // emerald
  "#f43f5e", // rose
  "#60a5fa", // blue
  "#f97316", // orange
  "#84cc16", // lime
  "#e879f9", // fuchsia
  "#fb7185"  // pink
];

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
  const appData = normalizeAppData(applications);
  const threadData = normalizeThreadData(threadStats);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-bg-800 border border-border rounded-2xl p-4 min-h-[320px]">
        <h3 className="text-2xl font-semibold mb-4">Application Distribution</h3>

        {appData.length === 0 ? (
          <div className="text-text-300">No application data available</div>
        ) : (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={appData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={95}
                  innerRadius={35}
                  paddingAngle={2}
                  labelLine={false}
                >
                  {appData.map((_, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={PIE_COLORS[idx % PIE_COLORS.length]}
                      stroke="#0b1220"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: 10,
                    color: "#e2e8f0"
                  }}
                />
                <Legend wrapperStyle={{ color: "#cbd5e1" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-bg-800 border border-border rounded-2xl p-4 min-h-[320px]">
        <h3 className="text-2xl font-semibold mb-4">Thread Performance</h3>

        {threadData.length === 0 ? (
          <div className="text-text-300">No thread stats available</div>
        ) : (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={threadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: 10,
                    color: "#e2e8f0"
                  }}
                />
                <Bar dataKey="value" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}