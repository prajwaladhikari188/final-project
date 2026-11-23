import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Store,
  Receipt,
  Save,
  Download
} from "lucide-react";
import { useApp } from "../context/AppContext";

const Settings = () => {
  const {
    settings,
    updateSettings,
    products,
    customers,
    suppliers,
    transactions,
    showToast
  } = useApp();

  const [formData, setFormData] = useState(settings);
  const [activeTab, setActiveTab] = useState("business");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const saved = await updateSettings(formData);
    if (saved) setFormData(saved);
  };

  const handleExportData = () => {
    const backupData = {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      settings,
      products,
      customers,
      suppliers,
      transactions
    };

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `mama_auto_parts_backup_${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Operational data export downloaded as JSON.");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight flex items-center gap-2">
              <SettingsIcon className="w-6 h-6 text-blue-600" /> Store Settings & Configuration
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              System v1.0
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Customize shop identity, PAN/VAT parameters, and invoice terms saved in MariaDB.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition transform active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-lg text-xs font-bold">
        <button
          onClick={() => setActiveTab("business")}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === "business"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Business Info</span>
        </button>
        <button
          onClick={() => setActiveTab("tax")}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === "tax"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>VAT & Billing</span>
        </button>
        <button
          onClick={() => setActiveTab("backup")}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === "backup"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Data Export</span>
        </button>
      </div>

      {/* Tab 1: Business Information */}
      {activeTab === "business" && (
        <form
          onSubmit={handleSave}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5"
        >
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">
              Motorcycle Spare Parts Business Profile
            </h2>
            <p className="text-xs text-slate-500">
              Details appearing on printed tax invoices and header banners
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Trade Name *
              </label>
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-xs sm:text-sm font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                PAN / VAT Registration Number *
              </label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-xs sm:text-sm font-mono font-bold text-slate-900 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Shop Tagline / Slogan
            </label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Physical Address (Nepal) *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-xs sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone Numbers *
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-xs sm:text-sm font-bold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition"
            >
              Save Profile Settings
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Tax & Billing Settings */}
      {activeTab === "tax" && (
        <form
          onSubmit={handleSave}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5"
        >
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">
              Tax, Billing & Invoice Terms
            </h2>
            <p className="text-xs text-slate-500">
              Configure Nepal VAT calculations, threshold alerts, and warranty disclaimer notes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Enable Nepal VAT</h3>
                  <p className="text-[11px] text-slate-500">
                    Apply Value Added Tax automatically at POS register
                  </p>
                </div>
                <input
                  type="checkbox"
                  name="enableTax"
                  checked={formData.enableTax}
                  onChange={handleChange}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  VAT Rate Percentage (%)
                </label>
                <input
                  type="number"
                  name="vatRate"
                  min="0"
                  max="50"
                  value={formData.vatRate}
                  onChange={handleChange}
                  disabled={!formData.enableTax}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 disabled:opacity-40"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Nepal standard VAT rate is 13%.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-900">Inventory Alert Trigger</h3>
              <p className="text-[11px] text-slate-500">
                Flag spare parts as "Low Stock" when available units fall to this level
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Low Stock Threshold (Units)
                </label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  min="1"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Printed Invoice Return / Exchange Policy Note
            </label>
            <textarea
              rows={3}
              name="invoiceNote"
              value={formData.invoiceNote}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Invoice Footer Greeting
            </label>
            <input
              type="text"
              name="invoiceFooter"
              value={formData.invoiceFooter}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-xs"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition"
            >
              Save Billing Settings
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Export persisted business data */}
      {activeTab === "backup" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">
              Export business data
            </h2>
            <p className="text-xs text-slate-500">
              This downloads the records currently loaded from MariaDB. Keep separate database backups for disaster recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Backup Export */}
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-md shadow-blue-500/20">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Download operational data</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Exports the loaded products, customers, suppliers, invoices, and settings. This JSON export is not a substitute for a database backup.
                </p>
              </div>

              <button
                onClick={handleExportData}
                className="mt-4 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export data (.JSON)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
