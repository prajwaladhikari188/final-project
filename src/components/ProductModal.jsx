import React, { useState, useEffect } from "react";
import { X, Wrench, Save, Plus } from "lucide-react";
import { CATEGORIES } from "../data/appDefaults";

const ProductModal = ({ isOpen, onClose, onSave, productToEdit = null }) => {
  const initialForm = {
    name: "",
    code: "",
    category: "Brakes",
    brand: "",
    bikeModel: "",
    purchasePrice: "",
    sellingPrice: "",
    stock: "",
    minStock: 5,
    rackLocation: "",
    warranty: "3 Months",
    description: ""
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setFormData(productToEdit);
    } else {
      // Auto generate a spare part code prefix
      setFormData({
        ...initialForm,
        code: `MP-PRT-${Math.floor(100 + Math.random() * 900)}`
      });
    }
    setErrors({});
    setSaveError("");
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Part name is required";
    if (!formData.code.trim()) newErrors.code = "Product code is required";
    if (!formData.purchasePrice || Number(formData.purchasePrice) < 0)
      newErrors.purchasePrice = "Valid purchase price required";
    if (!formData.sellingPrice || Number(formData.sellingPrice) < 0)
      newErrors.sellingPrice = "Valid selling price required";
    if (formData.stock === "" || Number(formData.stock) < 0)
      newErrors.stock = "Available stock required";
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
        setSaveError("The product was not saved. Review the error notification and try again.");
        return;
      }
      onClose();
    } catch (error) {
      setSaveError(error.message || "The product could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const categoriesList = CATEGORIES.filter((c) => c !== "All Categories");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {productToEdit ? "Edit Spare Part" : "Add New Motorcycle Spare Part"}
              </h2>
              <p className="text-xs text-slate-400">
                {productToEdit
                  ? `Updating SKU: ${productToEdit.code}`
                  : "Register fresh stock into inventory catalog"}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs sm:text-sm">
          {saveError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">{saveError}</p>}
          {/* Row 1: Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Spare Part Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Endurance Heavy Duty Disc Brake Pad"
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product SKU / Code *
              </label>
              <input
                type="text"
                placeholder="MP-BRK-001"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className={`w-full px-3.5 py-2 rounded-xl border ${
                  errors.code ? "border-red-500 bg-red-50" : "border-slate-200"
                } font-mono uppercase focus:border-blue-500 outline-none transition`}
              />
              {errors.code && (
                <p className="text-[11px] text-red-500 mt-1">{errors.code}</p>
              )}
            </div>
          </div>

          {/* Row 2: Category, Brand, Compatible Model */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition bg-white"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                placeholder="e.g. Motul, Brembo, Bajaj OEM"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Compatible Bike Model
              </label>
              <input
                type="text"
                placeholder="e.g. Pulsar 220, FZ-S, Duke 250"
                value={formData.bikeModel}
                onChange={(e) => setFormData({ ...formData, bikeModel: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Row 3: Pricing & Quantity */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cost Price (Rs.) *
              </label>
              <input
                type="number"
                placeholder="450"
                value={formData.purchasePrice}
                onChange={(e) =>
                  setFormData({ ...formData, purchasePrice: e.target.value })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-500 outline-none bg-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-blue-700 mb-1">
                Retail Selling (Rs.) *
              </label>
              <input
                type="number"
                placeholder="650"
                value={formData.sellingPrice}
                onChange={(e) =>
                  setFormData({ ...formData, sellingPrice: e.target.value })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-blue-300 focus:border-blue-500 outline-none bg-white font-bold text-blue-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Stock *
              </label>
              <input
                type="number"
                placeholder="20"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-500 outline-none bg-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-700 mb-1">
                Min Stock Alert
              </label>
              <input
                type="number"
                placeholder="5"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-amber-200 focus:border-amber-500 outline-none bg-white"
              />
            </div>
          </div>

          {/* Row 4: Location & Warranty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shelf / Rack Location
              </label>
              <input
                type="text"
                placeholder="e.g. Rack A-3, Shelf 2"
                value={formData.rackLocation}
                onChange={(e) =>
                  setFormData({ ...formData, rackLocation: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Warranty Coverage
              </label>
              <input
                type="text"
                placeholder="e.g. 6 Months, 2 Years, or N/A"
                value={formData.warranty}
                onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Part Notes / Description
            </label>
            <textarea
              rows={2}
              placeholder="Technical specs, compatibility notes, oil grade or batch..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition text-xs"
            />
          </div>

          {/* Footer Buttons */}
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
              <span>{saving ? "Saving…" : productToEdit ? "Update Product" : "Save Part to Inventory"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
