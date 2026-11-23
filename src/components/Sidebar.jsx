import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Users,
  Truck,
  BarChart3,
  Settings,
  Wrench,
  AlertTriangle,
  LogOut,
  Bike,
  ShieldCheck,
  X,
  User
} from "lucide-react";
import { useApp } from "../context/AppContext";

const Sidebar = ({ isOpen, onClose }) => {
  const { currentUser, logout, products, settings } = useApp();
  const navigate = useNavigate();

  // Calculate low stock count for alert badge
  const lowStockCount = products.filter(
    (p) => p.stock <= (p.minStock || settings.lowStockThreshold || 5)
  ).length;

  const isAdmin = currentUser?.role === "admin";

  const adminNavItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    {
      name: "Inventory",
      path: "/inventory",
      icon: Boxes,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: "bg-red-500 text-white"
    },
    { name: "POS / Billing", path: "/billing", icon: ShoppingCart, highlight: true },
    { name: "Customers", path: "/customers", icon: Users },
    { name: "Suppliers", path: "/suppliers", icon: Truck },
    { name: "Reports", path: "/reports", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings }
  ];

  const navItems = adminNavItems;

  const handleLogout = () => {
    void logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Bike className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="font-display font-extrabold text-lg text-white tracking-wider flex items-center gap-1.5">
                MAMA <span className="text-blue-400">AUTO</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Bike Spares · Nepal
              </p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Mode Indicator / Switcher */}
        <div className="px-5 py-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isAdmin ? "bg-emerald-400 animate-pulse" : "bg-blue-400"
                }`}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Admin Panel
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.highlight && !item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    POS
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Business PAN & Status Banner */}
        <div className="px-5 py-2">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Registered Business</span>
            </div>
            <div className="text-[11px] text-slate-400">{settings.panNumber}</div>
            <div className="text-[10px] text-slate-500 truncate mt-0.5">
              Kathmandu, Nepal · 13% VAT
            </div>
          </div>
        </div>

        {/* User Profile & Logout at Bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white ring-2 ring-blue-500/40">
                <User className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {currentUser?.name || currentUser?.email || "Signed-in staff"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentUser?.email || "Signed in"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
