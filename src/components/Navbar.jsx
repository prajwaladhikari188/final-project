import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  PlusCircle,
  ShoppingCart,
  User,
  LogOut,
  AlertTriangle,
  ExternalLink,
  Store,
  ChevronDown,
  CheckCircle2
} from "lucide-react";
import { useApp } from "../context/AppContext";

const Navbar = ({ onOpenSidebar, onOpenAddProduct }) => {
  const { currentUser, logout, products, settings } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const lowStockItems = products.filter(
    (p) => p.stock <= (p.minStock || settings.lowStockThreshold || 5)
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/inventory?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Page Breadcrumb */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Store className="w-4 h-4 text-blue-600" />
            {settings.shopName}
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-600">
            Kathmandu Branch
          </span>
        </div>
      </div>

      {/* Middle: Universal Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search spare parts (e.g. Brake pad, Pulsar, Motul)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none transition shadow-2xs"
          />
        </form>
      </div>

      {/* Right: Quick POS, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action: New POS Bill */}
        {currentUser?.role === "admin" && (
          <button
            onClick={() => navigate("/billing")}
            className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition transform active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>POS Register</span>
          </button>
        )}

        {/* Notifications: Low Stock Alert */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Stock Notifications"
          >
            <Bell className="w-5 h-5" />
            {lowStockItems.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-fade-in">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-bold text-slate-800">
                    Inventory Alerts ({lowStockItems.length})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate("/inventory?status=low");
                  }}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {lowStockItems.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                    All spare parts are sufficiently stocked!
                  </div>
                ) : (
                  lowStockItems.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setShowNotifications(false);
                        navigate("/inventory");
                      }}
                      className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {item.bikeModel} · {item.rackLocation}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            item.stock === 0
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.stock} left
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <img
              src={
                currentUser?.avatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              }
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser?.name || "Admin"}
              </p>
              <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
                {currentUser?.role || "Staff"}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/settings");
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Account & Shop Profile
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/login");
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-blue-600 hover:bg-blue-50 flex items-center gap-2 font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Switch Role / Login Screen
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                    navigate("/login");
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
