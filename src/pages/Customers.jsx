import React, { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Bike,
  CreditCard,
  Edit,
  Trash2,
  DollarSign,
  History,
  FileText,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useApp } from "../context/AppContext";
import DataTable from "../components/DataTable";
import CustomerModal from "../components/CustomerModal";
import InvoiceModal from "../components/InvoiceModal";

const Customers = () => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    recordCustomerPayment,
    transactions,
    settings
  } = useApp();

  // Modal & Drawer states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  
  // Payment recording modal
  const [payingCustomer, setPayingCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Fonepay QR");

  // Customer Invoices history drawer
  const [historyCustomer, setHistoryCustomer] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDueOnly, setFilterDueOnly] = useState(false);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.vehicle && c.vehicle.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q));

      const matchesDue = !filterDueOnly || c.balance > 0;

      return matchesSearch && matchesDue;
    });
  }, [customers, searchQuery, filterDueOnly]);

  // Overall KPIs
  const totalCustomers = customers.length;
  const customersWithDue = customers.filter((c) => c.balance > 0);
  const totalDueAmount = customers.reduce((acc, c) => acc + (c.balance || 0), 0);
  const totalLifetimeSpent = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);

  // Handle Record Payment Submit
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payingCustomer || !paymentAmount) return;
    const saved = await recordCustomerPayment(payingCustomer.id, paymentAmount, paymentMethod);
    if (!saved) return;
    setPayingCustomer(null);
    setPaymentAmount("");
  };

  // Customer Invoices
  const customerInvoices = useMemo(() => {
    if (!historyCustomer) return [];
    return transactions.filter(
      (t) =>
        t.customerId === historyCustomer.id ||
        (t.customerPhone && t.customerPhone === historyCustomer.phone) ||
        (t.customerName && t.customerName.toLowerCase() === historyCustomer.name.toLowerCase())
    );
  }, [historyCustomer, transactions]);

  // Table Columns
  const columns = [
    {
      header: "Customer Name & Phone",
      accessor: "name",
      className: "min-w-[220px]",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
            {row.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-slate-900">{row.name}</div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{row.phone}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Motorcycle Details",
      accessor: "vehicle",
      render: (row) => (
        <div className="max-w-[200px]">
          <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 truncate">
            <Bike className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{row.vehicle || "N/A"}</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{row.address || "Kathmandu"}</span>
          </div>
        </div>
      )
    },
    {
      header: "Outstanding Balance",
      accessor: "balance",
      render: (row) => (
        <div>
          {row.balance > 0 ? (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-700 border border-red-200">
                {settings.currency} {row.balance.toLocaleString()} Due
              </span>
              <button
                onClick={() => {
                  setPayingCustomer(row);
                  setPaymentAmount(row.balance);
                }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline"
              >
                Clear
              </button>
            </div>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
              Clear (No Due)
            </span>
          )}
        </div>
      )
    },
    {
      header: "Total Purchases",
      accessor: "totalSpent",
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">
            {settings.currency} {(row.totalSpent || 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400">
            Last Visit: {row.lastVisit || "Recent"}
          </p>
        </div>
      )
    },
    {
      header: "Actions",
      accessor: "actions",
      className: "text-right",
      cellClassName: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setHistoryCustomer(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
            title="View Purchase History"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCustomerToEdit(row);
              setIsModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
            title="Edit Customer"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete customer "${row.name}"?`)) {
                deleteCustomer(row.id);
              }
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
            title="Delete Customer"
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
              Customer Ledger & Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              {totalCustomers} Registered Clients
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track customer contact numbers, motorcycle models, credit balances, and past service invoices.
          </p>
        </div>

        <button
          onClick={() => {
            setCustomerToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition transform active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Register Customer</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Customers
          </p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalCustomers}</p>
          <p className="text-xs text-slate-400 mt-0.5">Active directory records</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-red-200 shadow-xs">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">
            Total Outstanding Credit
          </p>
          <p className="text-2xl font-black text-red-700 mt-1">
            {settings.currency} {totalDueAmount.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Owed by {customersWithDue.length} customers
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Lifetime Sales Value
          </p>
          <p className="text-2xl font-black text-emerald-800 mt-1">
            {settings.currency} {totalLifetimeSpent.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Total customer revenue</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Filter Due Balances
            </p>
            <p className="text-xs text-slate-400 mt-1">Show customers with pending credit</p>
          </div>
          <button
            onClick={() => setFilterDueOnly(!filterDueOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterDueOnly
                ? "bg-red-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {filterDueOnly ? "Filtered (Due)" : "All Customers"}
          </button>
        </div>
      </div>

      {/* Main Customers DataTable */}
      <DataTable
        columns={columns}
        data={filteredCustomers}
        searchPlaceholder="Search customers by name, phone, bike number, or location..."
        itemsPerPage={8}
        emptyMessage="No customer records found."
      />

      {/* Customer Invoices Drawer */}
      {historyCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-fade-in overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Purchase History · {historyCustomer.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {historyCustomer.vehicle || "Motorcycle Owner"} · {historyCustomer.phone}
                  </p>
                </div>
                <button
                  onClick={() => setHistoryCustomer(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Outstanding balance highlight */}
              {historyCustomer.balance > 0 && (
                <div className="my-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-red-800">Outstanding Balance Due</p>
                    <p className="text-base font-extrabold text-red-700">
                      {settings.currency} {historyCustomer.balance.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPayingCustomer(historyCustomer);
                      setPaymentAmount(historyCustomer.balance);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition"
                  >
                    Receive Payment
                  </button>
                </div>
              )}

              {/* Invoices List */}
              <div className="mt-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Past Tax Invoices ({customerInvoices.length})
                </h3>

                {customerInvoices.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                    No transactions recorded for this customer yet.
                  </div>
                ) : (
                  customerInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {inv.id}
                        </span>
                        <span className="text-[11px] text-slate-400">{inv.date}</span>
                      </div>

                      <div className="text-xs text-slate-600">
                        {inv.items.map((i) => `${i.name} (×${i.quantity})`).join(", ")}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-xs font-bold text-slate-900">
                          {settings.currency} {inv.grandTotal.toLocaleString()}
                        </span>
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          View Bill
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => setHistoryCustomer(null)}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {payingCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-fade-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Receive Customer Payment</h3>
                <p className="text-xs text-slate-400">{payingCustomer.name}</p>
              </div>
              <button
                onClick={() => setPayingCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-red-50 rounded-2xl border border-red-200 flex justify-between items-center">
                <span className="text-red-700 font-semibold">Current Due Balance:</span>
                <span className="font-extrabold text-red-700 text-base">
                  {settings.currency} {payingCustomer.balance.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount Received (Rs.) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={payingCustomer.balance}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-base font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                >
                  <option>Fonepay QR</option>
                  <option>Cash at Counter</option>
                  <option>eSewa / Khalti</option>
                  <option>Bank Deposit</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayingCustomer(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal for reprinting past bill */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* Add / Edit Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (data) => {
          if (customerToEdit) {
            return updateCustomer(customerToEdit.id, data);
          }
          return addCustomer(data);
        }}
        customerToEdit={customerToEdit}
      />
    </div>
  );
};

export default Customers;
