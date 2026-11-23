import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Boxes,
  Layers,
  AlertTriangle,
  Users,
  Truck,
  TrendingUp,
  CreditCard,
  ShoppingCart,
  PlusCircle,
  ArrowUpRight,
  Printer,
  ChevronRight,
  Eye,
  CheckCircle2,
  Calendar
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { useApp } from "../context/AppContext";
import StatCard from "../components/StatCard";
import InvoiceModal from "../components/InvoiceModal";
import ProductModal from "../components/ProductModal";
import CustomerModal from "../components/CustomerModal";

const Dashboard = () => {
  const {
    products,
    customers,
    suppliers,
    transactions,
    settings,
    addProduct,
    addCustomer
  } = useApp();
  const navigate = useNavigate();

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // 1. Metric Calculations
  const totalProducts = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const lowStockProducts = products.filter(
    (p) => p.stock <= (p.minStock || settings.lowStockThreshold || 5)
  );
  const totalCustomers = customers.length;
  const totalSuppliers = suppliers.length;

  // Calculate Today's Sales
  const todayStr = new Date().toISOString().split("T")[0];
  const todayTransactions = transactions.filter((t) => t.date.startsWith(todayStr));
  const todaySales = todayTransactions.reduce((acc, t) => acc + (t.grandTotal || 0), 0);

  // All time revenue and approximate profit
  const totalSalesRevenue = transactions.reduce((acc, t) => acc + (t.grandTotal || 0), 0);
  
  // Approximate inventory purchase value vs selling value
  const totalInventoryCost = products.reduce(
    (acc, p) => acc + p.purchasePrice * p.stock,
    0
  );
  const totalInventoryRetail = products.reduce(
    (acc, p) => acc + p.sellingPrice * p.stock,
    0
  );

  const salesByDate = transactions.reduce((totals, transaction) => {
    const date = transaction.date?.split(" ")[0];
    if (date) totals[date] = (totals[date] || 0) + (transaction.grandTotal || 0);
    return totals;
  }, {});
  const salesChartData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return {
      day: date.toLocaleDateString(undefined, { weekday: "short" }),
      sales: salesByDate[key] || 0
    };
  });

  // 3. Category Pie Chart Data
  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.stock;
    return acc;
  }, {});

  const pieColors = [
    "#2563eb",
    "#059669",
    "#d97706",
    "#dc2626",
    "#7c3aed",
    "#0891b2",
    "#ea580c",
    "#4b5563"
  ];

  const pieData = Object.keys(categoryCounts)
    .slice(0, 6)
    .map((cat, i) => ({
      name: cat,
      value: categoryCounts[cat],
      color: pieColors[i % pieColors.length]
    }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
              MAMA AUTO PARTS Dashboard
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              <Calendar className="w-3 h-3" /> Live Inventory
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Teku / Balaju Branch · Real-time inventory status, customer billing & store performance
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => navigate("/billing")}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition transform active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>POS Billing</span>
          </button>

          <button
            onClick={() => setIsProductModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            <span>Add Part</span>
          </button>

          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards (8 key metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={`${settings.currency} ${todaySales.toLocaleString()}`}
          subtext={`${todayTransactions.length} bills generated today`}
          icon={TrendingUp}
          color="emerald"
          onClick={() => navigate("/reports")}
        />

        <StatCard
          title="Total Products"
          value={totalProducts}
          subtext={`${totalStockUnits} total units in stock`}
          icon={Boxes}
          color="blue"
          onClick={() => navigate("/inventory")}
        />

        <StatCard
          title="Low Stock Alert"
          value={lowStockProducts.length}
          subtext="Requires reordering soon"
          icon={AlertTriangle}
          color={lowStockProducts.length > 0 ? "red" : "emerald"}
          trend={lowStockProducts.length > 0 ? "Urgent Reorder" : "All Stocked"}
          trendPositive={lowStockProducts.length === 0}
          onClick={() => navigate("/inventory?status=low")}
        />

        <StatCard
          title="Total Customers"
          value={totalCustomers}
          subtext={`${customers.filter((c) => c.balance > 0).length} with due balance`}
          icon={Users}
          color="purple"
          onClick={() => navigate("/customers")}
        />

        <StatCard
          title="Total Suppliers"
          value={totalSuppliers}
          subtext="Active distributors & vendors"
          icon={Truck}
          color="amber"
          onClick={() => navigate("/suppliers")}
        />

        <StatCard
          title="Gross Sales (All-Time)"
          value={`${settings.currency} ${totalSalesRevenue.toLocaleString()}`}
          subtext={`${transactions.length} total invoices on file`}
          icon={CreditCard}
          color="navy"
          onClick={() => navigate("/reports")}
        />

        <StatCard
          title="Inventory Purchase Value"
          value={`${settings.currency} ${totalInventoryCost.toLocaleString()}`}
          subtext="Capital tied in stock"
          icon={Layers}
          color="blue"
        />

        <StatCard
          title="Potential Retail Value"
          value={`${settings.currency} ${totalInventoryRetail.toLocaleString()}`}
          subtext={`Est. Margin: ${settings.currency} ${(
            totalInventoryRetail - totalInventoryCost
          ).toLocaleString()}`}
          icon={ArrowUpRight}
          color="emerald"
        />
      </div>

      {/* Visual Analytics Row: 7-Day Trend & Stock by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 7-Day Sales Area Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Weekly Revenue
              </h2>
              <p className="text-xs text-slate-500">
                POS revenue recorded during the last seven days
              </p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${settings.currency} ${val.toLocaleString()}`]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Sales Revenue"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Category Distribution Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-900 font-display">
                Stock by Category
              </h2>
              <span className="text-xs text-slate-400 font-medium">Units Breakdown</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Distribution of inventory volume across spare part categories
            </p>

            <div className="h-56 sm:h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} units`, name]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#f8fafc",
                      fontSize: "12px"
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => <span className="text-xs text-slate-600 font-medium">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Low Stock Quick List & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Low Stock Critical Alerts (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-100 text-red-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                Low Stock Urgent Alerts ({lowStockProducts.length})
              </h2>
            </div>
            <button
              onClick={() => navigate("/inventory?status=low")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              Inventory <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto max-h-80">
            {lowStockProducts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Stock Levels Optimal</p>
                <p className="text-slate-400">All spare parts are above minimum alert thresholds.</p>
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3 group">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {p.bikeModel} · <span className="font-mono text-slate-600">{p.rackLocation}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        p.stock === 0
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {p.stock} in stock
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Min: {p.minStock}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Recent Invoices / Transactions (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                Recent POS Sales & Bills
              </h2>
            </div>
            <button
              onClick={() => navigate("/reports")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              All Invoices <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="py-2.5">Invoice ID</th>
                  <th className="py-2.5">Customer & Bike</th>
                  <th className="py-2.5">Method</th>
                  <th className="py-2.5 text-right">Amount</th>
                  <th className="py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.slice(0, 5).map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 font-mono font-bold text-slate-800">
                      {inv.id}
                      <div className="text-[10px] text-slate-400 font-sans font-normal">
                        {inv.date}
                      </div>
                    </td>
                    <td className="py-3">
                      <p className="font-semibold text-slate-800">{inv.customerName}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-44">
                        {inv.customerVehicle || "Walk-in Customer"}
                      </p>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 text-right font-extrabold text-slate-900">
                      {settings.currency} {inv.grandTotal.toLocaleString()}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                        title="View / Print Tax Bill"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invoice Modal for reprinting / viewing bill */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* Add Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={addProduct}
      />

      {/* Add Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={addCustomer}
      />
    </div>
  );
};

export default Dashboard;
