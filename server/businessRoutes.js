import express from "express";
import { randomUUID } from "node:crypto";
import { CATEGORIES, DEFAULT_SETTINGS } from "../src/data/appDefaults.js";

const productCategories = new Set(CATEGORIES.filter((category) => category !== "All Categories"));
const localDemoMode =
  process.env.NODE_ENV !== "production" && process.env.DEMO_ACCOUNTS_ENABLED === "true";

function requestError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function text(value, field, max, required = false) {
  if (typeof value !== "string") {
    if (required) throw requestError(400, `${field} is required.`);
    return "";
  }
  const normalized = value.trim();
  if ((required && !normalized) || normalized.length > max) {
    throw requestError(400, `Enter a valid ${field.toLowerCase()}.`);
  }
  return normalized;
}

function money(value, field, { required = true, max = 99999999.99 } = {}) {
  if (!required && (value === undefined || value === null || value === "")) return 0;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > max) {
    throw requestError(400, `Enter a valid ${field.toLowerCase()}.`);
  }
  return Math.round(parsed * 100) / 100;
}

function integer(value, field, { required = true, max = 10000000 } = {}) {
  if (!required && (value === undefined || value === null || value === "")) return 0;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > max) {
    throw requestError(400, `Enter a valid ${field.toLowerCase()}.`);
  }
  return parsed;
}

function nullableText(value, field, max) {
  const normalized = text(value ?? "", field, max);
  return normalized || null;
}

function mapProduct(row) {
  return {
    id: row.id,
    name: row.part_name,
    code: row.sku,
    category: row.category,
    brand: row.brand_name,
    bikeModel: row.bike_model,
    purchasePrice: Number(row.unit_cost),
    sellingPrice: Number(row.selling_price),
    stock: Number(row.stock_quantity),
    minStock: Number(row.min_reorder_level),
    rackLocation: row.rack_location || "",
    warranty: row.warranty,
    description: row.description || "",
    image: row.image_data || "",
    imageAlt: row.image_data ? `${row.part_name} product image` : "",
    isSample: Number(row.is_sample) === 1
  };
}

function mapCustomer(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email || "",
    address: row.address || "",
    vehicle: row.vehicle || "",
    balance: Number(row.balance),
    totalSpent: Number(row.total_spent),
    notes: row.notes || "",
    lastVisit: row.last_visit || ""
  };
}

function mapSupplier(row) {
  return {
    id: row.id,
    companyName: row.company_name,
    contactPerson: row.contact_person,
    phone: row.phone,
    email: row.email || "",
    address: row.address || "",
    panNumber: row.pan_number || "",
    categories: row.categories || "",
    balance: Number(row.balance),
    status: row.status
  };
}

function mapTransaction(row, items) {
  return {
    id: row.invoice_number,
    date: row.created_at,
    cashier: row.created_by,
    customerId: row.business_customer_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone || "",
    customerVehicle: row.customer_vehicle,
    items,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount_amount),
    vatRate: Number(row.vat_rate),
    vatAmount: Number(row.tax_amount),
    taxEnabled: Number(row.tax_enabled) === 1,
    grandTotal: Number(row.total_amount),
    paymentMethod: row.payment_method_label || row.payment_method,
    paymentStatus: row.payment_status,
    notes: row.notes || "",
    isSample: Number(row.is_sample) === 1
  };
}

function parseProduct(body) {
  const category = text(body?.category, "Category", 100, true);
  if (!productCategories.has(category)) throw requestError(400, "Select a valid product category.");
  const image = text(body?.image ?? "", "Image", 60000);
  if (image && !image.startsWith("data:image/svg+xml,")) {
    throw requestError(400, "Product images must be local SVG sample images.");
  }
  return {
    name: text(body?.name, "Product name", 200, true),
    code: text(body?.code, "Product SKU", 50, true).toUpperCase(),
    category,
    brand: text(body?.brand ?? "", "Brand", 100),
    bikeModel: text(body?.bikeModel ?? "", "Compatible model", 200),
    purchasePrice: money(body?.purchasePrice, "Purchase price"),
    sellingPrice: money(body?.sellingPrice, "Selling price"),
    stock: integer(body?.stock, "Stock quantity"),
    minStock: integer(body?.minStock, "Minimum stock"),
    rackLocation: text(body?.rackLocation ?? "", "Rack location", 50),
    warranty: text(body?.warranty ?? "", "Warranty", 100),
    description: text(body?.description ?? "", "Description", 4000),
    image
  };
}

function parseCustomer(body) {
  const phone = text(body?.phone, "Phone number", 50, true);
  const email = text(body?.email ?? "", "Email address", 254);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw requestError(400, "Enter a valid email address.");
  }
  return {
    name: text(body?.name, "Customer name", 150, true),
    phone,
    email: email || null,
    address: nullableText(body?.address, "Address", 255),
    vehicle: nullableText(body?.vehicle, "Vehicle", 150),
    balance: money(body?.balance ?? 0, "Customer balance"),
    notes: nullableText(body?.notes, "Customer notes", 4000)
  };
}

function parseSupplier(body) {
  const phone = text(body?.phone, "Phone number", 50, true);
  const email = text(body?.email ?? "", "Email address", 254);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw requestError(400, "Enter a valid email address.");
  }
  const status = body?.status === undefined ? "Active" : body.status;
  if (!["Active", "Inactive"].includes(status)) throw requestError(400, "Select a valid supplier status.");
  return {
    companyName: text(body?.companyName, "Supplier name", 150, true),
    contactPerson: text(body?.contactPerson ?? "", "Contact person", 100),
    phone,
    email: email || null,
    address: nullableText(body?.address, "Address", 255),
    panNumber: nullableText(body?.panNumber, "PAN number", 50),
    categories: nullableText(body?.categories, "Supplied categories", 2000),
    balance: money(body?.balance ?? 0, "Supplier balance"),
    status
  };
}

function parseSettings(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw requestError(400, "Provide valid store settings.");
  }
  const settings = { ...DEFAULT_SETTINGS };
  settings.shopName = text(body.shopName, "Business name", 150, true);
  settings.tagline = text(body.tagline ?? "", "Tagline", 200);
  settings.address = text(body.address ?? "", "Business address", 255);
  settings.phone = text(body.phone ?? "", "Phone number", 100);
  settings.email = text(body.email ?? "", "Email address", 254);
  if (settings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
    throw requestError(400, "Enter a valid business email address.");
  }
  settings.panNumber = text(body.panNumber ?? "", "PAN / VAT number", 50);
  settings.currency = text(body.currency ?? "Rs.", "Currency symbol", 10, true);
  settings.vatRate = Number(body.vatRate ?? DEFAULT_SETTINGS.vatRate);
  settings.lowStockThreshold = integer(body.lowStockThreshold ?? DEFAULT_SETTINGS.lowStockThreshold, "Low stock threshold");
  if (!Number.isFinite(settings.vatRate) || settings.vatRate < 0 || settings.vatRate > 50) {
    throw requestError(400, "VAT rate must be between 0 and 50 percent.");
  }
  for (const key of ["enableTax"]) {
    if (typeof body[key] === "boolean") settings[key] = body[key];
  }
  for (const key of ["invoiceNote", "invoiceFooter"]) {
    settings[key] = text(body[key] ?? "", key, 1000);
  }
  return settings;
}

async function getStoreSettings(pool) {
  const [rows] = await pool.execute("SELECT settings_json FROM store_settings WHERE id = 1 LIMIT 1");
  if (rows.length === 0) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(rows[0].settings_json) };
  } catch {
    throw new Error("Stored shop settings are invalid JSON.");
  }
}

async function loadOperations(pool) {
  const sampleFilter = localDemoMode ? "" : " AND is_sample = 0";
  const [productRows, customerRows, supplierRows, invoiceRows, settingsRows] = await Promise.all([
    pool.execute(
      `SELECT * FROM inventory_items WHERE is_active = 1${sampleFilter} ORDER BY category, sku LIMIT 2000`
    ),
    pool.execute(
      "SELECT * FROM business_customers WHERE is_active = 1 ORDER BY name LIMIT 2000"
    ),
    pool.execute(
      "SELECT * FROM business_suppliers WHERE is_active = 1 ORDER BY company_name LIMIT 2000"
    ),
    pool.execute(
      `SELECT * FROM invoices WHERE 1 = 1${localDemoMode ? "" : " AND is_sample = 0"}
       ORDER BY created_at DESC LIMIT 1000`
    ),
    pool.execute("SELECT settings_json FROM store_settings WHERE id = 1 LIMIT 1")
  ]);
  const products = productRows[0].map(mapProduct);
  const customers = customerRows[0].map(mapCustomer);
  const suppliers = supplierRows[0].map(mapSupplier);
  const invoices = invoiceRows[0];
  let transactions = [];

  if (invoices.length > 0) {
    const invoicePlaceholders = invoices.map(() => "?").join(", ");
    const [itemRows] = await pool.execute(
      `SELECT ii.invoice_id, ii.part_id, ii.quantity, ii.unit_price, ii.total_price,
              ii.part_name_snapshot, ii.sku_snapshot, p.part_name, p.sku
       FROM invoice_items ii
       JOIN invoices i ON i.id = ii.invoice_id
       LEFT JOIN inventory_items p ON p.id = ii.part_id
       WHERE i.id IN (${invoicePlaceholders})
       ORDER BY i.created_at DESC, ii.id`,
      invoices.map(({ id }) => id)
    );
    const itemsByInvoice = new Map(invoices.map((invoice) => [invoice.id, []]));
    for (const item of itemRows) {
      itemsByInvoice.get(item.invoice_id)?.push({
        id: item.part_id,
        name: item.part_name_snapshot || item.part_name || "Deleted product",
        code: item.sku_snapshot || item.sku || "",
        price: Number(item.unit_price),
        quantity: Number(item.quantity),
        total: Number(item.total_price)
      });
    }
    transactions = invoices.map((invoice) => mapTransaction(invoice, itemsByInvoice.get(invoice.id) || []));
  }

  let settings = DEFAULT_SETTINGS;
  if (settingsRows[0].length > 0) {
    try {
      settings = { ...DEFAULT_SETTINGS, ...JSON.parse(settingsRows[0][0].settings_json) };
    } catch {
      throw new Error("Stored shop settings are invalid JSON.");
    }
  }

  return { products, customers, suppliers, transactions, settings };
}

function parsePaymentAmount(value) {
  const amount = money(value, "Payment amount");
  if (amount <= 0) throw requestError(400, "Payment amount must be greater than zero.");
  return amount;
}

export function createBusinessRouter(pool, loadUser, requireAllowedOrigin) {
  const router = express.Router();
  router.use(loadUser);
  router.use((req, _res, next) => {
    if (req.user?.role !== "admin") return next(requestError(403, "Administrator access required."));
    return next();
  });
  router.use((req, res, next) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      return requireAllowedOrigin(req, res, next);
    }
    return next();
  });

  router.get("/operations", async (_req, res) => {
    res.json(await loadOperations(pool));
  });

  router.post("/products", async (req, res) => {
    const product = parseProduct(req.body);
    const id = randomUUID();
    await pool.execute(
      `INSERT INTO inventory_items
       (id, sku, part_name, category, stock_quantity, min_reorder_level, unit_cost,
        selling_price, rack_location, is_active, brand_name, bike_model, description, warranty, image_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)`,
      [
        id, product.code, product.name, product.category, product.stock, product.minStock,
        product.purchasePrice, product.sellingPrice, product.rackLocation, product.brand,
        product.bikeModel, product.description, product.warranty, product.image || null
      ]
    );
    const [rows] = await pool.execute("SELECT * FROM inventory_items WHERE id = ? LIMIT 1", [id]);
    res.status(201).json({ product: mapProduct(rows[0]) });
  });

  router.put("/products/:id", async (req, res) => {
    const product = parseProduct(req.body);
    const id = text(req.params.id, "Product ID", 36, true);
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(
        "SELECT stock_quantity FROM inventory_items WHERE id = ? AND is_active = 1 FOR UPDATE",
        [id]
      );
      if (rows.length === 0) throw requestError(404, "Product was not found.");
      const stockChange = product.stock - Number(rows[0].stock_quantity);
      await connection.execute(
        `UPDATE inventory_items
         SET sku = ?, part_name = ?, category = ?, min_reorder_level = ?,
             unit_cost = ?, selling_price = ?, rack_location = ?, brand_name = ?, bike_model = ?,
             description = ?, warranty = ?, image_data = ?
         WHERE id = ? AND is_active = 1`,
        [
          product.code, product.name, product.category, product.minStock,
          product.purchasePrice, product.sellingPrice, product.rackLocation, product.brand,
          product.bikeModel, product.description, product.warranty, product.image || null, id
        ]
      );
      if (stockChange !== 0) {
        await connection.execute(
          `INSERT INTO stock_ledger (id, part_id, change_type, quantity_changed, notes, created_by)
           VALUES (?, ?, 'ADJUSTMENT', ?, ?, ?)`,
          [randomUUID(), id, stockChange, "Product inventory adjustment", req.user.name]
        );
      }
      const [updatedRows] = await connection.execute("SELECT * FROM inventory_items WHERE id = ? LIMIT 1", [id]);
      await connection.commit();
      res.json({ product: mapProduct(updatedRows[0]) });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  });

  router.delete("/products/:id", async (req, res) => {
    const id = text(req.params.id, "Product ID", 36, true);
    const [result] = await pool.execute(
      "UPDATE inventory_items SET is_active = 0 WHERE id = ? AND is_active = 1",
      [id]
    );
    if (result.affectedRows !== 1) throw requestError(404, "Product was not found.");
    res.json({ id, deleted: true });
  });

  router.post("/customers", async (req, res) => {
    const customer = parseCustomer(req.body);
    const id = randomUUID();
    await pool.execute(
      `INSERT INTO business_customers
       (id, name, phone, email, address, vehicle, balance, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, customer.name, customer.phone, customer.email, customer.address, customer.vehicle, customer.balance, customer.notes]
    );
    const [rows] = await pool.execute("SELECT * FROM business_customers WHERE id = ? LIMIT 1", [id]);
    res.status(201).json({ customer: mapCustomer(rows[0]) });
  });

  router.put("/customers/:id", async (req, res) => {
    const customer = parseCustomer(req.body);
    const id = text(req.params.id, "Customer ID", 36, true);
    const [result] = await pool.execute(
      `UPDATE business_customers
       SET name = ?, phone = ?, email = ?, address = ?, vehicle = ?, balance = ?, notes = ?
       WHERE id = ? AND is_active = 1`,
      [customer.name, customer.phone, customer.email, customer.address, customer.vehicle, customer.balance, customer.notes, id]
    );
    if (result.affectedRows === 0) {
      const [rows] = await pool.execute("SELECT id FROM business_customers WHERE id = ? AND is_active = 1", [id]);
      if (rows.length === 0) throw requestError(404, "Customer was not found.");
    }
    const [rows] = await pool.execute("SELECT * FROM business_customers WHERE id = ? LIMIT 1", [id]);
    res.json({ customer: mapCustomer(rows[0]) });
  });

  router.delete("/customers/:id", async (req, res) => {
    const id = text(req.params.id, "Customer ID", 36, true);
    const [result] = await pool.execute(
      "UPDATE business_customers SET is_active = 0 WHERE id = ? AND is_active = 1",
      [id]
    );
    if (result.affectedRows !== 1) throw requestError(404, "Customer was not found.");
    res.json({ id, deleted: true });
  });

  router.post("/customers/:id/payments", async (req, res) => {
    const id = text(req.params.id, "Customer ID", 36, true);
    const amount = parsePaymentAmount(req.body?.amount);
    const paymentMethod = text(req.body?.paymentMethod, "Payment method", 50, true);
    if (!["Fonepay QR", "Cash at Counter", "eSewa / Khalti", "Bank Deposit"].includes(paymentMethod)) {
      throw requestError(400, "Select a valid customer payment method.");
    }
    const notes = text(req.body?.notes ?? "", "Payment notes", 255);
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(
        "SELECT balance FROM business_customers WHERE id = ? AND is_active = 1 FOR UPDATE",
        [id]
      );
      if (rows.length === 0) throw requestError(404, "Customer was not found.");
      const balance = Number(rows[0].balance);
      if (amount > balance) throw requestError(400, "Payment cannot exceed the customer's outstanding balance.");
      await connection.execute(
        "INSERT INTO customer_payments (id, customer_id, amount, payment_method, notes, received_by) VALUES (?, ?, ?, ?, ?, ?)",
        [randomUUID(), id, amount, paymentMethod, notes, req.user.name]
      );
      await connection.execute(
        "UPDATE business_customers SET balance = balance - ? WHERE id = ?",
        [amount, id]
      );
      const [updatedRows] = await connection.execute("SELECT * FROM business_customers WHERE id = ? LIMIT 1", [id]);
      await connection.commit();
      res.json({ customer: mapCustomer(updatedRows[0]) });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  });

  router.post("/suppliers", async (req, res) => {
    const supplier = parseSupplier(req.body);
    const id = randomUUID();
    await pool.execute(
      `INSERT INTO business_suppliers
       (id, company_name, contact_person, phone, email, address, pan_number, categories, balance, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, supplier.companyName, supplier.contactPerson, supplier.phone, supplier.email,
        supplier.address, supplier.panNumber, supplier.categories, supplier.balance, supplier.status
      ]
    );
    const [rows] = await pool.execute("SELECT * FROM business_suppliers WHERE id = ? LIMIT 1", [id]);
    res.status(201).json({ supplier: mapSupplier(rows[0]) });
  });

  router.put("/suppliers/:id", async (req, res) => {
    const supplier = parseSupplier(req.body);
    const id = text(req.params.id, "Supplier ID", 36, true);
    const [result] = await pool.execute(
      `UPDATE business_suppliers
       SET company_name = ?, contact_person = ?, phone = ?, email = ?, address = ?,
           pan_number = ?, categories = ?, balance = ?, status = ?
       WHERE id = ? AND is_active = 1`,
      [
        supplier.companyName, supplier.contactPerson, supplier.phone, supplier.email,
        supplier.address, supplier.panNumber, supplier.categories, supplier.balance, supplier.status, id
      ]
    );
    if (result.affectedRows === 0) {
      const [rows] = await pool.execute("SELECT id FROM business_suppliers WHERE id = ? AND is_active = 1", [id]);
      if (rows.length === 0) throw requestError(404, "Supplier was not found.");
    }
    const [rows] = await pool.execute("SELECT * FROM business_suppliers WHERE id = ? LIMIT 1", [id]);
    res.json({ supplier: mapSupplier(rows[0]) });
  });

  router.delete("/suppliers/:id", async (req, res) => {
    const id = text(req.params.id, "Supplier ID", 36, true);
    const [result] = await pool.execute(
      "UPDATE business_suppliers SET is_active = 0 WHERE id = ? AND is_active = 1",
      [id]
    );
    if (result.affectedRows !== 1) throw requestError(404, "Supplier was not found.");
    res.json({ id, deleted: true });
  });

  router.post("/suppliers/:id/payments", async (req, res) => {
    const id = text(req.params.id, "Supplier ID", 36, true);
    const amount = parsePaymentAmount(req.body?.amount);
    const paymentMethod = text(req.body?.paymentMethod, "Payment method", 50, true);
    if (!["Bank Transfer / Cheque", "Fonepay / Corporate QR", "Cash Receipt"].includes(paymentMethod)) {
      throw requestError(400, "Select a valid supplier payment method.");
    }
    const notes = text(req.body?.notes ?? "", "Payment notes", 255);
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(
        "SELECT balance FROM business_suppliers WHERE id = ? AND is_active = 1 FOR UPDATE",
        [id]
      );
      if (rows.length === 0) throw requestError(404, "Supplier was not found.");
      const balance = Number(rows[0].balance);
      if (amount > balance) throw requestError(400, "Payment cannot exceed the supplier's outstanding balance.");
      await connection.execute(
        "INSERT INTO supplier_payments (id, supplier_id, amount, payment_method, notes, paid_by) VALUES (?, ?, ?, ?, ?, ?)",
        [randomUUID(), id, amount, paymentMethod, notes, req.user.name]
      );
      await connection.execute(
        "UPDATE business_suppliers SET balance = balance - ? WHERE id = ?",
        [amount, id]
      );
      const [updatedRows] = await connection.execute("SELECT * FROM business_suppliers WHERE id = ? LIMIT 1", [id]);
      await connection.commit();
      res.json({ supplier: mapSupplier(updatedRows[0]) });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  });

  router.put("/settings", async (req, res) => {
    const settings = parseSettings(req.body);
    await pool.execute(
      `INSERT INTO store_settings (id, settings_json, updated_by)
       VALUES (1, ?, ?)
       ON DUPLICATE KEY UPDATE settings_json = VALUES(settings_json), updated_by = VALUES(updated_by)`,
      [JSON.stringify(settings), req.user.name]
    );
    res.json({ settings });
  });

  router.post("/sales", async (req, res) => {
    if (!Array.isArray(req.body?.items) || req.body.items.length === 0 || req.body.items.length > 100) {
      throw requestError(400, "A sale must include between 1 and 100 products.");
    }
    const paymentLabels = new Map([
      ["Fonepay QR", "Online QR / UPI"],
      ["eSewa / Khalti", "Online QR / UPI"],
      ["Cash", "Cash"],
      ["Bank Card", "Card"],
      ["Credit / Due", "Credit"]
    ]);
    const paymentLabel = req.body.paymentMethod;
    const paymentMethod = paymentLabels.get(paymentLabel);
    if (!paymentMethod) throw requestError(400, "Select a valid payment method.");

    const quantities = new Map();
    for (const item of req.body.items) {
      const id = text(item?.id, "Product ID", 36, true);
      const quantity = integer(item?.quantity, "Quantity", { max: 100000 });
      if (quantity < 1) throw requestError(400, "Sale quantities must be greater than zero.");
      quantities.set(id, (quantities.get(id) || 0) + quantity);
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const settings = await getStoreSettings(connection);
      const productRows = [];
      for (const [id, quantity] of quantities) {
        const [rows] = await connection.execute(
          `SELECT * FROM inventory_items
           WHERE id = ? AND is_active = 1${localDemoMode ? "" : " AND is_sample = 0"}
           FOR UPDATE`,
          [id]
        );
        if (rows.length === 0) throw requestError(404, "A product in this sale is no longer available.");
        const product = rows[0];
        if (quantity > Number(product.stock_quantity)) {
          throw requestError(409, `Insufficient stock for ${product.part_name}.`);
        }
        productRows.push({ product, quantity });
      }

      const subtotal = Math.round(productRows.reduce(
        (sum, { product, quantity }) => sum + Number(product.selling_price) * quantity,
        0
      ) * 100) / 100;
      const discount = money(req.body.discount ?? 0, "Discount");
      if (discount > subtotal) throw requestError(400, "Discount cannot exceed the sale subtotal.");
      const taxEnabled = Boolean(settings.enableTax);
      const vatRate = taxEnabled ? Number(settings.vatRate) : 0;
      const taxableAmount = subtotal - discount;
      const taxAmount = Math.round(taxableAmount * vatRate) / 100;
      const grandTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;

      const customerId = req.body.customerId
        ? text(req.body.customerId, "Customer ID", 36, true)
        : null;
      let customer = null;
      if (customerId) {
        const [customerRows] = await connection.execute(
          "SELECT * FROM business_customers WHERE id = ? AND is_active = 1 FOR UPDATE",
          [customerId]
        );
        if (customerRows.length === 0) throw requestError(404, "Selected customer was not found.");
        customer = customerRows[0];
      }
      if (paymentMethod === "Credit" && !customer) {
        throw requestError(400, "Select a saved customer before using store credit.");
      }
      const customerName = customer
        ? customer.name
        : text(req.body.customerName || "Retail Walk-in Customer", "Customer name", 150, true);
      const customerPhone = customer
        ? customer.phone
        : nullableText(req.body.customerPhone, "Customer phone", 50);
      const customerVehicle = customer
        ? customer.vehicle || ""
        : text(req.body.customerVehicle ?? "", "Customer vehicle", 150);
      const invoiceId = randomUUID();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now()}-${randomUUID().slice(0, 4).toUpperCase()}`;
      const paymentStatus = paymentMethod === "Credit" ? "Credit Due" : "Paid";
      const isSample = productRows.some(({ product }) => Number(product.is_sample) === 1);
      const notes = text(req.body.notes ?? "", "Sale notes", 2000);

      await connection.execute(
        `INSERT INTO invoices
         (id, invoice_number, customer_name, customer_phone, payment_method, subtotal,
          tax_amount, discount_amount, total_amount, created_by, created_at, business_customer_id,
          customer_vehicle, payment_status, notes, vat_rate, tax_enabled, is_sample, payment_method_label)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(), ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          invoiceId, invoiceNumber, customerName, customerPhone, paymentMethod, subtotal,
          taxAmount, discount, grandTotal, req.user.name, customerId, customerVehicle,
          paymentStatus, notes, vatRate, taxEnabled ? 1 : 0, isSample ? 1 : 0, paymentLabel
        ]
      );

      const items = [];
      const stockUpdates = [];
      for (const { product, quantity } of productRows) {
        const lineTotal = Math.round(Number(product.selling_price) * quantity * 100) / 100;
        await connection.execute(
          `INSERT INTO invoice_items
           (id, invoice_id, part_id, quantity, unit_price, total_price,
            part_name_snapshot, sku_snapshot, unit_cost, is_sample)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            randomUUID(), invoiceId, product.id, quantity, product.selling_price, lineTotal,
            product.part_name, product.sku, product.unit_cost, Number(product.is_sample) === 1 ? 1 : 0
          ]
        );
        const newStock = Number(product.stock_quantity) - quantity;
        await connection.execute(
          `INSERT INTO stock_ledger (id, part_id, change_type, quantity_changed, notes, created_by)
           VALUES (?, ?, 'SALE', ?, ?, ?)`,
          [randomUUID(), product.id, -quantity, `Invoice ${invoiceNumber}`, req.user.name]
        );
        items.push({
          id: product.id,
          name: product.part_name,
          code: product.sku,
          price: Number(product.selling_price),
          quantity,
          total: lineTotal
        });
        stockUpdates.push({ id: product.id, stock: newStock });
      }

      let updatedCustomer = null;
      if (customer) {
        const dueAmount = paymentMethod === "Credit" ? grandTotal : 0;
        await connection.execute(
          `UPDATE business_customers
           SET total_spent = total_spent + ?, balance = balance + ?, last_visit = UTC_DATE()
           WHERE id = ?`,
          [grandTotal, dueAmount, customerId]
        );
        const [customerRows] = await connection.execute(
          "SELECT * FROM business_customers WHERE id = ? LIMIT 1",
          [customerId]
        );
        updatedCustomer = mapCustomer(customerRows[0]);
      }

      const [invoiceRows] = await connection.execute("SELECT * FROM invoices WHERE id = ? LIMIT 1", [invoiceId]);
      await connection.commit();
      res.status(201).json({
        transaction: mapTransaction(invoiceRows[0], items),
        stockUpdates,
        customer: updatedCustomer
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  });

  return router;
}
