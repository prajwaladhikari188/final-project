import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bike, Lock, Mail, ShieldCheck, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import { API_BASE } from "../utils/api";

const Login = () => {
  const { login, authError } = useApp();
  const navigate = useNavigate();
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [demoAccountsError, setDemoAccountsError] = useState("");
  const [demoAccountsLoading, setDemoAccountsLoading] = useState(false);
  const [demoAccountsRetry, setDemoAccountsRetry] = useState(0);
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const showDemoCredentials = import.meta.env.VITE_SHOW_DEMO_CREDENTIALS === "true";

  useEffect(() => {
    if (!showDemoCredentials) return undefined;
    let active = true;
    const loadDemoAccounts = async () => {
      setDemoAccountsLoading(true);
      setDemoAccountsError("");
      try {
        const response = await fetch(`${API_BASE}/demo-accounts`, { cache: "no-store" });
        const contentType = response.headers.get("content-type") || "";
        const result = contentType.includes("application/json") ? await response.json() : null;
        if (!response.ok) {
          const apiUnavailable = [502, 503, 504].includes(response.status);
          throw new Error(apiUnavailable
            ? "Demo credentials are unavailable. Start MariaDB and run npm run api, then retry."
            : result?.error || "Demo credentials are unavailable.");
        }
        if (!Array.isArray(result?.accounts)) {
          throw new Error("The demo-account service returned an invalid response.");
        }
        if (active) setDemoAccounts(result.accounts);
      } catch (loadError) {
        if (active) {
          setDemoAccountsError(loadError instanceof TypeError
            ? "Cannot connect to the demo-account API. Start MariaDB and run npm run api, then retry."
            : loadError.message || "Unable to load demo credentials.");
        }
      } finally {
        if (active) setDemoAccountsLoading(false);
      }
    };
    void loadDemoAccounts();
    return () => {
      active = false;
    };
  }, [demoAccountsRetry, showDemoCredentials]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(email, password, role);
      navigate(user.role === "customer" ? "/customer" : "/", { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (account) => {
    setRole(account.role);
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-navy-950 flex items-center justify-center p-4 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-blue-600 text-white">
            <Bike className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-display text-xl font-extrabold tracking-wider text-white">MAMA AUTO</h1>
            <p className="text-xs text-slate-400">Secure account sign-in</p>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-200">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          Sign in to your account
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-800 p-1" aria-label="Account type">
            {[
              { value: "admin", label: "Admin / User" },
              { value: "customer", label: "Customer" }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={role === option.value}
                onClick={() => setRole(option.value)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                  role === option.value
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="block text-xs font-semibold text-slate-300">
            Username (email)
            <span className="relative mt-1.5 block">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                autoComplete="username"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </span>
          </label>

          <label className="block text-xs font-semibold text-slate-300">
            Password
            <span className="relative mt-1.5 block">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                autoComplete="current-password"
                required
                maxLength={72}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </span>
          </label>

          {(error || authError) && (
            <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
              {error || authError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{submitting ? "Signing in…" : "Sign in"}</span>
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        {showDemoCredentials && (
          <section className="mt-6 border-t border-slate-800 pt-5" aria-labelledby="demo-accounts-title">
            <h2 id="demo-accounts-title" className="mb-1 text-xs font-bold text-slate-200">
              Local demo accounts
            </h2>
            <p className="mb-3 text-[11px] leading-relaxed text-amber-300">
              For local testing only. Do not enable demo accounts in production.
            </p>
            {demoAccountsError && (
              <div className="mb-3">
                <p role="alert" className="mb-2 text-xs text-red-300">{demoAccountsError}</p>
                <button
                  type="button"
                  disabled={demoAccountsLoading}
                  onClick={() => setDemoAccountsRetry((retry) => retry + 1)}
                  className="text-[11px] font-semibold text-blue-300 hover:text-blue-200 disabled:opacity-60"
                >
                  {demoAccountsLoading ? "Retrying…" : "Retry loading demo accounts"}
                </button>
              </div>
            )}
            {demoAccounts.length === 0 && demoAccountsLoading && (
              <p className="mb-3 text-xs text-slate-400" role="status">Loading demo credentials…</p>
            )}
            <div className="space-y-3">
              {demoAccounts.map((account) => (
                <div key={account.role} className="rounded-xl border border-slate-700 bg-slate-800/70 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-100">
                      {account.role === "admin" ? "Admin / User" : "Customer"}
                    </span>
                    <button
                      type="button"
                      onClick={() => fillDemoAccount(account)}
                      className="text-[11px] font-semibold text-blue-300 hover:text-blue-200"
                    >
                      Use account
                    </button>
                  </div>
                  <dl className="space-y-1 text-[11px]">
                    <div className="flex gap-2">
                      <dt className="w-16 shrink-0 text-slate-400">Username</dt>
                      <dd className="break-all font-mono text-slate-200">{account.email}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-16 shrink-0 text-slate-400">Password</dt>
                      <dd className="break-all font-mono text-slate-200">{account.password}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Login;
