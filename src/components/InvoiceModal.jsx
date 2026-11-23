import React from "react";
import { X, Printer, Download, Bike, CheckCircle, QrCode } from "lucide-react";
import { useApp } from "../context/AppContext";

const InvoiceModal = ({ invoice, onClose }) => {
  const { settings } = useApp();

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-fade-in printable-invoice-container">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-bold tracking-wide">
              Tax Invoice · {invoice.id}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="allow-print flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Paper Area */}
        <div className="p-6 sm:p-8 text-slate-800 bg-white">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                  <Bike className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black font-display tracking-tight text-slate-950">
                  {settings.shopName}
                </h1>
              </div>
              <p className="text-xs font-medium text-slate-600 mt-1 max-w-xs">
                {settings.tagline}
              </p>
              <p className="text-xs text-slate-500 mt-1">{settings.address}</p>
              <p className="text-xs text-slate-500">
                Phone: {settings.phone} | Email: {settings.email}
              </p>
            </div>

            <div className="text-left sm:text-right bg-slate-50 p-3 rounded-xl border border-slate-200 min-w-44">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                INVOICE / BILL
              </div>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                {invoice.id}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                Date: {invoice.date}
              </div>
              <div className="text-[11px] font-bold text-slate-700 mt-1">
                {settings.panNumber}
              </div>
            </div>
          </div>

          {/* Customer & Billing Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Billed To Customer:
              </span>
              <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                {invoice.customerName || "Walk-in Retail Customer"}
              </p>
              {invoice.customerPhone && (
                <p className="text-slate-600">Phone: {invoice.customerPhone}</p>
              )}
              {invoice.customerVehicle && (
                <p className="text-blue-700 font-semibold mt-0.5">
                  Bike: {invoice.customerVehicle}
                </p>
              )}
            </div>

            <div className="sm:text-right">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Payment & Cashier Info:
              </span>
              <p className="text-slate-700 font-semibold mt-0.5">
                Method:{" "}
                <span className="font-extrabold text-slate-900">
                  {invoice.paymentMethod || "Cash"}
                </span>
              </p>
              <p className="text-slate-600">
                Status:{" "}
                <span
                  className={`font-bold ${
                    invoice.paymentStatus === "Paid"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {invoice.paymentStatus || "Paid"}
                </span>
              </p>
              <p className="text-slate-500">Sales By: {invoice.cashier || "Admin"}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-[11px] font-bold uppercase text-slate-600">
                  <th className="py-2.5">#</th>
                  <th className="py-2.5">Spare Part Description</th>
                  <th className="py-2.5 text-center">Code</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Rate ({settings.currency})</th>
                  <th className="py-2.5 text-right">Amount ({settings.currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="py-2 text-slate-400">{index + 1}</td>
                    <td className="py-2 font-semibold text-slate-800">
                      {item.name}
                    </td>
                    <td className="py-2 text-center text-slate-500 font-mono text-[11px]">
                      {item.code || "-"}
                    </td>
                    <td className="py-2 text-center font-bold text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="py-2 text-right text-slate-600">
                      {item.price.toLocaleString()}
                    </td>
                    <td className="py-2 text-right font-bold text-slate-900">
                      {(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation Breakdown & QR Verification */}
          <div className="pt-3 border-t-2 border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="max-w-xs text-[11px] text-slate-500 flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="w-14 h-14 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center shrink-0">
                <QrCode className="w-12 h-12 text-slate-800" />
              </div>
              <div>
                <p className="font-bold text-slate-700">Fonepay / Tax QR</p>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Scan to verify genuine digital tax bill or repeat reorder.
                </p>
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold">
                  {settings.currency} {invoice.subtotal.toLocaleString()}
                </span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount:</span>
                  <span>
                    - {settings.currency} {invoice.discount.toLocaleString()}
                  </span>
                </div>
              )}
              {invoice.vatAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>VAT ({invoice.vatRate || 13}%):</span>
                  <span className="font-semibold">
                    {settings.currency} {invoice.vatAmount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-950 pt-2 border-t border-slate-300">
                <span>Grand Total:</span>
                <span className="text-blue-700">
                  {settings.currency} {invoice.grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Terms & Signature */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-[10px] text-slate-500 flex flex-col sm:flex-row justify-between items-end gap-6">
            <div className="max-w-md">
              <p className="font-bold text-slate-700 mb-1">Terms & Conditions:</p>
              <p>{settings.invoiceNote}</p>
              <p className="mt-1 font-semibold text-blue-600">
                {settings.invoiceFooter}
              </p>
            </div>

            <div className="text-center shrink-0">
              <div className="w-36 border-b border-dashed border-slate-400 mb-1"></div>
              <p className="font-bold text-slate-800">Authorized Signature</p>
              <p className="text-[9px] text-slate-400">MAMA AUTO PARTS</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer (no-print) */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice (A4 / POS)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
