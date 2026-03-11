import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuthStore";
import { useState } from "react";
import clsx from "clsx";

const navItems = [
  { to: "/", label: "Dashboard", icon: "chart-pie" },
  { to: "/accounts", label: "Accounts", icon: "book-open" },
  { to: "/transactions", label: "Transactions", icon: "arrows-right-left" },
  { to: "/invoices", label: "Invoices", icon: "document-text" },
  { to: "/contacts", label: "Contacts", icon: "users" },
  { to: "/reports", label: "Reports", icon: "chart-bar" },
];

export function Layout() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={clsx(
          "bg-gray-900 text-white flex flex-col transition-all duration-200",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && (
            <span className="text-lg font-bold text-brand-400">Common Cents</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white p-1"
          >
            {sidebarOpen ? "\u2190" : "\u2192"}
          </button>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                clsx(
                  "flex items-center px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )
              }
            >
              <span className="truncate">{sidebarOpen ? item.label : item.label[0]}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          {sidebarOpen && (
            <p className="text-xs text-gray-400 mb-2 truncate">{user?.email}</p>
          )}
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            {sidebarOpen ? "Sign out" : "\u2190"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
