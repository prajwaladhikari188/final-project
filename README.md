# 🏍️ MAMA AUTO PARTS – Motorcycle Spare Parts & POS Management System 

> **A modern, full-featured Inventory, Point of Sale (POS) Billing, Customer Credit Ledger, and Financial Analytics Platform engineered specifically for Nepalese motorcycle workshops and spare parts businesses.**

---

## 🌟 Executive Summary

**MAMA AUTO PARTS** is a complete enterprise-grade web application built with **React 19**, **Vite**, and **Tailwind CSS**. It solves the day-to-day operational challenges of motorcycle parts retailers and repair centers in Nepal—including rapid counter billing with **13% Nepal VAT**, **Fonepay QR** and credit payments, real-time stock and reorder tracking across warehouse rack locations, customer motorcycle vehicle plate logs, and comprehensive supplier accounts payable.

---

## 🚀 Key Features & System Modules

### 1. ⚡ POS Billing & Cashier Register
* **Fast Item Search & Add**: Instant search across 26+ spare parts by name, SKU, manufacturer brand, and compatible bike models.
* **Smart Nepali Tax Compliance**:
  * Configurable **13% Nepal VAT** computation.
  * Instant discount calculations (flat rupee discounts).
  * Multiple payment options: **Fonepay QR**, **Cash at Counter**, **eSewa / Khalti**, **Bank Card POS**, and **Store Credit / Due**.
* **Printable Tax Invoices (A4 & POS Receipt)**:
  * Full-featured invoice modal with clean `@media print` CSS.
  * QR verification block, shop PAN number, cashier attribution, itemized breakdown, and store warranty disclaimer.

### 2. 📦 Motorcycle Spare Parts Inventory Management
* **Comprehensive Spare Parts Tracking**:
  * Fields: SKU Code (`MP-BRK-001`), Brand (`Motul`, `Brembo`, `Rolon`, `Endurance`, `NGK`, `CEAT`), Compatible Bike Models (`Pulsar 220F`, `FZ-S`, `Duke 390`, `Classic 350`, `Apache 160 4V`), Cost Price, Selling Price, and Rack Location (`Rack A-1`).
* **Low Stock & Reorder Alerts**: Real-time visual flags when items drop below configurable thresholds.
* **Quick Stock Increment/Decrement**: Single-click `+` / `-` stock level adjustments directly from the table.
* **Data Export**: 1-click **CSV export** for auditing, physical stock count, and restocking orders.

### 3. 👥 Customer Directory & Credit Ledger
* **Motorcycle Plate & Model Association**: Maintain vehicle registration numbers (e.g., `Ba 2 Pa 7845`) alongside customer profiles.
* **Store Due & Credit Tracking**:
  * Automatic recording of purchases on credit.
  * Receive partial or full payments with receipt logs.
  * Filter view to instantly highlight all customers with pending balances.
* **Customer Purchase History Drawer**: Slide-out drawer showcasing all past invoices and service records for any client.

### 4. 🚚 Suppliers & Wholesalers Directory
* **Distributor Profiles**: Wholesaler PAN records, contact persons, contact phone numbers, warehouse addresses, and supplied part categories.
* **Accounts Payable**: Track outstanding dues owed to distributors with integrated payment recording.

### 5. 📊 Sales & Financial Analytics
* **Interactive Data Visualizations (Recharts)**:
  * **Weekly Revenue vs. Cost of Goods Sold (COGS) vs. Gross Profit**: Area charts and bar charts tracking margins.
  * **Sales Distribution by Payment Method**: Donut charts detailing digital (Fonepay) vs cash vs credit sales.
  * **Top 5 Best-Selling Spare Parts**: Highlighting high-turnover motorcycle components.
* **Audit-Ready POS Sales Ledger**: Complete searchable invoice log with date filtering (Today, This Week, This Month, All Time) and CSV download.

### 6. 🔐 Customer Account Portal
* **Dedicated Rider Experience**: Customers can log in to view:
  * Genuine parts catalog with live stock status at the Teku shop.
  * Inquiries and reservation requests.
  * Historical tax invoices with re-print capabilities.
  * Outstanding store credit balance and payment advice.

### 7. ⚙️ Store Settings & LocalStorage Database
* **Store Branding & Tax Setup**: Configure shop trade name, PAN/VAT number, tagline, phone numbers, and invoice footer greetings.
* **Zero-Backend Persistence**: All state synchronizes automatically with browser `localStorage`.
* **Complete System Backup & Restore**:
  * **Download JSON Backup**: Full snapshot of products, customers, suppliers, transactions, and settings.
  * **Restore Realistic Demo Data**: Instantly reset the database to 26+ authentic Nepali motorcycle parts, customers, and distributors.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) |
| **Build Tool & Dev Server** | [Vite 6 / 8](https://vitejs.dev/) |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) |
| **Styling & Design System** | [Tailwind CSS](https://tailwindcss.com/) with Inter & Outfit typography |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Data Visualizations & Charts** | [Recharts](https://recharts.org/) |
| **State & Storage** | React Context API (`useApp`) + HTML5 `localStorage` |

---

## 📂 Project Structure

```
final project/
├── index.html                   # HTML template with Google Fonts & Tailwind CDN
├── package.json                 # Project dependencies & npm scripts
├── vite.config.js               # Vite configuration with React plugin
├── src/
│   ├── main.jsx                 # Application entry point
│   ├── index.css                # Global styles, print styling, scrollbar
│   ├── App.jsx                  # Main router & layout configuration
│   ├── context/
│   │   └── AppContext.jsx       # Global application state, CRUD, & LocalStorage sync
│   ├── data/
│   │   └── demoData.js          # Realistic preloaded Nepalese motorcycle parts & records
│   ├── components/
│   │   ├── Navbar.jsx           # Top header bar with quick search & stock notifications
│   │   ├── Sidebar.jsx          # Responsive collapsible navigation
│   │   ├── StatCard.jsx         # KPI metric card component
│   │   ├── DataTable.jsx        # Reusable paginated search & sort data table
│   │   ├── InvoiceModal.jsx     # Printable tax invoice modal (A4 / POS format)
│   │   ├── ProductModal.jsx     # Add / Edit spare part modal
│   │   ├── CustomerModal.jsx    # Register / Update customer modal
│   │   └── SupplierModal.jsx    # Add / Edit distributor modal
│   └── pages/
│       ├── Dashboard.jsx        # High-level overview, charts, low stock alerts
│       ├── Inventory.jsx        # Spare parts catalog, filters, quick +/- adjustments
│       ├── Billing.jsx          # POS register, cart calculation, checkout
│       ├── Customers.jsx        # Customer ledger, dues, vehicle plates, history drawer
│       ├── Suppliers.jsx        # Wholesaler directory & payable settlements
│       ├── Reports.jsx          # Financial analytics, COGS, profit, CSV export
│       ├── Settings.jsx         # Store config, PAN/VAT, JSON backup & reset
│       ├── CustomerPortal.jsx   # Dedicated rider self-service portal
│       └── Login.jsx            # Multi-role authentication & 1-click demo access
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18.0.0 or higher)
* `npm` or `pnpm`

### Installation & Execution

1. **Clone or navigate to the project directory:**
   ```bash
   cd "final project"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

---

## 🔑 Demo Access & User Roles

The system includes convenient **1-Click Demo Login** buttons on the login screen (`/login`):

* **Admin / Staff Role**:
  * Email: `admin@mamaautoparts.com.np`
  * Password: `admin123` (or click **Demo Admin**)
  * *Access:* Complete access to POS Billing, Inventory CRUD, Financial Reports, Customer & Supplier directories, and System Settings.
* **Customer Portal Role**:
  * Select any customer (e.g. `Bikram Thapa - Bajaj Pulsar 220F`) or click **Demo Customer**.
  * *Access:* Browse parts catalog for compatible motorcycle spares, review past tax invoices, and verify outstanding due balances.

---

## 🏍️ Sample Preloaded Motorcycle Data

The database comes pre-populated with realistic parts and specs commonly used across Nepal:
* **Brakes**: Endurance Ceramic Disc Pads (Pulsar 220), Brembo Sintered Pads (KTM Duke), Nissin Drum Shoes (Honda Shine).
* **Engine Oils**: Motul 7100 10W50 100% Synthetic, Motul 3000 20W50, Castrol Power1 Ultimate 10W40, Bajaj DTS-i 1.15L.
* **Drive & Chains**: Rolon Brass Chain Sprocket Kit, DID Japan Golden O-Ring Chain (124L), TVS Genuine Chain Set.
* **Electrical & Batteries**: Exide Xplore 12V 9Ah Maintenance-Free, Amaron Pro Rider 5Ah, NGK Laser Iridium Spark Plugs.
* **Tyres**: MRF Zapper S 140/70-17 Rear, CEAT Zoom Plus 100/80-17 Front.

---

## 📄 License
This project is developed for educational and commercial motorcycle inventory management purposes. All rights reserved.
