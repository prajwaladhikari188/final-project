import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bike,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  Store,
  CheckCircle2,
  Key
} from "lucide-react";
import { useApp } from "../context/AppContext";

const Login = () => {
  const { login, customers } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("admin"); // "admin" or "customer"
  const [email, setEmail] = useState("admin@mamaautoparts.com.np");
  const [password, setPassword] = useState("admin123");
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]?.id || "");

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    login("admin", email);
    navigate("/");
  };

  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustomer) || customers[0];
    login("customer", cust.email, cust);
    navigate("/portal");
  };

  // Quick 1-click Demo Fill
  const handleQuickDemoAdmin = () => {
    login("admin", "admin@mamaautoparts.com.np");
    navigate("/");
  };

  const handleQuickDemoCustomer = (customerIndex = 0) => {
    const cust = customers[customerIndex] || customers[0];
    login("customer", cust.email, cust);
    navigate("/portal");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-navy-950 flex items-center justify-center p-4 sm:p-6 text-slate-100">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl">
        {/* Left Hero / Brand Showcase (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-blue-700 via-blue-800 to-slate-950 p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xl">
                <Bike className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="font-display font-extrabold text-2xl tracking-wider text-white">
                  MAMA <span className="text-blue-300">AUTO</span>
                </h1>
                <p className="text-[11px] text-blue-200 font-medium tracking-wider uppercase">
                  Bike Spares Management
                </p>
              </div>
            </div>

            <p className="text-sm text-blue-100 leading-relaxed font-normal">
              Complete inventory, POS billing, customer credit ledger, and financial reporting system engineered for Nepalese motorcycle workshops and spare parts businesses.
            </p>

            <div className="mt-8 space-y-3 text-xs text-blue-100/90">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>25+ Preloaded Motorcycle Spares</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant POS with 13% Nepal VAT & Fonepay</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Customer Due Balances & Bike Vehicle Log</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Persistent LocalStorage Demo Database</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-blue-500/30 text-[11px] text-blue-300 flex items-center justify-between">
            <span>Teku / Balaju, Kathmandu</span>
            <span className="font-mono bg-blue-900/60 px-2 py-0.5 rounded border border-blue-400/30">
              PAN: 601293847
            </span>
          </div>
        </div>

        {/* Right Login Forms (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-10 bg-slate-900 flex flex-col justify-center">
          {/* Role Tabs */}
          <div className="flex p-1 rounded-2xl bg-slate-800/80 border border-slate-700/60 mb-6">
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === "admin"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin / Staff Panel</span>
            </button>
            <button
              onClick={() => setActiveTab("customer")}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === "customer"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Customer Portal</span>
            </button>
          </div>

          {/* Admin Login Form */}
          {activeTab === "admin" && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Admin Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
              >
                <span>Enter Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Customer Login Form */}
          {activeTab === "customer" && (
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Registered Customer Account
                </label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:border-blue-500 outline-none transition"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.vehicle || "Motorcycle Owner"}) — Due: Rs.{" "}
                      {c.balance.toLocaleString()}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Customers can track parts compatibility, previous bills, and outstanding balance.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
              >
                <span>Enter Customer Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 1-Click Demo Login Box */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick 1-Click Demo Access:</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickDemoAdmin}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 text-left transition flex items-center gap-2.5 group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Demo Admin</div>
                  <div className="text-[10px] text-slate-400">Full Access</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoCustomer(0)}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 text-left transition flex items-center gap-2.5 group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Demo Customer</div>
                  <div className="text-[10px] text-slate-400">Bikram (Pulsar 220)</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
