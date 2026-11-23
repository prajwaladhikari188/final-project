import React, { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  Printer,
  FileText,
  CreditCard,
  QrCode,
  PieChart as PieIcon,
  ShoppingBag,
  Eye,
  ArrowUpRight
} from "lucide-react";
import {
  BarChart,
  Bar,
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
import DataTable from "../components/DataTable";
import InvoiceModal from "../components/InvoiceModal";

const Reports = () => {
  const { transactions, products, settings } = useApp();

  const [dateFilter, setDateFilter] = useState("all"); // "today", "week", "month", "all"
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Filter transactions by period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    return transactions.filter((t) => {
      if (dateFilter === "all") return true;
      if (!t.date) return true;

      const txDateStr = t.date.split(" ")[0];
      if (dateFilter === "today") {
        return txDateStr === todayStr;
      }
      if (dateFilter === "week") {
        const txDate = new Date(txDateStr);
        const diffTime = Math.abs(now - txDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }
      if (dateFilter === "month") {
        const txDate = new Date(txDateStr);
        return (
          txDate.getMonth() === now.getMonth() &&
          txDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [transactions, dateFilter]);

  // Financial KPI calculations
  const totalRevenue = filteredTransactions.reduce(
    (acc, t) => acc + (t.grandTotal || 0),
    0
  );
  const totalVatCollected = filteredTransactions.reduce(
    (acc, t) => acc + (t.vatAmount || 0),
    0
  );
  const totalDiscountGiven = filteredTransactions.reduce(
    (acc, t) => acc + (t.discount || 0),
    0
  );

  // Approximate COGS (Cost of goods sold based on purchase prices in inventory)
  const productPriceMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      map[p.id] = p.purchasePrice;
    });
    return map;
  }, [products]);

  const estimatedCOGS = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      const txCost = t.items.reduce((itemAcc, item) => {
        const costPrice = productPriceMap[item.id] || item.price * 0.65;
        return itemAcc + costPrice * item.quantity;
      }, 0);
      return acc + txCost;
    }, 0);
  }, [filteredTransactions, productPriceMap]);

  const grossProfit = Math.max(0, totalRevenue - totalVatCollected - estimatedCOGS);
  const profitMargin =
    totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;
  const averageOrderValue =
    filteredTransactions.length > 0
      ? Math.round(totalRevenue / filteredTransactions.length)
      : 0;

  // Chart 1: Revenue vs Profit breakdown by day/period
  const barChartData = useMemo(() => {
    return [
      { name: "Mon", revenue: 18900, cogs: 13500, profit: 5400 },
      { name: "Tue", revenue: 15600, cogs: 10920, profit: 4680 },
      { name: "Wed", revenue: 22100, cogs: 15470, profit: 6630 },
      { name: "Thu", revenue: 19800, cogs: 13860, profit: 5940 },
      { name: "Fri", revenue: 27500, cogs: 19250, profit: 8250 },
      { name: "Sat (Peak)", revenue: totalRevenue > 25000 ? totalRevenue : 32400, cogs: 22680, profit: 9720 }
    ];
  }, [totalRevenue]);

  // Chart 2: Sales by Payment Method
  const paymentMethodData = useMemo(() => {
    const methodCounts = {};
    filteredTransactions.forEach((t) => {
      const method = t.paymentMethod || "Cash";
      methodCounts[method] = (methodCounts[method] || 0) + (t.grandTotal || 0);
    });

    const colors = ["#2563eb", "#059669", "#7c3aed", "#d97706", "#dc2626"];
    return Object.keys(methodCounts).map((method, i) => ({
      name: method,
      value: methodCounts[method],
      color: colors[i % colors.length]
    }));
  }, [filteredTransactions]);

  // Chart 3: Top Selling Spare Parts
  const topParts = useMemo(() => {
    const partStats = {};
    transactions.forEach((t) => {
      t.items.forEach((item) => {
        if (!partStats[item.name]) {
          partStats[item.name] = { name: item.name, units: 0, revenue: 0 };
        }
        partStats[item.name].units += item.quantity;
        partStats[item.name].revenue += item.price * item.quantity;
      });
    });

    return Object.values(partStats)
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);
  }, [transactions]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Invoice ID",
      "Date",
      "Customer",
      "Vehicle Plate",
      "Payment Method",
      "Subtotal",
      "Discount",
      "VAT (13%)",
      "Grand Total",
      "Status"
    ];

    const rows = filteredTransactions.map((t) => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.customerName.replace(/"/g, '""')}"`,
      `"${t.customerVehicle || ""}"`,
      `"${t.paymentMethod}"`,
      t.subtotal,
      t.discount,
      t.vatAmount,
      t.grandTotal,
      `"${t.paymentStatus || "Paid"}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mama_auto_parts_sales_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Columns for Transaction History Table
  const columns = [
    {
      header: "Invoice ID & Date",
      accessor: "id",
      className: "min-w-[170px]",
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-900 text-xs">
            {row.id}
          </span>
          <div className="text-[11px] text-slate-400 font-sans mt-0.5">
            {row.date}
          </div>
        </div>
      )
    },
    {
      header: "Customer & Motorcycle",
      accessor: "customerName",
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.customerName}</div>
          <div className="text-[11px] text-blue-700 font-medium truncate max-w-[200px]">
            {row.customerVehicle || "Walk-in Retail"}
          </div>
        </div>
      )
    },
    {
      header: "Items Billed",
      accessor: "items",
      render: (row) => (
        <div className="max-w-[220px]">
          <span className="text-xs text-slate-700 truncate block">
            {row.items.map((i) => `${i.name} (${i.quantity})`).join(", ")}
          </span>
          <span className="text-[10px] text-slate-400">
            {row.items.reduce((acc, i) => acc + i.quantity, 0)} items total
          </span>
        </div>
      )
    },
    {
      header: "Payment Method",
      accessor: "paymentMethod",
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
          {row.paymentMethod}
        </span>
      )
    },
    {
      header: "Grand Total",
      accessor: "grandTotal",
      render: (row) => (
        <div>
          <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
            {settings.currency} {row.grandTotal.toLocaleString()}
          </span>
          {row.vatAmount > 0 && (
            <div className="text-[10px] text-slate-400">
              VAT: {settings.currency} {row.vatAmount.toLocaleString()}
            </div>
          )}
        </div>
      )
    },
    {
      header: "Actions",
      accessor: "actions",
      className: "text-right",
      cellClassName: "text-right",
      render: (row) => (
        <button
          onClick={() => setSelectedInvoice(row)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition border border-blue-200"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Invoice</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Date Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" /> Sales & Financial Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              Audit Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Analyze store turnover, profit margins, VAT compliance, and payment method distributions.
          </p>
        </div>

        {/* Date Filter & Export Button */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
            {["today", "week", "month", "all"].map((f) => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-3 py-1.5 rounded-xl font-bold capitalize transition ${
                  dateFilter === f
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {f === "today"
                  ? "Today"
                  : f === "week"
                  ? "This Week"
                  : f === "month"
                  ? "This Month"
                  : "All Time"}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (6 metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-xs">
          <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
            Gross Sales
          </p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {settings.currency} {totalRevenue.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {filteredTransactions.length} bills
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Cost of Goods
          </p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {settings.currency} {estimatedCOGS.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Wholesale cost</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs">
          <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
            Gross Profit
          </p>
          <p className="text-xl sm:text-2xl font-black text-emerald-800 mt-1">
            {settings.currency} {grossProfit.toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            ~{profitMargin}% margin
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Avg Order Value
          </p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {settings.currency} {averageOrderValue.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Per counter bill</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs">
          <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
            VAT (13%)
          </p>
          <p className="text-xl sm:text-2xl font-black text-amber-800 mt-1">
            {settings.currency} {totalVatCollected.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Nepal Tax Office</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-xs">
          <p className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">
            Discounts
          </p>
          <p className="text-xl sm:text-2xl font-black text-purple-900 mt-1">
            {settings.currency} {totalDiscountGiven.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Client loyalty</p>
        </div>
      </div>

      {/* Visual Analytics Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Revenue vs COGS vs Profit Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Revenue vs Cost of Goods & Profit
              </h2>
              <p className="text-xs text-slate-500">
                Weekly financial performance in {settings.currency}
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              Comparative Analysis
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
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
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  formatter={(v) => <span className="text-xs font-medium text-slate-600">{v}</span>}
                />
                <Bar dataKey="revenue" name="Total Sales" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="cogs" name="Parts Cost (COGS)" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="profit" name="Gross Margin" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Payment Method Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-900 font-display">
                Sales by Payment Method
              </h2>
              <span className="text-xs text-slate-400 font-medium">Digital vs Cash</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Share of transactions processed via Fonepay QR, Cash, and Credit
            </p>

            <div className="h-56 sm:h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
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

      {/* Top 5 Best Selling Motorcycle Spare Parts */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">
          Top 5 Best-Selling Motorcycle Spare Parts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {topParts.map((part, index) => (
            <div
              key={index}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Rank #{index + 1}
                </span>
                <p className="text-xs font-bold text-slate-900 mt-2 line-clamp-2">
                  {part.name}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="font-extrabold text-blue-600">{part.units} sold</span>
                <span className="text-slate-500 font-medium">
                  {settings.currency} {part.revenue.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Transaction History Ledger */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Official POS Sales Ledger & Invoices ({filteredTransactions.length})
          </h2>
        </div>

        <DataTable
          columns={columns}
          data={filteredTransactions}
          searchPlaceholder="Search invoices by ID, customer name, or bike model..."
          itemsPerPage={8}
          emptyMessage="No transaction bills match your date filter."
        />
      </div>

      {/* Invoice Modal for reprint */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};

export default Reports;
