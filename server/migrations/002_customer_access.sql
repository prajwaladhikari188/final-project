ALTER TABLE users ADD COLUMN is_demo TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN customer_user_id VARCHAR(36) NULL;
ALTER TABLE invoices ADD INDEX invoices_customer_user_id_idx (customer_user_id);
ALTER TABLE invoices
  ADD CONSTRAINT invoices_customer_user_fk
  FOREIGN KEY (customer_user_id) REFERENCES users(id) ON DELETE SET NULL;
