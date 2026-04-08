import { NavLink } from "react-router-dom";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition ${
          isActive
            ? "bg-bg-700 text-white border border-border shadow-sm"
            : "text-text-200 hover:bg-bg-800/80 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`h-2 w-2 rounded-full ${isActive ? "bg-accent-500" : "bg-border"}`} />
          {children}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-72 shrink-0 border-r border-border/80 bg-[#091018] p-5 flex flex-col gap-6 shadow-[inset_-1px_0_0_rgba(255,255,255,0.03)]">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-500/15 border border-accent-500/25 text-accent-500 font-black text-lg">
          DPI
        </div>
        <div>
          <div className="text-2xl font-black leading-tight tracking-tight">DPI Dashboard</div>
          <div className="text-xs uppercase tracking-[0.28em] text-text-300 mt-1">Deep Packet Inspection</div>
        </div>
      </div>

      <nav className="space-y-4">
        <div>
          <div className="px-4 text-[11px] uppercase tracking-[0.32em] text-text-300 mb-2">Overview</div>
          <div className="space-y-2">
            <NavItem to="/dashboard">Dashboard</NavItem>
            <NavItem to="/analysis">Analysis</NavItem>
            <NavItem to="/reports">Reports</NavItem>
          </div>
        </div>
      </nav>

      <div className="mt-auto rounded-3xl border border-border/70 bg-bg-800/70 p-4">
        <div className="text-[11px] uppercase tracking-[0.28em] text-text-300">Live status</div>
        <div className="mt-2 text-lg font-semibold text-white">Workspace ready</div>
        <div className="mt-1 text-sm text-text-300">Local engine and AI summary are available.</div>
      </div>
    </aside>
  );
}