import React, { useEffect, useState } from "react";
import { Bike, LogOut, Receipt, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { API_BASE } from "../utils/api";

const formatNpr = (amount) =>
  new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 2
  }).format(Number(amount) || 0);

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-NP");
};

const CustomerDashboard = () => {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadInvoices = async () => {
      try {
        const response = await fetch(`${API_BASE}/customer/invoices`, {
          credentials: "include",
          cache: "no-store"
        });
        const contentType = response.headers.get("content-type") || "";
        const result = contentType.includes("application/json") ? await response.json() : null;
        if (!response.ok) {
          throw new Error(
            result?.error ||
            (response.status === 401
              ? "Your session has expired. Sign in again."
              : "Customer invoice history is unavailable.")
          );
        }
        if (!Array.isArray(result?.invoices)) {
          throw new Error("The customer service returned an invalid response.");
        }
        if (active) setInvoices(result.invoices);
      } catch (loadError) {
        if (active) setError(loadError.message || "Unable to load your invoice history.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadInvoices();
    return () => {
      active = false;
    };
  }, []);

  const totalSpent = invoices.reduce((sum, invoice) => sum + (Number(invoice.total_amount) || 0), 0);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <Bike className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-sm font-extrabold tracking-wider text-slate-900">MAMA AUTO PARTS</p>
              <p className="text-xs text-slate-500">Customer account</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <section className="mb-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-lg sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Customer dashboard</p>
          <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            Welcome, {currentUser?.name || "Customer"}
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            View your account details and invoices linked to your customer account.
          </p>
        </section>

        {error && (
          <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </p>
        )}

        <section className="mb-6 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <User className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account</h2>
                <p className="mt-1 truncate text-sm font-bold text-slate-900">{currentUser?.email}</p>
              </div>
            </div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Receipt className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Linked purchases</h2>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {loading ? "Loading…" : `${invoices.length} invoices · ${formatNpr(totalSpent)}`}
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-slate-900">Your invoice history</h2>
            <p className="mt-1 text-xs text-slate-500">Only invoices explicitly linked to this account are shown.</p>
          </div>
          {loading ? (
            <p className="p-6 text-sm text-slate-500" role="status">Loading your invoices…</p>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center">
              <Receipt className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">No linked invoices yet</p>
              <p className="mt-1 text-xs text-slate-500">
                Your purchases will appear here after an invoice is linked to this account.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Invoice</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 font-semibold">Items</th>
                    <th className="px-5 py-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-5 py-4 font-semibold text-slate-900">{invoice.invoice_number}</td>
                      <td className="px-5 py-4 text-slate-600">{formatDate(invoice.created_at)}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {(invoice.items || []).map((item) => `${item.partName || "Part"} × ${item.quantity}`).join(", ") || "—"}
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-slate-900">
                        {formatNpr(invoice.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CustomerDashboard;
