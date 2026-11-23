import "dotenv/config";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { DEMO_ACCOUNTS } from "../shared/demoAccounts.js";
import { SAMPLE_PRODUCTS } from "../src/data/sampleProducts.js";

const {
  DB_HOST,
  DB_NAME,
  DB_USER,
  DB_PASSWORD = "",
  DB_ADMIN_USER = DB_USER,
  DB_ADMIN_PASSWORD = DB_PASSWORD,
  DB_PORT = "3306"
} = process.env;
if (!DB_HOST || !DB_NAME || !DB_USER) {
  throw new Error("Set DB_HOST, DB_NAME and DB_USER in .env before running migrations.");
}
const demoAccountsEnabled = process.env.DEMO_ACCOUNTS_ENABLED === "true";
if (process.env.NODE_ENV === "production" && demoAccountsEnabled) {
  throw new Error("Demo accounts must be disabled in production.");
}

const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_NAME,
  user: DB_ADMIN_USER,
  password: DB_ADMIN_PASSWORD,
  charset: "utf8mb4"
});

async function ensureColumn(table, column, statement) {
  const [rows] = await pool.execute(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = ? AND table_name = ? AND column_name = ?
     LIMIT 1`,
    [DB_NAME, table, column]
  );
  if (rows.length === 0) {
    await pool.query(statement);
    return true;
  }
  return false;
}

async function ensureCustomerInvoiceIndex(statement) {
  const [rows] = await pool.execute(
    `SELECT 1 FROM information_schema.statistics
     WHERE table_schema = ? AND table_name = 'invoices'
       AND index_name = 'invoices_customer_user_id_idx'
     LIMIT 1`,
    [DB_NAME]
  );
  if (rows.length === 0) {
    await pool.query(statement);
    return true;
  }
  return false;
}

async function ensureCustomerInvoiceForeignKey(statement) {
  const [rows] = await pool.execute(
    `SELECT 1 FROM information_schema.table_constraints
     WHERE constraint_schema = ? AND table_name = 'invoices'
       AND constraint_name = 'invoices_customer_user_fk'
       AND constraint_type = 'FOREIGN KEY'
     LIMIT 1`,
    [DB_NAME]
  );
  if (rows.length === 0) {
    await pool.query(statement);
    return true;
  }
  return false;
}

async function ensureIndex(table, indexName, statement) {
  const [rows] = await pool.execute(
    `SELECT 1 FROM information_schema.statistics
     WHERE table_schema = ? AND table_name = ? AND index_name = ?
     LIMIT 1`,
    [DB_NAME, table, indexName]
  );
  if (rows.length === 0) {
    await pool.query(statement);
    return true;
  }
  return false;
}

async function ensureForeignKey(table, constraintName, statement) {
  const [rows] = await pool.execute(
    `SELECT 1 FROM information_schema.table_constraints
     WHERE constraint_schema = ? AND table_name = ?
       AND constraint_name = ? AND constraint_type = 'FOREIGN KEY'
     LIMIT 1`,
    [DB_NAME, table, constraintName]
  );
  if (rows.length === 0) {
    await pool.query(statement);
    return true;
  }
  return false;
}

async function applyBusinessMigration() {
  const migration = await readFile(
    new URL("./migrations/003_business_persistence.sql", import.meta.url),
    "utf8"
  );
  const statements = migration.split(/;\s*(?:\r?\n|$)/).map((sql) => sql.trim()).filter(Boolean);

  for (const statement of statements) {
    const addColumn = statement.match(/^ALTER TABLE (\w+) ADD COLUMN (\w+)/i);
    if (addColumn) {
      await ensureColumn(addColumn[1], addColumn[2], statement);
      continue;
    }

    if (/^ALTER TABLE inventory_items MODIFY category/i.test(statement)) {
      const [rows] = await pool.execute(
        `SELECT column_type FROM information_schema.columns
         WHERE table_schema = ? AND table_name = 'inventory_items' AND column_name = 'category'`,
        [DB_NAME]
      );
      if (rows[0]?.column_type.startsWith("enum(")) await pool.query(statement);
      continue;
    }

    if (/^CREATE TABLE IF NOT EXISTS/i.test(statement)) {
      await pool.query(statement);
      continue;
    }

    if (/^ALTER TABLE invoices\s+ADD INDEX invoices_business_customer_idx/i.test(statement)) {
      await ensureIndex(
        "invoices",
        "invoices_business_customer_idx",
        "ALTER TABLE invoices ADD INDEX invoices_business_customer_idx (business_customer_id)"
      );
      await ensureForeignKey(
        "invoices",
        "invoices_business_customer_fk",
        `ALTER TABLE invoices ADD CONSTRAINT invoices_business_customer_fk
         FOREIGN KEY (business_customer_id) REFERENCES business_customers(id) ON DELETE SET NULL`
      );
      continue;
    }

    throw new Error("Unrecognized statement in business persistence migration.");
  }

}

async function seedDemoAccounts() {
  for (const account of Object.values(DEMO_ACCOUNTS)) {
    const [existing] = await pool.execute(
      "SELECT id, role, is_demo FROM users WHERE email = ? LIMIT 1",
      [account.email]
    );
    const passwordHash = await bcrypt.hash(account.password, 12);

    if (existing.length > 0) {
      const user = existing[0];
      if (Number(user.is_demo) !== 1 || user.role !== account.role) {
        throw new Error(`Refusing to overwrite an existing non-demo account: ${account.email}`);
      }
      const [result] = await pool.execute(
        "UPDATE users SET name = ?, password = ? WHERE id = ? AND role = ? AND is_demo = 1",
        [account.name, passwordHash, user.id, account.role]
      );
      if (result.affectedRows !== 1) {
        throw new Error(`Unable to refresh the development demo account: ${account.email}`);
      }
      await pool.execute("DELETE FROM auth_sessions WHERE user_id = ?", [user.id]);
      continue;
    }

    await pool.execute(
      `INSERT INTO users (id, name, email, password, role, is_demo, created_at)
       VALUES (?, ?, ?, ?, ?, 1, UTC_TIMESTAMP())`,
      [randomUUID(), account.name, account.email, passwordHash, account.role]
    );
  }
  console.log("Development demo accounts are ready.");
}

async function seedSampleProducts() {
  const skus = SAMPLE_PRODUCTS.map(({ code }) => code);
  const placeholders = skus.map(() => "?").join(", ");
  const [existingRows] = await pool.execute(
    `SELECT sku, is_sample FROM inventory_items WHERE sku IN (${placeholders})`,
    skus
  );
  const existingBySku = new Map(existingRows.map((row) => [row.sku, Number(row.is_sample) === 1]));
  const conflicts = existingRows.filter((row) => Number(row.is_sample) !== 1);
  if (conflicts.length > 0) {
    throw new Error("A sample SKU conflicts with an existing real product; no inventory rows were changed.");
  }

  const missingProducts = SAMPLE_PRODUCTS.filter(({ code }) => !existingBySku.has(code));
  for (let offset = 0; offset < missingProducts.length; offset += 100) {
    const batch = missingProducts.slice(offset, offset + 100);
    const rowPlaceholders = batch.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, 1)").join(", ");
    const values = batch.flatMap((product) => [
      product.id,
      product.code,
      product.name,
      product.category,
      product.stock,
      product.minStock,
      product.purchasePrice,
      product.sellingPrice,
      product.rackLocation,
      product.brand,
      product.bikeModel,
      product.description,
      product.warranty,
      product.image
    ]);
    await pool.execute(
      `INSERT INTO inventory_items
       (id, sku, part_name, category, stock_quantity, min_reorder_level,
        unit_cost, selling_price, rack_location, is_active, brand_name,
        bike_model, description, warranty, image_data, is_sample)
       VALUES ${rowPlaceholders}`,
      values
    );
  }
  if (missingProducts.length > 0) {
    console.log(`Seeded ${missingProducts.length} local sample inventory products.`);
  }
}

try {
  const [userColumns] = await pool.execute(
    `SELECT column_name, column_type
     FROM information_schema.columns
     WHERE table_schema = ? AND table_name = 'users'`,
    [DB_NAME]
  );
  const columns = new Map(userColumns.map(({ column_name, column_type }) => [column_name, column_type]));
  const requiredColumns = ["id", "name", "email", "password", "role"];
  const missingColumns = requiredColumns.filter((column) => !columns.has(column));
  if (missingColumns.length > 0) {
    throw new Error(`Existing users table is missing required columns: ${missingColumns.join(", ")}`);
  }
  if (columns.get("id").toLowerCase() !== "varchar(36)") {
    throw new Error("Existing users.id must be VARCHAR(36) for the MAMA AUTO PARTS schema.");
  }

  const [invoiceTable] = await pool.execute(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = ? AND table_name = 'invoices'
     LIMIT 1`,
    [DB_NAME]
  );
  if (invoiceTable.length === 0) {
    throw new Error("Existing invoices table is required for customer invoice access.");
  }

  const migration = await readFile(new URL("./migrations/001_auth.sql", import.meta.url), "utf8");
  const statements = migration.split(/;\s*(?:\r?\n|$)/).map((sql) => sql.trim()).filter(Boolean);
  for (const statement of statements) await pool.query(statement);

  const customerMigration = await readFile(
    new URL("./migrations/002_customer_access.sql", import.meta.url),
    "utf8"
  );
  const customerStatements = customerMigration
    .split(/;\s*(?:\r?\n|$)/)
    .map((sql) => sql.trim())
    .filter(Boolean);
  const changedUsers = await ensureColumn("users", "is_demo", customerStatements[0]);
  const changedInvoices = await ensureColumn("invoices", "customer_user_id", customerStatements[1]);
  const changedIndex = await ensureCustomerInvoiceIndex(customerStatements[2]);
  const changedForeignKey = await ensureCustomerInvoiceForeignKey(customerStatements[3]);
  if (changedUsers || changedInvoices || changedIndex || changedForeignKey) {
    console.log("Customer ownership schema is ready.");
  }

  await applyBusinessMigration();
  if (demoAccountsEnabled) {
    await seedDemoAccounts();
    await seedSampleProducts();
  }
  console.log("Database migration completed.");
} finally {
  await pool.end();
}
