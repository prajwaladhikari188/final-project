ALTER TABLE inventory_items MODIFY category VARCHAR(100) NOT NULL;
ALTER TABLE inventory_items ADD COLUMN brand_name VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE inventory_items ADD COLUMN bike_model VARCHAR(200) NOT NULL DEFAULT '';
ALTER TABLE inventory_items ADD COLUMN description TEXT NULL;
ALTER TABLE inventory_items ADD COLUMN warranty VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE inventory_items ADD COLUMN image_data MEDIUMTEXT NULL;
ALTER TABLE inventory_items ADD COLUMN is_sample TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE invoices ADD COLUMN business_customer_id VARCHAR(36) NULL;
ALTER TABLE invoices ADD COLUMN customer_vehicle VARCHAR(150) NOT NULL DEFAULT '';
ALTER TABLE invoices ADD COLUMN payment_status ENUM('Paid','Credit Due','Partially Paid') NOT NULL DEFAULT 'Paid';
ALTER TABLE invoices ADD COLUMN notes TEXT NULL;
ALTER TABLE invoices ADD COLUMN vat_rate DECIMAL(5,2) NOT NULL DEFAULT 13.00;
ALTER TABLE invoices ADD COLUMN tax_enabled TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE invoices ADD COLUMN is_sample TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN payment_method_label VARCHAR(50) NOT NULL DEFAULT '';

ALTER TABLE invoice_items ADD COLUMN part_name_snapshot VARCHAR(200) NOT NULL DEFAULT '';
ALTER TABLE invoice_items ADD COLUMN sku_snapshot VARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE invoice_items ADD COLUMN unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00;
ALTER TABLE invoice_items ADD COLUMN is_sample TINYINT(1) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS business_customers (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(254) NULL,
  address VARCHAR(255) NULL,
  vehicle VARCHAR(150) NULL,
  balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_spent DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  notes TEXT NULL,
  last_visit DATE NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX business_customers_phone_idx (phone),
  INDEX business_customers_active_idx (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS business_suppliers (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  company_name VARCHAR(150) NOT NULL,
  contact_person VARCHAR(100) NOT NULL DEFAULT '',
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(254) NULL,
  address VARCHAR(255) NULL,
  pan_number VARCHAR(50) NULL,
  categories TEXT NULL,
  balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX business_suppliers_phone_idx (phone),
  INDEX business_suppliers_active_idx (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS customer_payments (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  customer_id VARCHAR(36) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  notes VARCHAR(255) NOT NULL DEFAULT '',
  received_by VARCHAR(100) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX customer_payments_customer_idx (customer_id, created_at),
  CONSTRAINT customer_payments_customer_fk
    FOREIGN KEY (customer_id) REFERENCES business_customers(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS supplier_payments (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  supplier_id VARCHAR(36) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  notes VARCHAR(255) NOT NULL DEFAULT '',
  paid_by VARCHAR(100) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX supplier_payments_supplier_idx (supplier_id, created_at),
  CONSTRAINT supplier_payments_supplier_fk
    FOREIGN KEY (supplier_id) REFERENCES business_suppliers(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE customer_payments ADD COLUMN payment_method VARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE supplier_payments ADD COLUMN payment_method VARCHAR(50) NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS store_settings (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  settings_json LONGTEXT NOT NULL,
  updated_by VARCHAR(100) NOT NULL DEFAULT '',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT store_settings_json_valid CHECK (JSON_VALID(settings_json))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE invoices
  ADD INDEX invoices_business_customer_idx (business_customer_id),
  ADD CONSTRAINT invoices_business_customer_fk
    FOREIGN KEY (business_customer_id) REFERENCES business_customers(id) ON DELETE SET NULL;
