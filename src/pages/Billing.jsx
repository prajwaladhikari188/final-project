import React, { useState, useMemo } from "react";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Printer,
  CreditCard,
  QrCode,
  DollarSign,
  User,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Bike,
  Sparkles,
  Receipt
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { CATEGORIES } from "../data/appDefaults";
import InvoiceModal from "../components/InvoiceModal";
import CustomerModal from "../components/CustomerModal";

const Billing = () => {
  const { products, customers, completeSale, settings, addCustomer } = useApp();

  // POS State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [cart, setCart] = useState([]);
  
  // Customer selection
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");

  // Billing calculation inputs
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Fonepay QR");
  const [saleNotes, setSaleNotes] = useState("");

  // Modals
  const [completedInvoice, setCompletedInvoice] = useState(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCompletingSale, setIsCompletingSale] = useState(false);

  // Selected customer object
  const activeCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Update vehicle plate if existing customer is selected
  const handleCustomerChange = (id) => {
    setSelectedCustomerId(id);
    if (id) {
      const cust = customers.find((c) => c.id === id);
      if (cust && cust.vehicle) {
        setVehiclePlate(cust.vehicle);
      }
    }
  };

  // Filter products for POS shelf
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.bikeModel && p.bikeModel.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === "All Categories" || p.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  // Add Item to Cart
  const handleAddToCart = (product) => {
    if (product.stock <= 0) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        // Check if exceeded stock
        if (existing.quantity >= product.stock) {
          alert(`Cannot add more. Only ${product.stock} units available in stock.`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            code: product.code,
            price: product.sellingPrice,
            quantity: 1,
            maxStock: product.stock
          }
        ];
      }
    });
  };

  // Update Cart Quantity
  const handleUpdateQty = (productId, delta) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.maxStock) {
              alert(`Maximum available stock is ${item.maxStock} units.`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  // Remove Item
  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  // Clear Cart
  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm("Are you sure you want to clear the active register bill?")) {
      setCart([]);
      setDiscountAmount(0);
    }
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const discount = Math.min(Number(discountAmount) || 0, subtotal);
  const taxableAmount = Math.max(0, subtotal - discount);
  const vatRate = settings.enableTax ? settings.vatRate || 13 : 0;
  const vatAmount = Math.round((taxableAmount * vatRate) / 100);
  const grandTotal = taxableAmount + vatAmount;

  // Complete and Print Sale
  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      alert("Cart is empty! Add at least one spare part to bill.");
      return;
    }

    const customerName = activeCustomer
      ? activeCustomer.name
      : walkInName.trim() || "Retail Walk-in Customer";
    const customerPhone = activeCustomer
      ? activeCustomer.phone
      : walkInPhone.trim() || "";
    const customerVehicle = vehiclePlate.trim() || (activeCustomer ? activeCustomer.vehicle : "");

    const salePayload = {
      customerId: activeCustomer ? activeCustomer.id : null,
      customerName,
      customerPhone,
      customerVehicle,
      items: cart.map((i) => ({
        id: i.id,
        name: i.name,
        code: i.code,
        price: i.price,
        quantity: i.quantity,
        total: i.price * i.quantity
      })),
      subtotal,
      discount,
      vatRate,
      vatAmount,
      grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === "Credit / Due" ? "Credit Due" : "Paid",
      notes: saleNotes.trim()
    };

    setIsCompletingSale(true);
    const newInvoice = await completeSale(salePayload);
    setIsCompletingSale(false);
    if (!newInvoice) return;

    // Reset register fields
    setCart([]);
    setDiscountAmount(0);
    setSaleNotes("");
    setWalkInName("");
    setWalkInPhone("");
    setVehiclePlate("");
    setSelectedCustomerId("");

    // Open Invoice Print Modal
    setCompletedInvoice(newInvoice);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight flex items-center gap-2">
              <Receipt className="w-6 h-6 text-blue-600" /> POS Billing Register
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
              Cashier Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fast counter billing with instant stock deduction, 13% Nepal VAT, and Fonepay receipt.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            <span>+ Quick Customer</span>
          </button>
        </div>
      </div>

      {/* Main POS Layout (2 Columns: Product Catalog 7 cols, Live Invoice Cart 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Catalog & Search (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Fast Category Tabs */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search part by name, code, brand, or bike model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none transition"
              />
            </div>

            {/* Category horizontal scrolling selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition ${
                    selectedCategory === cat
                      ? "bg-slate-900 text-white shadow-xs font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredProducts.length === 0 ? (
              <div className="col-span-2 py-16 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                <Bike className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">No spare parts found</p>
                <p className="text-xs text-slate-400">Try adjusting your search query</p>
              </div>
            ) : (
              filteredProducts.map((p) => {
                const isOutOfStock = p.stock <= 0;
                const inCartItem = cart.find((i) => i.id === p.id);

                return (
                  <div
                    key={p.id}
                    className={`bg-white rounded-2xl p-4 border transition-all duration-150 flex flex-col justify-between ${
                      isOutOfStock
                        ? "opacity-60 border-slate-200 bg-slate-50"
                        : "border-slate-200/80 hover:border-blue-300 hover:shadow-md cursor-pointer"
                    }`}
                    onClick={() => !isOutOfStock && handleAddToCart(p)}
                  >
                    <div>
                      <div className="mb-3 flex h-28 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.imageAlt || p.name}
                            loading="lazy"
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <Bike className="h-10 w-10 text-slate-300" />
                        )}
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {p.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOutOfStock
                              ? "bg-red-100 text-red-700"
                              : p.stock <= 5
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {isOutOfStock ? "Out of Stock" : `${p.stock} in stock`}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm mt-2 line-clamp-1">
                        {p.name}
                      </h3>

                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                        <Bike className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{p.bikeModel || "Universal"}</span>
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 font-medium">Price:</span>
                        <p className="text-sm font-extrabold text-blue-700">
                          {settings.currency} {p.sellingPrice.toLocaleString()}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(p);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                          isOutOfStock
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                            : inCartItem
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                        }`}
                      >
                        {inCartItem ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Added ({inCartItem.quantity})</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Live Register / Bill (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Current Bill</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                  {cart.reduce((acc, i) => acc + i.quantity, 0)} items
                </span>
              </div>
              <button
                onClick={handleClearCart}
                disabled={cart.length === 0}
                className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1 disabled:opacity-30 disabled:hover:text-slate-400 transition"
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            </div>

            {/* Customer Details Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-blue-600" /> Customer Information:
                </label>
                {activeCustomer && activeCustomer.balance > 0 && (
                  <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                    Due: Rs. {activeCustomer.balance.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Customer Selector */}
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-medium"
              >
                <option value="">-- Walk-in Retail Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) - {c.vehicle || "Motorcycle"}
                  </option>
                ))}
              </select>

              {/* If Walk-in: manual name & vehicle number plate */}
              {!selectedCustomerId && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Bike No. (e.g. Ba 2 Pa 7845)"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1">
              {cart.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-500">Cart is empty</p>
                  <p className="text-[11px] text-slate-400">
                    Click any spare part on the left to add to bill
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {settings.currency} {item.price.toLocaleString()} × {item.quantity}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleUpdateQty(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <p className="text-xs font-bold text-slate-900">
                        {settings.currency} {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition"
                      title="Remove from bill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Billing Calculation & Payment Form */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            {/* Discount & Payment Method Selectors */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Discount Amount (Rs.):
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={discountAmount || ""}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Payment Method:
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800"
                >
                  <option value="Fonepay QR">Fonepay QR (Digital)</option>
                  <option value="Cash">Cash at Counter</option>
                  <option value="eSewa / Khalti">eSewa / Khalti</option>
                  <option value="Bank Card">Bank Card POS</option>
                  <option value="Credit / Due">Store Credit / Due</option>
                </select>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">
                  {settings.currency} {subtotal.toLocaleString()}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount:</span>
                  <span>- {settings.currency} {discount.toLocaleString()}</span>
                </div>
              )}
              {settings.enableTax && (
                <div className="flex justify-between">
                  <span>Nepal VAT ({vatRate}%):</span>
                  <span className="font-semibold text-slate-800">
                    {settings.currency} {vatAmount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="text-blue-700 font-display">
                  {settings.currency} {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Checkout & Print Button */}
            <button
              type="button"
              disabled={cart.length === 0 || isCompletingSale}
              onClick={handleCompleteSale}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 transform active:scale-98"
            >
              <Printer className="w-4 h-4" />
              <span>{isCompletingSale ? "Saving Sale…" : "Complete Sale & Print Invoice"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Modal for freshly completed sale */}
      {completedInvoice && (
        <InvoiceModal
          invoice={completedInvoice}
          onClose={() => setCompletedInvoice(null)}
        />
      )}

      {/* Quick Add Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={async (data) => {
          const newCust = await addCustomer(data);
          if (!newCust) return false;
          setSelectedCustomerId(newCust.id);
          return newCust;
        }}
      />
    </div>
  );
};

export default Billing;
