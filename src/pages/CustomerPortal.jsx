import React, { useState, useMemo } from "react";
import {
  Bike,
  Search,
  ShoppingCart,
  FileText,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Eye,
  MessageSquare,
  Wrench,
  ShieldCheck,
  Phone
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { CATEGORIES } from "../data/demoData";
import InvoiceModal from "../components/InvoiceModal";

const CustomerPortal = () => {
  const { currentUser, products, transactions, settings, customers, showToast } = useApp();

  const [activeTab, setActiveTab] = useState("catalog"); // "catalog" or "orders"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Find customer account details
  const customerAccount = useMemo(() => {
    if (!currentUser) return null;
    return (
      customers.find(
        (c) =>
          c.id === currentUser.customerId ||
          (c.phone && c.phone === currentUser.phone) ||
          c.email === currentUser.email
      ) || customers[0]
    );
  }, [currentUser, customers]);

  // Customer Invoices
  const myInvoices = useMemo(() => {
    if (!customerAccount) return [];
    return transactions.filter(
      (t) =>
        t.customerId === customerAccount.id ||
        t.customerPhone === customerAccount.phone ||
        t.customerName?.toLowerCase() === customerAccount.name?.toLowerCase()
    );
  }, [customerAccount, transactions]);

  // Filter Catalog
  const filteredParts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.bikeModel && p.bikeModel.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === "All Categories" || p.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleInquiry = (part) => {
    showToast(`Inquiry sent for "${part.name}". Our shop desk will assist you on ${settings.phone}!`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Customer Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
            <Bike className="w-3.5 h-3.5" /> Customer Account Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight">
            Namaste, {customerAccount?.name || "Rider"}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-2">
            <span className="font-semibold text-blue-400">Registered Bike:</span>
            <span>{customerAccount?.vehicle || "Bajaj Pulsar 220F"}</span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Phone: {customerAccount?.phone} · Location: {customerAccount?.address || "Kathmandu"}
          </p>
        </div>

        {/* Balance Card */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 min-w-[220px]">
          <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
            Outstanding Store Due
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {settings.currency} {(customerAccount?.balance || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-blue-200 mt-1">
            {customerAccount?.balance > 0
              ? "Payable at shop or via Fonepay"
              : "Account clear · No pending dues"}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex p-1 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-md text-xs font-bold">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === "catalog"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Spare Parts Catalog ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === "orders"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>My Invoices & Bills ({myInvoices.length})</span>
        </button>
      </div>

      {/* Tab 1: Catalog */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          {/* Search & Category Pills */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search genuine parts for your bike (e.g. Brake pad, Motul oil, Clutch plate)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition ${
                    selectedCategory === cat
                      ? "bg-slate-900 text-white font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Parts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParts.map((part) => {
              const isAvailable = part.stock > 0;
              return (
                <div
                  key={part.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-blue-300 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {part.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isAvailable
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isAvailable ? "In Stock at Teku Shop" : "Currently Out of Stock"}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mt-3 line-clamp-2">
                      {part.name}
                    </h3>

                    <p className="text-xs text-blue-700 font-semibold mt-1 flex items-center gap-1">
                      <Bike className="w-3.5 h-3.5" />
                      <span>{part.bikeModel || "Universal Motorcycle"}</span>
                    </p>

                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {part.description}
                    </p>

                    <div className="mt-2 text-[11px] text-slate-400">
                      Brand: <span className="font-semibold text-slate-700">{part.brand}</span> · Rack: {part.rackLocation}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400">Price:</span>
                      <p className="text-base font-extrabold text-blue-700">
                        {settings.currency} {part.sellingPrice.toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleInquiry(part)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-blue-600 transition flex items-center gap-1.5 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Inquire / Book</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: My Invoices */}
      {activeTab === "orders" && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Tax Invoices & Service Records ({myInvoices.length})
            </h2>
          </div>

          {myInvoices.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No invoices on record</p>
              <p className="text-xs text-slate-400">
                Purchases made at the store counter will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-slate-900 text-sm">
                        {inv.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inv.paymentStatus === "Paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {inv.paymentStatus || "Paid"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Date: {inv.date} · Cashier: {inv.cashier} · Paid via {inv.paymentMethod}
                    </p>
                    <p className="text-xs text-slate-700 font-medium mt-1">
                      Parts: {inv.items.map((i) => `${i.name} (×${i.quantity})`).join(", ")}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400">Total:</span>
                      <p className="text-base font-extrabold text-blue-700">
                        {settings.currency} {inv.grandTotal.toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View & Print</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};

export default CustomerPortal;
