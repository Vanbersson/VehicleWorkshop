CREATE TABLE IF NOT EXISTS tb_crm_attendance_log (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 company_id INT NOT NULL,
 resale_id INT NOT NULL,
 attendance_id INT NOT NULL,
 stage VARCHAR(40) NOT NULL,
 action VARCHAR(50) NOT NULL,
 user_id INT NULL,
 user_name VARCHAR(255) NULL,
 client_id INT NULL,
 client_name VARCHAR(255) NULL,
 occurred_at DATETIME(6) NOT NULL,
 document_id INT NULL,
 file_name VARCHAR(255) NULL,
 previous_amount DECIMAL(19,2) NULL,
 new_amount DECIMAL(19,2) NULL,
 INDEX idx_attendance_log (attendance_id, occurred_at, id),
 CONSTRAINT fk_attendance_log FOREIGN KEY (attendance_id) REFERENCES tb_crm_customer_attendance(id)
);
