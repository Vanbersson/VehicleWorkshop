ALTER TABLE tb_crm_attendance_document
 ADD COLUMN updated_by_user_id INT NULL,
 ADD COLUMN updated_by_user_name VARCHAR(255) NULL,
 ADD COLUMN updated_at DATETIME(6) NULL;
