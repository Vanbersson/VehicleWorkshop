ALTER TABLE tb_crm_attendance_document ADD COLUMN signed_file_path VARCHAR(1024) NULL, ADD COLUMN signed_file_name VARCHAR(255) NULL, ADD COLUMN signed_uploaded_at DATETIME(6) NULL;
