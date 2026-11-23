import React, { useState, useMemo } from "react";
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Building2,
  CreditCard,
  Edit,
  Trash2,
  DollarSign,
  X,
  CheckCircle,
  FileText
} from "lucide-react";
import { useApp } from "../context/AppContext";
import DataTable from "../components/DataTable";
import SupplierModal from "../components/SupplierModal";

const Suppliers = () => {
  const {
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    recordSupplierPayment,
    settings
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState(null);

  // Supplier payment recording
  const [payingSupplier, setPayingSupplier] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer / Cheque");

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        s.companyName.toLowerCase().includes(q) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(q)) ||
        (s.phone && s.phone.toLowerCase().includes(q)) ||
        (s.panNumber && s.panNumber.toLowerCase().includes(q)) ||
        (s.categories && s.categories.toLowerCase().includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q))
      );
    });
  }, [suppliers, searchQuery]);

  // Overall KPIs
  const totalSuppliers = suppliers.length;
  const totalPayableBalance = suppliers.reduce((acc, s) => acc + (s.balance || 0), 0);
  const activeSuppliers = suppliers.filter((s) => s.status === "Active").length;

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payingSupplier || !payAmount) return;
    const saved = await recordSupplierPayment(payingSupplier.id, payAmount, paymentMethod);
    if (!saved) return;
    setPayingSupplier(null);
    setPayAmount("");
  };

  const columns = [
    {
      header: "Company & Contact Person",
      accessor: "companyName",
      className: "min-w-[240px]",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-200">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900">{row.companyName}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Contact: <span className="font-semibold text-slate-700">{row.contactPerson || "Sales Dept"}</span>
            </div>
            {row.panNumber && (
              <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                {row.panNumber}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: "Contact & Address",
      accessor: "phone",
      render: (row) => (
        <div>
          <div className="text-xs text-slate-800 flex items-center gap-1.5 font-medium">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>{row.phone}</span>
          </div>
          {row.email && (
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{row.email}</span>
            </div>
          )}
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate max-w-[200px]">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{row.address || "Kathmandu"}</span>
          </div>
        </div>
      )
    },
    {
      header: "Supplied Categories",
      accessor: "categories",
      render: (row) => (
        <div className="max-w-[220px]">
          <p className="text-xs text-slate-700 font-medium">
            {row.categories || "Motorcycle Spares"}
          </p>
        </div>
      )
    },
    {
      header: "Outstanding Payable",
      accessor: "balance",
      render: (row) => (
        <div>
          {row.balance > 0 ? (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                {settings.currency} {row.balance.toLocaleString()} Due
              </span>
              <button
                onClick={() => {
                  setPayingSupplier(row);
                  setPayAmount(row.balance);
                }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline"
              >
                Pay
              </button>
            </div>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
              Settled (No Due)
            </span>
          )}
        </div>
      )
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            row.status === "Active"
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {row.status || "Active"}
        </span>
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
            onClick={() => {
              setSupplierToEdit(row);
              setIsModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
            title="Edit Supplier"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete supplier "${row.companyName}"?`)) {
                deleteSupplier(row.id);
              }
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
            title="Delete Supplier"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
              Suppliers & Wholesalers Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              {totalSuppliers} Distributors
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage genuine parts distributors, contact personnel, PAN records, and supplier payable balances.
          </p>
        </div>

        <button
          onClick={() => {
            setSupplierToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Supplier</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Suppliers
          </p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalSuppliers}</p>
          <p className="text-xs text-slate-400 mt-0.5">Automotive distributors in Nepal</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Total Accounts Payable
          </p>
          <p className="text-2xl font-black text-amber-800 mt-1">
            {settings.currency} {totalPayableBalance.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Payable to wholesalers</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Active Supply Lines
          </p>
          <p className="text-2xl font-black text-emerald-800 mt-1">{activeSuppliers}</p>
          <p className="text-xs text-slate-500 mt-0.5">Brembo, Rolon, Motul, Exide, OEM</p>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={filteredSuppliers}
        searchPlaceholder="Search suppliers by company, contact person, PAN, phone, or parts..."
        itemsPerPage={8}
        emptyMessage="No supplier records found."
      />

      {/* Record Payment to Supplier Modal */}
      {payingSupplier && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-fade-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Record Payment to Supplier</h3>
                <p className="text-xs text-slate-400">{payingSupplier.companyName}</p>
              </div>
              <button
                onClick={() => setPayingSupplier(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex justify-between items-center">
                <span className="text-amber-800 font-semibold">Payable Balance:</span>
                <span className="font-extrabold text-amber-800 text-base">
                  {settings.currency} {payingSupplier.balance.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount Paid (Rs.) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={payingSupplier.balance}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-base font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Mode / Bank Account
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                >
                  <option>Bank Transfer / Cheque</option>
                  <option>Fonepay / Corporate QR</option>
                  <option>Cash Receipt</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayingSupplier(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (data) => {
          if (supplierToEdit) {
            return updateSupplier(supplierToEdit.id, data);
          }
          return addSupplier(data);
        }}
        supplierToEdit={supplierToEdit}
      />
    </div>
  );
};

export default Suppliers;
