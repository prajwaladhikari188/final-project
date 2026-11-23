import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Billing from "./pages/Billing";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import CustomerDashboard from "./pages/CustomerDashboard";

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { currentUser, authLoading, products, persistenceStatus, persistenceError } = useApp();
  const sampleProductCount = products.filter((product) => product.isSample).length;

  // If on login page, don't show navbar and sidebar
  if (
    location.pathname === "/login" ||
    authLoading ||
    !currentUser ||
    currentUser.role === "customer"
  ) {
    return children;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <div
            className={`mb-5 rounded-xl border px-4 py-3 text-xs font-medium ${
              persistenceStatus === "error"
                ? "border-red-300 bg-red-50 text-red-900"
                : "border-emerald-300 bg-emerald-50 text-emerald-900"
            }`}
            role={persistenceStatus === "error" ? "alert" : "status"}
          >
            {persistenceStatus === "loading"
              ? "Loading operational records from MariaDB…"
              : persistenceStatus === "saving"
              ? "Saving operational changes to MariaDB…"
              : persistenceStatus === "error"
              ? `Business data could not be synchronized with MariaDB: ${persistenceError}`
              : "Operational records are loaded from and saved to MariaDB. Changes persist across refreshes and sign-outs."}
            {sampleProductCount > 0 && (
              <span className="mt-1 block text-amber-900">
                Showing {sampleProductCount} sample products. Images, prices, and stock are illustrative; replace them with verified data before business use.
              </span>
            )}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

// Protected route checking for active user
const RouteWrapper = ({ children, requiredRole }) => {
  const { currentUser, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-300">
        Checking staff session…
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== requiredRole) {
    return <Navigate to={currentUser.role === "customer" ? "/customer" : "/"} replace />;
  }

  return children;
};

const LoginRoute = () => {
  const { currentUser, authLoading } = useApp();
  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center">Checking your session…</div>;
  }
  if (currentUser) {
    return <Navigate to={currentUser.role === "customer" ? "/customer" : "/"} replace />;
  }
  return <Login />;
};

const RoleRedirect = () => {
  const { currentUser, authLoading } = useApp();
  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center">Checking your session…</div>;
  }
  return <Navigate to={currentUser ? (currentUser.role === "customer" ? "/customer" : "/") : "/login"} replace />;
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <MainLayout>
          <Routes>
            {/* Auth / Login */}
            <Route path="/login" element={<LoginRoute />} />

            {/* Admin Management Routes */}
            <Route
              path="/"
              element={
                <RouteWrapper requiredRole="admin">
                  <Dashboard />
                </RouteWrapper>
              }
            />
            <Route
              path="/inventory"
              element={
                <RouteWrapper requiredRole="admin">
                  <Inventory />
                </RouteWrapper>
              }
            />
            <Route
              path="/billing"
              element={
                <RouteWrapper requiredRole="admin">
                  <Billing />
                </RouteWrapper>
              }
            />
            <Route
              path="/customers"
              element={
                <RouteWrapper requiredRole="admin">
                  <Customers />
                </RouteWrapper>
              }
            />
            <Route
              path="/suppliers"
              element={
                <RouteWrapper requiredRole="admin">
                  <Suppliers />
                </RouteWrapper>
              }
            />
            <Route
              path="/reports"
              element={
                <RouteWrapper requiredRole="admin">
                  <Reports />
                </RouteWrapper>
              }
            />
            <Route
              path="/settings"
              element={
                <RouteWrapper requiredRole="admin">
                  <Settings />
                </RouteWrapper>
              }
            />

            <Route
              path="/customer"
              element={
                <RouteWrapper requiredRole="customer">
                  <CustomerDashboard />
                </RouteWrapper>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<RoleRedirect />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
