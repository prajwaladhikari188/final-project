import React, { createContext, useContext, useState, useEffect } from "react";
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_TRANSACTIONS,
  INITIAL_SETTINGS
} from "../data/demoData";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // 1. Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("mama_auth_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Default logged in as Admin for instant usability
    return {
      role: "admin",
      name: "Prajwal (Admin)",
      email: "admin@mamaautoparts.com.np",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    };
  });

  // 2. Products State
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("mama_products");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  // 3. Customers State
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem("mama_customers");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_CUSTOMERS;
  });

  // 4. Suppliers State
  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem("mama_suppliers");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_SUPPLIERS;
  });

  // 5. Transactions / Invoices State
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("mama_transactions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  // 6. Settings State
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("mama_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_SETTINGS;
  });

  // Toast / notification banner
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem("mama_auth_user", JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("mama_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("mama_customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("mama_suppliers", JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem("mama_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("mama_settings", JSON.stringify(settings));
  }, [settings]);

  // Auth Functions
  const login = (role, email, customerData = null) => {
    if (role === "admin") {
      const user = {
        role: "admin",
        name: "Prajwal (Admin)",
        email: email || "admin@mamaautoparts.com.np",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
      };
      setCurrentUser(user);
      showToast("Welcome back, Prajwal! Admin session started.", "success");
      return user;
    } else {
      const customer = customerData || customers.find(c => c.email.toLowerCase() === email.toLowerCase()) || customers[0];
      const user = {
        role: "customer",
        customerId: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        vehicle: customer.vehicle,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
      };
      setCurrentUser(user);
      showToast(`Welcome, ${customer.name}! Customer portal active.`, "success");
      return user;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("mama_auth_user");
    showToast("Signed out successfully. See you again!", "info");
  };

  // Product CRUD
  const addProduct = (productData) => {
    const newProduct = {
      ...productData,
      id: "prod-" + Date.now(),
      purchasePrice: parseFloat(productData.purchasePrice) || 0,
      sellingPrice: parseFloat(productData.sellingPrice) || 0,
      stock: parseInt(productData.stock, 10) || 0,
      minStock: parseInt(productData.minStock, 10) || 5
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Added part "${newProduct.name}" to inventory!`);
    return newProduct;
  };

  const updateProduct = (id, updatedFields) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            ...updatedFields,
            purchasePrice: parseFloat(updatedFields.purchasePrice ?? item.purchasePrice),
            sellingPrice: parseFloat(updatedFields.sellingPrice ?? item.sellingPrice),
            stock: parseInt(updatedFields.stock ?? item.stock, 10),
            minStock: parseInt(updatedFields.minStock ?? item.minStock, 10)
          };
        }
        return item;
      })
    );
    showToast("Product updated successfully!");
  };

  const deleteProduct = (id) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast(`Deleted "${prod?.name || 'Part'}" from inventory`, "info");
  };

  // Customer CRUD
  const addCustomer = (customerData) => {
    const newCust = {
      ...customerData,
      id: "cust-" + Date.now(),
      balance: parseFloat(customerData.balance) || 0,
      totalSpent: parseFloat(customerData.totalSpent) || 0,
      lastVisit: new Date().toISOString().split("T")[0]
    };
    setCustomers((prev) => [newCust, ...prev]);
    showToast(`Customer "${newCust.name}" registered!`);
    return newCust;
  };

  const updateCustomer = (id, updatedFields) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              ...updatedFields,
              balance: parseFloat(updatedFields.balance ?? c.balance),
              totalSpent: parseFloat(updatedFields.totalSpent ?? c.totalSpent)
            }
          : c
      )
    );
    showToast("Customer details updated!");
  };

  const deleteCustomer = (id) => {
    const cust = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showToast(`Removed customer "${cust?.name}"`, "info");
  };

  const recordCustomerPayment = (customerId, amountReceived) => {
    const amt = parseFloat(amountReceived) || 0;
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newBal = Math.max(0, c.balance - amt);
          return { ...c, balance: newBal };
        }
        return c;
      })
    );
    showToast(`Received payment of Rs. ${amt.toLocaleString()} from customer!`, "success");
  };

  // Supplier CRUD
  const addSupplier = (supplierData) => {
    const newSup = {
      ...supplierData,
      id: "sup-" + Date.now(),
      balance: parseFloat(supplierData.balance) || 0,
      status: supplierData.status || "Active"
    };
    setSuppliers((prev) => [newSup, ...prev]);
    showToast(`Supplier "${newSup.companyName}" added!`);
    return newSup;
  };

  const updateSupplier = (id, updatedFields) => {
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              ...updatedFields,
              balance: parseFloat(updatedFields.balance ?? s.balance)
            }
          : s
      )
    );
    showToast("Supplier details updated!");
  };

  const deleteSupplier = (id) => {
    const sup = suppliers.find((s) => s.id === id);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    showToast(`Removed supplier "${sup?.companyName}"`, "info");
  };

  const recordSupplierPayment = (supplierId, amountPaid) => {
    const amt = parseFloat(amountPaid) || 0;
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          const newBal = Math.max(0, s.balance - amt);
          return { ...s, balance: newBal };
        }
        return s;
      })
    );
    showToast(`Recorded payment of Rs. ${amt.toLocaleString()} to supplier.`, "success");
  };

  // Complete POS Sale
  const completeSale = (saleData) => {
    // 1. Generate Invoice Number
    const invNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTransaction = {
      ...saleData,
      id: invNumber,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      cashier: currentUser ? currentUser.name : "Sales Register"
    };

    // 2. Deduct inventory quantities
    setProducts((prev) => {
      return prev.map((p) => {
        const cartItem = saleData.items.find((item) => item.id === p.id);
        if (cartItem) {
          const updatedStock = Math.max(0, p.stock - cartItem.quantity);
          return { ...p, stock: updatedStock };
        }
        return p;
      });
    });

    // 3. Update customer totalSpent and balance if credit
    if (saleData.customerId) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === saleData.customerId) {
            const addedDue = saleData.paymentMethod === "Credit / Due" ? saleData.grandTotal : 0;
            return {
              ...c,
              totalSpent: (c.totalSpent || 0) + saleData.grandTotal,
              balance: (c.balance || 0) + addedDue,
              lastVisit: new Date().toISOString().split("T")[0]
            };
          }
          return c;
        })
      );
    }

    // 4. Save transaction
    setTransactions((prev) => [newTransaction, ...prev]);
    showToast(`Sale completed! Invoice ${invNumber} generated.`, "success");
    return newTransaction;
  };

  // Settings
  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast("System settings updated successfully!");
  };

  // Reset demo data
  const resetDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setSettings(INITIAL_SETTINGS);
    localStorage.removeItem("mama_products");
    localStorage.removeItem("mama_customers");
    localStorage.removeItem("mama_suppliers");
    localStorage.removeItem("mama_transactions");
    localStorage.removeItem("mama_settings");
    showToast("All data successfully restored to realistic sample state!", "info");
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
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
        resetDemoData,
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
