-- Run once on existing installations before deploying the updated API.
ALTER TABLE tb_crm_customer_attendance
 ADD COLUMN cancellation_reason VARCHAR(2000),
 ADD COLUMN cancelled_at DATETIME(6),
 ADD COLUMN cancelled_by_id INT,
 ADD COLUMN cancelled_by_name VARCHAR(255);
