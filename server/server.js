import "dotenv/config";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import {
  createSessionToken,
  hashSessionToken,
  parseLoginInput,
  requestHasAllowedOrigin,
  SESSION_COOKIE,
  SESSION_DURATION_MS
} from "./security.js";
import { DEMO_ACCOUNTS } from "../shared/demoAccounts.js";
import { createBusinessRouter } from "./businessRoutes.js";

const required = ["DB_HOST", "DB_NAME", "DB_USER", "SESSION_SECRET"];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`);
}
const frontendOriginsValue = process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN;
if (!frontendOriginsValue) throw new Error("Missing required environment variable: FRONTEND_ORIGINS");
if (process.env.NODE_ENV === "production" && process.env.DEMO_ACCOUNTS_ENABLED === "true") {
  throw new Error("Demo accounts must be disabled in production.");
}
if (Buffer.byteLength(process.env.SESSION_SECRET, "utf8") < 32) {
  throw new Error("SESSION_SECRET must contain at least 32 bytes.");
}
if (process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "true") {
  throw new Error("COOKIE_SECURE=true is required in production (serve the app over HTTPS).");
}
const frontendOrigins = [...new Set(frontendOriginsValue.split(",").map((value) => {
  const origin = value.trim();
  const parsedOrigin = new URL(origin);
  if (parsedOrigin.origin !== origin) {
    throw new Error("FRONTEND_ORIGINS must contain exact origins without paths.");
  }
  return parsedOrigin.origin;
}))];
const cookieSecure = process.env.COOKIE_SECURE === "true";
const port = Number(process.env.API_PORT || 3001);
const host = process.env.API_HOST || "127.0.0.1";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
  dateStrings: true
});
const dummyPasswordHash = await bcrypt.hash(randomBytes(32).toString("base64"), 12);

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);
app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
app.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use(express.json({ limit: "64kb", strict: true }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts. Try again later." }
});

function readCookie(req, name) {
  const cookieHeader = req.headers.cookie || "";
  for (const cookie of cookieHeader.split(";")) {
    const separator = cookie.indexOf("=");
    if (separator >= 0 && cookie.slice(0, separator).trim() === name) {
      return cookie.slice(separator + 1).trim();
    }
  }
  return null;
}

function setSessionCookie(res, token) {
  const secure = cookieSecure ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_DURATION_MS / 1000}${secure}`
  );
}

function clearSessionCookie(res) {
  const secure = cookieSecure ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`);
}

function requireAllowedOrigin(req, res, next) {
  if (!requestHasAllowedOrigin(req.get("origin"), frontendOrigins)) {
    return res.status(403).json({ error: "Request origin is not allowed." });
  }
  return next();
}

async function loadUser(req, res, next) {
  try {
    const token = readCookie(req, SESSION_COOKIE);
    if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const [rows] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.role
       FROM auth_sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP()
       LIMIT 1`,
      [hashSessionToken(token, process.env.SESSION_SECRET)]
    );
    if (rows.length === 0) {
      clearSessionCookie(res);
      return res.status(401).json({ error: "Authentication required." });
    }
    req.user = rows[0];
    return next();
  } catch (error) {
    return next(error);
  }
}

function requireCustomer(req, res, next) {
  if (req.user?.role !== "customer") {
    return res.status(403).json({ error: "Customer access required." });
  }
  return next();
}

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Database health check failed:", error.message);
    return res.status(503).json({ status: "unavailable", error: "Database connection unavailable." });
  }
});

app.get("/api/demo-accounts", (_req, res) => {
  if (process.env.NODE_ENV === "production" || process.env.DEMO_ACCOUNTS_ENABLED !== "true") {
    return res.status(404).json({ error: "Demo accounts are disabled." });
  }
  const accounts = Object.values(DEMO_ACCOUNTS).map(({ name, email, password, role }) => ({
    name,
    email,
    password,
    role
  }));
  return res.json({ accounts });
});

app.post("/api/auth/login", loginLimiter, requireAllowedOrigin, async (req, res, next) => {
  try {
    const credentials = parseLoginInput(req.body);
    if (!credentials) {
      return res.status(400).json({ error: "Enter a valid email, password, and account type." });
    }
    const [rows] = await pool.execute(
      `SELECT id, name, email, password AS password_hash, role, is_demo
       FROM users WHERE email = ? AND role = ? LIMIT 1`,
      [credentials.email, credentials.role]
    );
    const storedHash = rows[0]?.password_hash || dummyPasswordHash;
    const passwordMatches = await bcrypt.compare(credentials.password, storedHash);
    const isProductionDemo = process.env.NODE_ENV === "production" && Number(rows[0]?.is_demo) === 1;
    const valid = rows.length === 1 && passwordMatches && !isProductionDemo;
    if (!valid) return res.status(401).json({ error: "Invalid email or password." });

    await pool.execute("DELETE FROM auth_sessions WHERE expires_at <= UTC_TIMESTAMP()");
    const token = createSessionToken();
    await pool.execute(
      "INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 8 HOUR))",
      [hashSessionToken(token, process.env.SESSION_SECRET), rows[0].id]
    );
    setSessionCookie(res, token);
    return res.json({
      user: { id: rows[0].id, name: rows[0].name, email: rows[0].email, role: rows[0].role }
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/auth/me", loadUser, (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({ user: req.user });
});

app.get("/api/customer/invoices", loadUser, requireCustomer, async (req, res, next) => {
  try {
    const [invoices] = await pool.execute(
      `SELECT id, invoice_number, subtotal, tax_amount, discount_amount, total_amount, created_at
       FROM invoices
       WHERE customer_user_id = ?
       ORDER BY created_at DESC
       LIMIT 100`,
      [req.user.id]
    );
    if (invoices.length === 0) return res.json({ invoices: [] });

    const invoiceIds = invoices.map(({ id }) => id);
    const placeholders = invoiceIds.map(() => "?").join(", ");
    const [items] = await pool.execute(
      `SELECT ii.invoice_id, p.part_name, ii.quantity, ii.unit_price, ii.total_price
       FROM invoice_items ii
       JOIN invoices i ON i.id = ii.invoice_id
       LEFT JOIN inventory_items p ON p.id = ii.part_id
       WHERE i.customer_user_id = ? AND i.id IN (${placeholders})
       ORDER BY i.created_at DESC, ii.id`,
      [req.user.id, ...invoiceIds]
    );
    const itemsByInvoice = new Map(invoices.map(({ id }) => [id, []]));
    for (const item of items) {
      itemsByInvoice.get(item.invoice_id)?.push({
        partName: item.part_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price
      });
    }
    return res.json({
      invoices: invoices.map((invoice) => ({
        ...invoice,
        items: itemsByInvoice.get(invoice.id)
      }))
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/logout", requireAllowedOrigin, async (req, res, next) => {
  try {
    const token = readCookie(req, SESSION_COOKIE);
    if (token && /^[A-Za-z0-9_-]{43}$/.test(token)) {
      await pool.execute("DELETE FROM auth_sessions WHERE token_hash = ?", [
        hashSessionToken(token, process.env.SESSION_SECRET)
      ]);
    }
    clearSessionCookie(res);
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

app.use("/api", createBusinessRouter(pool, loadUser, requireAllowedOrigin));

app.use((req, res) => {
  res.status(404).json({ error: "API endpoint not found." });
});

app.use((error, _req, res, _next) => {
  console.error("API request failed:", error.message);
  if (res.headersSent) return;
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body must contain valid JSON." });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ error: "Request body is too large." });
  }
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "A record with the same unique value already exists." });
  }
  if (Number.isInteger(error.status) && error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({ error: error.message });
  }
  res.status(500).json({ error: "An unexpected server error occurred." });
});

await pool.query("SELECT 1");
const server = app.listen(port, host, () => {
  console.log(`MAMA Auto Parts API listening on http://${host}:${port}`);
});

async function shutdown() {
  server.close();
  await pool.end();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
