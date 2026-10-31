-- New installations: apply after crm_customer_attendance.sql.
-- Existing BLOB schema: follow crm_attendance_document_storage.md before deployment.
CREATE TABLE IF NOT EXISTS tb_crm_attendance_document (
 id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 attendance_id INT NOT NULL,
 file_name VARCHAR(255) NOT NULL,
 content_type VARCHAR(100) NOT NULL,
 file_size BIGINT NOT NULL,
 created_at DATETIME(6) NOT NULL,
 file_path VARCHAR(1024) NOT NULL,
 INDEX idx_attendance_document (attendance_id, created_at),
 CONSTRAINT fk_attendance_document FOREIGN KEY (attendance_id) REFERENCES tb_crm_customer_attendance(id)
);
