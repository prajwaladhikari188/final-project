import React, { useState, useEffect } from "react";
import { X, Truck, Save } from "lucide-react";

const SupplierModal = ({ isOpen, onClose, onSave, supplierToEdit = null }) => {
  const initialForm = {
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    panNumber: "",
    categories: "",
    balance: 0,
    status: "Active"
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (supplierToEdit) {
      setFormData(supplierToEdit);
    } else {
      setFormData(initialForm);
    }
    setErrors({});
  }, [supplierToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-fade-in">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {supplierToEdit ? "Edit Supplier Details" : "Add Spare Parts Supplier"}
              </h2>
              <p className="text-xs text-slate-400">
                Manage distributor accounts, payables, and supply lines
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supplier / Company Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Himalayan Moto Spares Wholesalers"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              className={`w-full px-3.5 py-2 rounded-xl border ${
                errors.companyName ? "border-red-500 bg-red-50" : "border-slate-200"
              } focus:border-blue-500 outline-none transition`}
            />
            {errors.companyName && (
              <p className="text-[11px] text-red-500 mt-1">{errors.companyName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person Name
              </label>
              <input
                type="text"
                placeholder="e.g. Surendra Tuladhar"
                value={formData.contactPerson}
                onChange={(e) =>
                  setFormData({ ...formData, contactPerson: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                placeholder="e.g. 01-4256789 / 9851022334"
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="himalayan.spares@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                PAN / VAT Number
              </label>
              <input
                type="text"
                placeholder="PAN: 301298455"
                value={formData.panNumber}
                onChange={(e) =>
                  setFormData({ ...formData, panNumber: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Office / Warehouse Address
            </label>
            <input
              type="text"
              placeholder="e.g. Teku Auto Spares Market, Kathmandu"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Parts / Categories Supplied
            </label>
            <input
              type="text"
              placeholder="e.g. Brake Pads, Rolon Chains, Motul Oils, Exide Batteries"
              value={formData.categories}
              onChange={(e) =>
                setFormData({ ...formData, categories: e.target.value })
              }
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payable Outstanding Balance (Rs.)
              </label>
              <input
                type="number"
                placeholder="0"
                value={formData.balance}
                onChange={(e) =>
                  setFormData({ ...formData, balance: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition bg-white"
              >
                <option value="Active">Active Supplier</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{supplierToEdit ? "Update Supplier" : "Save Supplier"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierModal;
