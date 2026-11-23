import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { DEFAULT_SETTINGS } from "../data/appDefaults";
import { getLoginConnectionError, getLoginErrorMessage } from "../utils/authErrors";
import { API_BASE } from "../utils/api";

const AppContext = createContext(null);
const LEGACY_STORAGE_KEYS = [
  "mama_auth_user",
  "mama_products",
  "mama_customers",
  "mama_suppliers",
  "mama_transactions",
  "mama_settings"
];

async function apiRequest(path, { method = "GET", body } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: "include",
      cache: "no-store",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Business API is unavailable. Check that the API and MariaDB are running.");
    }
    throw error;
  }
  const contentType = response.headers.get("content-type") || "";
  const result = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;
  if (!response.ok) {
    throw new Error(result?.error || `Business data request failed (${response.status}).`);
  }
  return result;
}

if (typeof window !== "undefined") {
  try {
    LEGACY_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Nothing is read from browser storage; access may be disabled by browser policy.
  }
}

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [persistenceStatus, setPersistenceStatus] = useState("idle");
  const [persistenceError, setPersistenceError] = useState("");
  const authVersion = useRef(0);
  const loadedOperationsUserId = useRef(null);

  // Toast / notification banner
  const [toast, setToast] = useState(null);

  const clearOperationalState = () => {
    setProducts([]);
    setCustomers([]);
    setSuppliers([]);
    setTransactions([]);
    setSettings(DEFAULT_SETTINGS);
    setPersistenceStatus("idle");
    setPersistenceError("");
    loadedOperationsUserId.current = null;
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  const applyOperations = (operations) => {
    if (
      !operations ||
      !Array.isArray(operations.products) ||
      !Array.isArray(operations.customers) ||
      !Array.isArray(operations.suppliers) ||
      !Array.isArray(operations.transactions) ||
      !operations.settings
    ) {
      throw new Error("Business data service returned an invalid response.");
    }
    setProducts(operations.products);
    setCustomers(operations.customers);
    setSuppliers(operations.suppliers);
    setTransactions(operations.transactions);
    setSettings({ ...DEFAULT_SETTINGS, ...operations.settings });
  };

  const loadOperations = async (userId, requestVersion, notify = false) => {
    setPersistenceStatus("loading");
    try {
      const operations = await apiRequest("/operations");
      if (requestVersion !== authVersion.current) return false;
      applyOperations(operations);
      loadedOperationsUserId.current = userId;
      setPersistenceStatus("saved");
      setPersistenceError("");
      return true;
    } catch (error) {
      if (requestVersion === authVersion.current) {
        setPersistenceStatus("error");
        setPersistenceError(error.message || "Unable to load business data.");
        if (notify) showToast(error.message || "Unable to load business data.", "error");
      }
      return false;
    }
  };

  const executeMutation = async (path, method, body) => {
    const requestVersion = authVersion.current;
    setPersistenceStatus("saving");
    try {
      const result = await apiRequest(path, { method, body });
      if (requestVersion !== authVersion.current) return false;
      setPersistenceStatus("saved");
      setPersistenceError("");
      return result;
    } catch (error) {
      if (requestVersion === authVersion.current) {
        setPersistenceStatus("error");
        setPersistenceError(error.message || "Unable to save business data.");
        showToast(error.message || "Unable to save business data.", "error");
      }
      return false;
    }
  };

  useEffect(() => {
    let active = true;
    const verifySession = async (initial = false) => {
      const requestVersion = authVersion.current;
      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
          cache: "no-store"
        });
        if (!response.ok) {
          if (response.status !== 401) {
            throw new Error(getLoginErrorMessage(response.status));
          }
          if (active && requestVersion === authVersion.current) {
            setCurrentUser(null);
            clearOperationalState();
          }
          return;
        }
        const contentType = response.headers.get("content-type") || "";
        const result = contentType.includes("application/json")
          ? await response.json().catch(() => null)
          : null;
        if (
          !result?.user ||
          typeof result.user.email !== "string" ||
          !["admin", "customer"].includes(result.user.role)
        ) {
          throw new Error("Authentication service returned an invalid response.");
        }
        const { user } = result;
        if (active && requestVersion === authVersion.current) {
          setCurrentUser(user);
          setAuthError("");
          if (user.role === "admin") {
            if (loadedOperationsUserId.current !== user.id) {
              await loadOperations(user.id, requestVersion);
            }
          } else {
            clearOperationalState();
          }
        }
      } catch (error) {
        if (active && requestVersion === authVersion.current) {
          const message = error instanceof TypeError
            ? getLoginConnectionError(error)
            : error.message || "Authentication service is unavailable.";
          setAuthError(message);
          setCurrentUser(null);
          clearOperationalState();
        }
      } finally {
        if (active && initial) setAuthLoading(false);
      }
    };
    void verifySession(true);
    const interval = window.setInterval(() => void verifySession(), 60_000);
    const handleFocus = () => void verifySession();
    window.addEventListener("focus", handleFocus);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const login = async (email, password, role = "admin") => {
    const requestVersion = ++authVersion.current;
    setAuthError("");
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      });
      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json")
        ? await response.json()
        : null;
      if (!response.ok) {
        throw new Error(getLoginErrorMessage(response.status, result));
      }
      if (
        !result?.user ||
        typeof result.user.email !== "string" ||
        result.user.role !== role
      ) {
        throw new Error("Authentication service returned an invalid response.");
      }
      if (requestVersion !== authVersion.current) throw new Error("Sign-in was cancelled.");
      if (result.user.role === "admin") {
        await loadOperations(result.user.id, requestVersion, true);
      } else {
        clearOperationalState();
      }
      if (requestVersion !== authVersion.current) throw new Error("Sign-in was cancelled.");
      setCurrentUser(result.user);
      showToast("Signed in successfully.", "success");
      return result.user;
    } catch (error) {
      const loginError = new Error(getLoginConnectionError(error));
      setAuthError(loginError.message);
      throw loginError;
    }
  };

  const logout = async () => {
    authVersion.current += 1;
    setCurrentUser(null);
    clearOperationalState();
    try {
      await apiRequest("/auth/logout", {
        method: "POST",
        body: {}
      });
      showToast("Signed out successfully.", "info");
    } catch (error) {
      showToast(error.message || "Signed out locally, but the server session could not be revoked.", "error");
    } finally {
      clearOperationalState();
    }
  };

  // Product CRUD
  const addProduct = async (productData) => {
    const result = await executeMutation("/products", "POST", productData);
    if (!result) return false;
    setProducts((prev) => [result.product, ...prev]);
    showToast(`Added part "${result.product.name}" to inventory!`);
    return result.product;
  };

  const updateProduct = async (id, updatedFields) => {
    const existing = products.find((item) => item.id === id);
    if (!existing) return false;
    const result = await executeMutation(
      `/products/${encodeURIComponent(id)}`,
      "PUT",
      { ...existing, ...updatedFields }
    );
    if (!result) return false;
    setProducts((prev) => prev.map((item) => item.id === id ? result.product : item));
    showToast("Product updated successfully!");
    return result.product;
  };

  const deleteProduct = async (id) => {
    const prod = products.find((p) => p.id === id);
    const result = await executeMutation(`/products/${encodeURIComponent(id)}`, "DELETE");
    if (!result) return false;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast(`Deleted "${prod?.name || 'Part'}" from inventory`, "info");
    return true;
  };

  // Customer CRUD
  const addCustomer = async (customerData) => {
    const result = await executeMutation("/customers", "POST", customerData);
    if (!result) return false;
    setCustomers((prev) => [result.customer, ...prev]);
    showToast(`Customer "${result.customer.name}" registered!`);
    return result.customer;
  };

  const updateCustomer = async (id, updatedFields) => {
    const existing = customers.find((customer) => customer.id === id);
    if (!existing) return false;
    const result = await executeMutation(
      `/customers/${encodeURIComponent(id)}`,
      "PUT",
      { ...existing, ...updatedFields }
    );
    if (!result) return false;
    setCustomers((prev) => prev.map((customer) => customer.id === id ? result.customer : customer));
    showToast("Customer details updated!");
    return result.customer;
  };

  const deleteCustomer = async (id) => {
    const cust = customers.find((c) => c.id === id);
    const result = await executeMutation(`/customers/${encodeURIComponent(id)}`, "DELETE");
    if (!result) return false;
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showToast(`Removed customer "${cust?.name}"`, "info");
    return true;
  };

  const recordCustomerPayment = async (customerId, amountReceived, paymentMethod) => {
    const result = await executeMutation(
      `/customers/${encodeURIComponent(customerId)}/payments`,
      "POST",
      { amount: amountReceived, paymentMethod }
    );
    if (!result) return false;
    setCustomers((prev) => prev.map((customer) =>
      customer.id === customerId ? result.customer : customer
    ));
    const amt = Number(amountReceived) || 0;
    showToast(`Received payment of Rs. ${amt.toLocaleString()} from customer!`, "success");
    return result.customer;
  };

  // Supplier CRUD
  const addSupplier = async (supplierData) => {
    const result = await executeMutation("/suppliers", "POST", supplierData);
    if (!result) return false;
    setSuppliers((prev) => [result.supplier, ...prev]);
    showToast(`Supplier "${result.supplier.companyName}" added!`);
    return result.supplier;
  };

  const updateSupplier = async (id, updatedFields) => {
    const existing = suppliers.find((supplier) => supplier.id === id);
    if (!existing) return false;
    const result = await executeMutation(
      `/suppliers/${encodeURIComponent(id)}`,
      "PUT",
      { ...existing, ...updatedFields }
    );
    if (!result) return false;
    setSuppliers((prev) => prev.map((supplier) => supplier.id === id ? result.supplier : supplier));
    showToast("Supplier details updated!");
    return result.supplier;
  };

  const deleteSupplier = async (id) => {
    const sup = suppliers.find((s) => s.id === id);
    const result = await executeMutation(`/suppliers/${encodeURIComponent(id)}`, "DELETE");
    if (!result) return false;
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    showToast(`Removed supplier "${sup?.companyName}"`, "info");
    return true;
  };

  const recordSupplierPayment = async (supplierId, amountPaid, paymentMethod) => {
    const result = await executeMutation(
      `/suppliers/${encodeURIComponent(supplierId)}/payments`,
      "POST",
      { amount: amountPaid, paymentMethod }
    );
    if (!result) return false;
    setSuppliers((prev) => prev.map((supplier) =>
      supplier.id === supplierId ? result.supplier : supplier
    ));
    const amt = Number(amountPaid) || 0;
    showToast(`Recorded payment of Rs. ${amt.toLocaleString()} to supplier.`, "success");
    return result.supplier;
  };

  // Complete POS Sale
  const completeSale = async (saleData) => {
    const result = await executeMutation("/sales", "POST", saleData);
    if (!result) return false;
    setProducts((prev) => prev.map((product) => {
      const stockUpdate = result.stockUpdates.find((item) => item.id === product.id);
      return stockUpdate ? { ...product, stock: stockUpdate.stock } : product;
    }));
    setTransactions((prev) => [result.transaction, ...prev]);
    if (result.customer) {
      setCustomers((prev) => prev.map((customer) =>
        customer.id === result.customer.id ? result.customer : customer
      ));
    }
    showToast(`Sale completed! Invoice ${result.transaction.id} generated.`, "success");
    return result.transaction;
  };

  // Settings
  const updateSettings = async (newSettings) => {
    const result = await executeMutation("/settings", "PUT", newSettings);
    if (!result) return false;
    setSettings({ ...DEFAULT_SETTINGS, ...result.settings });
    showToast("System settings updated successfully!");
    return result.settings;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        authLoading,
        authError,
        login,
        logout,
        persistenceStatus,
        persistenceError,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        recordCustomerPayment,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        recordSupplierPayment,
        transactions,
        completeSale,
        settings,
        updateSettings,
        toast,
        showToast
      }}
    >
      {children}
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white font-medium text-sm transition-all transform animate-bounce-short bg-slate-900 border border-slate-700/60 backdrop-blur-md">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              toast.type === "error"
                ? "bg-red-500"
                : toast.type === "info"
                ? "bg-blue-400"
                : "bg-emerald-400"
            }`}
          />
          <span>{toast.message}</span>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
