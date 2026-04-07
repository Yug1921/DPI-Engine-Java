import { NavLink } from "react-router-dom";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-lg text-lg transition ${
          isActive
            ? "bg-bg-700 text-white border border-border"
            : "text-text-200 hover:bg-bg-800"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-border bg-bg-900 p-4 flex flex-col gap-6">
      <div>
        <div className="text-3xl font-extrabold leading-tight">DPI Dashboard</div>
        <div className="text-text-300 mt-1">Deep Packet Inspection</div>
      </div>

      <nav className="space-y-2">
        <NavItem to="/dashboard">Dashboard</NavItem>
        <NavItem to="/analysis">Analysis</NavItem>
        <NavItem to="/reports">Reports</NavItem>
      </nav>

      <div className="mt-auto text-xs text-text-300 border-t border-border pt-3">
        DPI Engine Web UI
      </div>
    </aside>
  );
}