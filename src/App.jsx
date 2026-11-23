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
import CustomerPortal from "./pages/CustomerPortal";

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { currentUser } = useApp();

  // If on login page, don't show navbar and sidebar
  if (location.pathname === "/login") {
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
          {children}
        </main>
      </div>
    </div>
  );
};

// Protected route checking for active user
const RouteWrapper = ({ children, requireAdmin = false }) => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If page requires admin and current user is a customer, route them to CustomerPortal
  if (requireAdmin && currentUser.role === "customer") {
    return <Navigate to="/portal" replace />;
  }

  return children;
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            {/* Auth / Login */}
            <Route path="/login" element={<Login />} />

            {/* Admin Management Routes */}
            <Route
              path="/"
              element={
                <RouteWrapper requireAdmin={true}>
                  <Dashboard />
                </RouteWrapper>
              }
            />
            <Route
              path="/inventory"
              element={
                <RouteWrapper requireAdmin={true}>
                  <Inventory />
                </RouteWrapper>
              }
            />
            <Route
              path="/billing"
              element={
                <RouteWrapper requireAdmin={true}>
                  <Billing />
                </RouteWrapper>
              }
            />
            <Route
              path="/customers"
              element={
                <RouteWrapper requireAdmin={true}>
                  <Customers />
                </RouteWrapper>
              }
            />
            <Route
              path="/suppliers"
              element={
                <RouteWrapper requireAdmin={true}>
                  <Suppliers />
                </RouteWrapper>
              }
            />
            <Route
              path="/reports"
              element={
                <RouteWrapper requireAdmin={true}>
                  <Reports />
                </RouteWrapper>
              }
            />
            <Route
              path="/settings"
              element={
                <RouteWrapper requireAdmin={true}>
                  <Settings />
                </RouteWrapper>
              }
            />

            {/* Customer Portal Routes */}
            <Route
              path="/portal"
              element={
                <RouteWrapper>
                  <CustomerPortal />
                </RouteWrapper>
              }
            />
            <Route
              path="/portal/orders"
              element={
                <RouteWrapper>
                  <CustomerPortal />
                </RouteWrapper>
              }
            />
            <Route
              path="/portal/account"
              element={
                <RouteWrapper>
                  <CustomerPortal />
                </RouteWrapper>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
