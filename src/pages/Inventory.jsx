import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PlusCircle,
  MinusCircle,
  Tag,
  Wrench,
  Bike
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { CATEGORIES, POPULAR_BIKE_MODELS } from "../data/appDefaults";
import DataTable from "../components/DataTable";
import ProductModal from "../components/ProductModal";
import { downloadCsv } from "../utils/csv";

const Inventory = () => {
  const { products, addProduct, updateProduct, deleteProduct, settings } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState(
    searchParams.get("status") === "low" ? "low" : "all"
  );
  const [selectedBikeModel, setSelectedBikeModel] = useState("All Models");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search Query
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query) ||
        (p.brand && p.brand.toLowerCase().includes(query)) ||
        (p.bikeModel && p.bikeModel.toLowerCase().includes(query)) ||
        (p.rackLocation && p.rackLocation.toLowerCase().includes(query));

      // 2. Category
      const matchesCategory =
        selectedCategory === "All Categories" || p.category === selectedCategory;

      // 3. Status
      const threshold = p.minStock || settings.lowStockThreshold || 5;
      let matchesStatus = true;
      if (selectedStatus === "in") {
        matchesStatus = p.stock > threshold;
      } else if (selectedStatus === "low") {
        matchesStatus = p.stock <= threshold && p.stock > 0;
      } else if (selectedStatus === "out") {
        matchesStatus = p.stock === 0;
      }

      // 4. Bike Model
      const matchesBike =
        selectedBikeModel === "All Models" ||
        (p.bikeModel && p.bikeModel.includes(selectedBikeModel));

      return matchesSearch && matchesCategory && matchesStatus && matchesBike;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus, selectedBikeModel, settings]);

  // Inventory KPI metrics
  const totalSKUs = products.length;
  const inStockCount = products.filter(
    (p) => p.stock > (p.minStock || settings.lowStockThreshold || 5)
  ).length;
  const lowStockCount = products.filter(
    (p) =>
      p.stock <= (p.minStock || settings.lowStockThreshold || 5) && p.stock > 0
  ).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const totalCostValuation = products.reduce(
    (acc, p) => acc + p.purchasePrice * p.stock,
    0
  );
  const totalRetailValuation = products.reduce(
    (acc, p) => acc + p.sellingPrice * p.stock,
    0
  );

  // Quick Stock Adjusters
  const handleStockAdjust = (product, delta) => {
    const newQty = Math.max(0, product.stock + delta);
    updateProduct(product.id, { stock: newQty });
  };

  // Open Edit Modal
  const handleEdit = (product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  // Delete product with confirmation
  const handleDelete = (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}" (${product.code}) from inventory?`)) {
      deleteProduct(product.id);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "SKU Code",
      "Part Name",
      "Category",
      "Brand",
      "Compatible Bike Model",
      "Cost Price (Rs)",
      "Selling Price (Rs)",
      "Stock",
      "Rack Location",
      "Warranty"
    ];

    const rows = filteredProducts.map((p) => [
      p.code,
      p.name,
      p.category,
      p.brand || "",
      p.bikeModel || "",
      p.purchasePrice,
      p.sellingPrice,
      p.stock,
      p.rackLocation || "",
      p.warranty || ""
    ]);

    downloadCsv(`mama_auto_parts_inventory_${Date.now()}.csv`, headers, rows);
  };

  // Table Columns Definition
  const columns = [
    {
      header: "Product / Spare Part",
      accessor: "name",
      className: "min-w-[260px]",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          {row.image ? (
            <img
              src={row.image}
              alt={row.imageAlt || row.name}
              loading="lazy"
              className="h-full w-full rounded-xl object-contain"
            />
          ) : (
            <Wrench className="w-5 h-5" />
          )}
          </div>
          <div>
            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition">
              {row.name}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
              <span className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-semibold text-[10px]">
                {row.code}
              </span>
              <span>•</span>
              <span className="text-slate-600 truncate max-w-[180px]">
                {row.bikeModel || "Universal"}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Category & Brand",
      accessor: "category",
      render: (row) => (
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {row.category}
          </span>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Brand: <span className="text-slate-800 font-semibold">{row.brand || "OEM"}</span>
          </div>
        </div>
      )
    },
    {
      header: "Price & Margin",
      accessor: "sellingPrice",
      render: (row) => {
        const margin = row.sellingPrice - row.purchasePrice;
        const marginPct =
          row.purchasePrice > 0
            ? Math.round((margin / row.purchasePrice) * 100)
            : 0;
        return (
          <div>
            <div className="font-bold text-slate-900">
              {settings.currency} {row.sellingPrice.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">
              Cost: {settings.currency} {row.purchasePrice.toLocaleString()} (
              <span className="text-emerald-600 font-semibold">+{marginPct}%</span>)
            </div>
          </div>
        );
      }
    },
    {
      header: "Available Stock",
      accessor: "stock",
      render: (row) => {
        const threshold = row.minStock || settings.lowStockThreshold || 5;
        const isOut = row.stock === 0;
        const isLow = row.stock <= threshold && !isOut;

        return (
          <div className="flex items-center gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-slate-900">
                  {row.stock}
                </span>
                <span className="text-xs text-slate-400">units</span>
              </div>
              <div className="mt-0.5">
                {isOut ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                    Out of Stock
                  </span>
                ) : isLow ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                    Low Stock (Min: {threshold})
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    In Stock
                  </span>
                )}
              </div>
            </div>

            {/* Quick +/- buttons */}
            <div className="flex flex-col gap-0.5 ml-2">
              <button
                onClick={() => handleStockAdjust(row, 1)}
                className="p-1 rounded bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 transition"
                title="Add 1 to stock"
              >
                <PlusCircle className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleStockAdjust(row, -1)}
                disabled={row.stock <= 0}
                className="p-1 rounded bg-slate-100 hover:bg-red-100 hover:text-red-700 text-slate-600 disabled:opacity-30 transition"
                title="Subtract 1 from stock"
              >
                <MinusCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      }
    },
    {
      header: "Location",
      accessor: "rackLocation",
      render: (row) => (
        <div>
          <span className="px-2 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {row.rackLocation || "General"}
          </span>
          {row.warranty && (
            <p className="text-[10px] text-slate-500 mt-1">
              Warranty: {row.warranty}
            </p>
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
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
            title="Edit Part"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
            title="Delete Part"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
              Motorcycle Spare Parts Inventory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              {totalSKUs} Parts Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track genuine motorcycle spare parts, manage stock levels, update selling rates, and rack locations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setProductToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Spare Part</span>
          </button>
        </div>
      </div>

      {/* Mini KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setSelectedStatus("all")}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            selectedStatus === "all"
              ? "bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20"
              : "bg-white border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Unique Parts
          </p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalSKUs}</p>
          <p className="text-[11px] text-blue-600 font-medium mt-0.5">Click to view all</p>
        </div>

        <div
          onClick={() => setSelectedStatus("in")}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            selectedStatus === "in"
              ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20"
              : "bg-white border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> In Stock
          </p>
          <p className="text-2xl font-black text-emerald-800 mt-1">{inStockCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Healthy supply</p>
        </div>

        <div
          onClick={() => setSelectedStatus("low")}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            selectedStatus === "low"
              ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/20"
              : "bg-white border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
          </p>
          <p className="text-2xl font-black text-amber-800 mt-1">{lowStockCount}</p>
          <p className="text-[11px] text-amber-600 font-medium mt-0.5">Needs reorder</p>
        </div>

        <div
          onClick={() => setSelectedStatus("out")}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            selectedStatus === "out"
              ? "bg-red-50/70 border-red-300 ring-2 ring-red-500/20"
              : "bg-white border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wider flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Out of Stock
          </p>
          <p className="text-2xl font-black text-red-800 mt-1">{outOfStockCount}</p>
          <p className="text-[11px] text-red-600 font-medium mt-0.5">Zero inventory</p>
        </div>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by part name, SKU, brand, model, or rack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none transition"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition font-medium text-slate-700"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Bike Model Filter */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedBikeModel}
            onChange={(e) => setSelectedBikeModel(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition font-medium text-slate-700"
          >
            {POPULAR_BIKE_MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {(searchQuery ||
          selectedCategory !== "All Categories" ||
          selectedStatus !== "all" ||
          selectedBikeModel !== "All Models") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All Categories");
              setSelectedStatus("all");
              setSelectedBikeModel("All Models");
              setSearchParams({});
            }}
            className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Main Inventory DataTable */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        searchPlaceholder="Filter listed parts..."
        itemsPerPage={8}
        emptyMessage="No spare parts match your current filter criteria."
      />

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (data) => {
          if (productToEdit) {
            return updateProduct(productToEdit.id, data);
          }
          return addProduct(data);
        }}
        productToEdit={productToEdit}
      />
    </div>
  );
};

export default Inventory;
