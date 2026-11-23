# MAMA AUTO PARTS

React 19/Vite admin and customer interface with an Express API. The API uses MariaDB/MySQL, bcrypt password hashes, and opaque server-side sessions stored in the database.

## Operational data and sample catalog

Authenticated administrators load and save products, customers, suppliers, sales/invoices, payments (including payment method), and store settings through the MariaDB-backed API. Sales update inventory and customer balances in a database transaction. The app removes legacy `mama_*` localStorage keys and does not store operational records in browser storage. Settings can export the currently loaded records as JSON; that export is not a database backup.

The additive migrations preserve the six existing inventory rows and do not infer ownership for historical invoices. In local demo mode, the 500 illustrative catalog products remain marked as samples and are kept separate from real production inventory. Their images, prices, and stock are examples only and must be replaced with verified business data.

## Requirements

- Node.js 20.19+ or 22.12+ (required by the installed Vite release)
- XAMPP MariaDB/MySQL or another compatible MySQL server
- Apache with `mod_rewrite`, `mod_headers`, and (for deployment) `mod_proxy`/`mod_proxy_http`

## Local development

1. Install packages and prepare configuration:

   ```powershell
   npm install
   Copy-Item .env.example .env
   ```

2. The existing XAMPP schema is `mama_auto_parts_db`; it contains the operational tables and `users` table. Do not create a replacement database or run these changes against `mama_auto_partsbike_db`. Create separate API/provisioning accounts in phpMyAdmin or the MariaDB console, using strong, unique passwords:

   ```sql
   CREATE USER 'mama_app'@'localhost' IDENTIFIED BY 'REPLACE_WITH_STRONG_APP_PASSWORD';
   CREATE USER 'mama_setup'@'localhost' IDENTIFIED BY 'REPLACE_WITH_STRONG_SETUP_PASSWORD';
   GRANT REFERENCES ON mama_auto_parts_db.* TO 'mama_setup'@'localhost';
   GRANT CREATE, ALTER, INDEX ON mama_auto_parts_db.* TO 'mama_setup'@'localhost';
   ```

   Set `DB_USER`, `DB_PASSWORD`, `DB_ADMIN_USER`, and `DB_ADMIN_PASSWORD` in `.env` to match those accounts. `DB_HOST=localhost`, `DB_PORT=3306`, and `DB_NAME=mama_auto_parts_db` match the XAMPP setup. Do not use the MariaDB root account for the API.

3. Generate a fresh session key and set the exact allowed frontend origins in `.env`:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(48).toString('base64'))"
   ```

   Put the output in `SESSION_SECRET`. Keep `NODE_ENV=development`, `COOKIE_SECURE=false`, `API_HOST=127.0.0.1`, and `TRUST_PROXY=true` for the one-hop local Apache/Vite proxy. Use the local `FRONTEND_ORIGINS` list from `.env.example` for localhost/127.0.0.1 Apache and Vite (`5173`/`5174`); add only the exact origin you use if its host, scheme, or port differs. Origins are comma-separated and must not include paths. Never commit `.env`.

4. Apply the idempotent authentication and business-data migrations:

   ```powershell
   npm run db:migrate
   ```

   Migrations add product metadata, business customers/suppliers, payment ledgers, store settings, and invoice snapshots while preserving existing rows. Grant least-privilege access to the API and provisioning accounts:

   ```sql
   GRANT SELECT ON mama_auto_parts_db.users TO 'mama_app'@'localhost';
   GRANT SELECT, INSERT, DELETE ON mama_auto_parts_db.auth_sessions TO 'mama_app'@'localhost';
   GRANT SELECT, INSERT ON mama_auto_parts_db.invoices TO 'mama_app'@'localhost';
   GRANT SELECT, INSERT ON mama_auto_parts_db.invoice_items TO 'mama_app'@'localhost';
   GRANT SELECT, INSERT, UPDATE ON mama_auto_parts_db.inventory_items TO 'mama_app'@'localhost';
   GRANT SELECT, INSERT, UPDATE ON mama_auto_parts_db.business_customers TO 'mama_app'@'localhost';
   GRANT SELECT, INSERT, UPDATE ON mama_auto_parts_db.business_suppliers TO 'mama_app'@'localhost';
   GRANT INSERT ON mama_auto_parts_db.stock_ledger TO 'mama_app'@'localhost';
   GRANT INSERT ON mama_auto_parts_db.customer_payments TO 'mama_app'@'localhost';
   GRANT INSERT ON mama_auto_parts_db.supplier_payments TO 'mama_app'@'localhost';
   GRANT SELECT, INSERT, UPDATE ON mama_auto_parts_db.store_settings TO 'mama_app'@'localhost';
   GRANT SELECT, INSERT, UPDATE ON mama_auto_parts_db.users TO 'mama_setup'@'localhost';
   GRANT SELECT, DELETE ON mama_auto_parts_db.auth_sessions TO 'mama_setup'@'localhost';
   GRANT SELECT, INSERT ON mama_auto_parts_db.inventory_items TO 'mama_setup'@'localhost';
   ```

5. Enable local demo accounts and credentials in `.env`:

   ```env
   DEMO_ACCOUNTS_ENABLED=true
   VITE_SHOW_DEMO_CREDENTIALS=true
   ```

   `npm run api` applies the idempotent migrations and seeds the separate demo admin/customer accounts using bcrypt. The login page displays their credentials only when `VITE_SHOW_DEMO_CREDENTIALS=true`. In that local demo mode, 50 illustrative sample products per category are seeded into MariaDB with local SVG illustrations and are marked as samples. Sample prices and stock are not real. Keep both settings false in production; demo accounts and sample inventory are disabled there. Existing real user accounts and inventory rows are not overwritten by the demo seed.

6. Existing administrator/customer passwords may not be bcrypt-compatible with the secure API. To reset a real administrator password, run:

   ```powershell
   npm run reset-admin
   ```

   The command asks for the existing admin email and reads a new password without echoing it. Use a unique password with at least 12 characters. If the database has no admin account, create one with `npm run create-admin`. Public registration is disabled.

7. Start the full local app in one terminal:

   ```powershell
   npm run dev
   ```

   This runs migrations and demo seeding, waits for the API/database health check, then starts Vite and opens the browser. If the Vite port is already in use, Vite selects the next available port. Use `npm run dev:frontend` only when you intentionally want to run the frontend without the API.

## XAMPP Apache deployment

1. Set production `.env` values on the server: `NODE_ENV=production`, `COOKIE_SECURE=true`, `DEMO_ACCOUNTS_ENABLED=false`, and `FRONTEND_ORIGINS=https://your-real-hostname`. Also build with `VITE_SHOW_DEMO_CREDENTIALS=false`, strong DB credentials, and a newly generated `SESSION_SECRET`. Use HTTPS; the API refuses production startup if secure cookies are disabled. Keep the API bound to `127.0.0.1` and do not expose port 3001 publicly.
2. Enable Apache `mod_proxy` and `mod_proxy_http`, then add the following to the active Apache virtual-host/server configuration (not the app's `.htaccess`):

   ```apache
   ProxyPass        /mama-auto-parts/api/ http://127.0.0.1:3001/api/
   ProxyPassReverse /mama-auto-parts/api/ http://127.0.0.1:3001/api/
   ```

   Keep the app's `public/.htaccess` rewrite rules and security headers. `FRONTEND_ORIGINS` must contain the browser-visible origin(s), without paths. If Apache is a trusted reverse proxy, set `TRUST_PROXY=true`; keep the API loopback-only.
3. Build the React app for the existing subdirectory and deploy the generated files:

   ```powershell
   npm run build -- --base=/mama-auto-parts/
   ```

   Copy the **contents** of `dist` into `C:\xampp\htdocs\mama-auto-parts`. The API must also run continuously as a Windows service or supervised process; `npm run api` is suitable for local testing, not service supervision.
4. Run `npm run db:migrate` and `npm run create-admin` with production DB settings before exposing the login page. Restrict database access to the application host and back up the MariaDB server separately.

## API

All API responses are JSON. API errors use explicit status codes and generic public error messages.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | API and database health |
| `GET` | `/api/demo-accounts` | Return demo credentials only when local demo mode is enabled |
| `POST` | `/api/auth/login` | Validate email/password/role and issue an HttpOnly session cookie |
| `GET` | `/api/auth/me` | Resolve the active administrator or customer from the database-backed session |
| `POST` | `/api/auth/logout` | Revoke the current server-side session |
| `GET` | `/api/customer/invoices` | Return only invoices linked to the authenticated customer |
| `GET` | `/api/operations` | Load administrator products, customers, suppliers, invoices, and settings |
| `POST`, `PUT`, `DELETE` | `/api/products` | Create, update, and soft-delete products |
| `POST`, `PUT`, `DELETE` | `/api/customers` | Create, update, and soft-delete customers |
| `POST` | `/api/customers/:id/payments` | Record a customer payment and reduce the balance |
| `POST`, `PUT`, `DELETE` | `/api/suppliers` | Create, update, and soft-delete suppliers |
| `POST` | `/api/suppliers/:id/payments` | Record a supplier payment and reduce the payable balance |
| `POST` | `/api/sales` | Create an invoice, snapshot its items, and deduct stock transactionally |
| `PUT` | `/api/settings` | Validate and persist store settings |

Login is rate-limited (10 attempts per IP per 15 minutes), validates the selected role, compares bcrypt hashes from `users.password`, and returns a generic invalid-credentials message. Session identifiers are random, HttpOnly, SameSite=Strict cookies; only an HMAC digest is stored in `auth_sessions`, with an eight-hour expiry. State-changing auth requests require the configured exact `Origin`. Customer invoice queries are scoped to the current session's user ID. The API binds to loopback by default. Apache serves a restrictive CSP; Tailwind is compiled into the Vite bundle instead of loaded as executable CDN code.

## Checks

```powershell
npm test
npm run lint
npm run build
```

CSV exports use a shared encoder that quotes cells and neutralizes formula-leading text.

## Remaining work before real business use

Add purchase-order/receiving workflows, secure account recovery, audit logging, database backup/restore procedures, and supervised HTTPS service deployment. Review historical invoice ownership before any customer linking; the app deliberately does not infer it from names or phone numbers. No payment-provider integration is implemented.
