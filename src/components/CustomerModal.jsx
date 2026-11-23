import React, { useState, useEffect } from "react";
import { X, UserPlus, Save } from "lucide-react";

const CustomerModal = ({ isOpen, onClose, onSave, customerToEdit = null }) => {
  const initialForm = {
    name: "",
    phone: "",
    email: "",
    address: "",
    vehicle: "",
    balance: 0,
    notes: ""
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customerToEdit) {
      setFormData(customerToEdit);
    } else {
      setFormData(initialForm);
    }
    setErrors({});
    setSaveError("");
  }, [customerToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Customer name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveError("");
    try {
      const saved = await onSave(formData);
      if (saved === false) {
        setSaveError("The customer was not saved. Review the error notification and try again.");
        return;
      }
      onClose();
    } catch (error) {
      setSaveError(error.message || "The customer could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-fade-in">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {customerToEdit ? "Edit Customer Record" : "Register New Customer"}
              </h2>
              <p className="text-xs text-slate-400">
                Track customer bike history, dues, and contact details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {saveError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">{saveError}</p>}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Bikram Thapa"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3.5 py-2 rounded-xl border ${
                errors.name ? "border-red-500 bg-red-50" : "border-slate-200"
              } focus:border-blue-500 outline-none transition`}
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                placeholder="e.g. 9841234567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3.5 py-2 rounded-xl border ${
                  errors.phone ? "border-red-500 bg-red-50" : "border-slate-200"
                } focus:border-blue-500 outline-none transition`}
              />
              {errors.phone && (
                <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="bikram@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Motorcycle Details (Model & Number Plate)
            </label>
            <input
              type="text"
              placeholder="e.g. Ba 2 Pa 7845 - Bajaj Pulsar 220F"
              value={formData.vehicle}
              onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Address / City
              </label>
              <input
                type="text"
                placeholder="e.g. Kalanki, Kathmandu"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Credit / Balance Due (Rs.)
              </label>
              <input
                type="number"
                placeholder="0"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer Notes / Preferences
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Frequent engine oil service, prefers Motul 7100..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition text-xs"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving…" : customerToEdit ? "Update Customer" : "Save Customer"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
