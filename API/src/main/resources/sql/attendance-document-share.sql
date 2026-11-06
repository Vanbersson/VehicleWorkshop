ALTER TABLE tb_crm_attendance_document ADD COLUMN share_token_hash VARCHAR(64) NULL UNIQUE, ADD COLUMN share_expires_at DATETIME(6) NULL;
