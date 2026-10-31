-- Execute after crm_customer_attendance.sql before deploying the updated API.
CREATE TABLE IF NOT EXISTS tb_crm_attendance_quote (
 id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 attendance_id INT NOT NULL,
 company_id INT NOT NULL,
 resale_id INT NOT NULL,
 date_created DATETIME(6) NOT NULL,
 date_updated DATETIME(6) NOT NULL,
 notes VARCHAR(2000),
 subtotal DECIMAL(19,2) NOT NULL,
 discount_total DECIMAL(19,2) NOT NULL,
 total DECIMAL(19,2) NOT NULL,
 version BIGINT,
 CONSTRAINT uk_attendance_quote UNIQUE (attendance_id),
 CONSTRAINT fk_quote_attendance FOREIGN KEY (attendance_id) REFERENCES tb_crm_customer_attendance(id)
);
CREATE TABLE IF NOT EXISTS tb_crm_attendance_quote_item (
 id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 quote_id INT NOT NULL,
 item_position INT NOT NULL,
 product_name VARCHAR(255) NOT NULL,
 quantity DECIMAL(12,3) NOT NULL,
 unit_price DECIMAL(15,2) NOT NULL,
 discount_type VARCHAR(16) NOT NULL,
 discount_value DECIMAL(15,2) NOT NULL,
 subtotal DECIMAL(19,2) NOT NULL,
 discount_amount DECIMAL(19,2) NOT NULL,
 total DECIMAL(19,2) NOT NULL,
 CONSTRAINT fk_quote_item_header FOREIGN KEY (quote_id) REFERENCES tb_crm_attendance_quote(id)
);
