-- Run once on existing installations before deploying the updated API.
ALTER TABLE tb_crm_customer_attendance
 ADD COLUMN documents_notes VARCHAR(2000),
 ADD COLUMN proposal_notes VARCHAR(2000),
 ADD COLUMN approval_requested_at DATETIME(6),
 ADD COLUMN completed_at DATETIME(6);
