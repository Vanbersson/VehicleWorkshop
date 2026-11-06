-- Apply once to existing databases before deploying this API version.
-- Legacy attachments belong to DOCUMENTS because their original stage was not stored.
ALTER TABLE tb_crm_attendance_document ADD COLUMN stage VARCHAR(30) NOT NULL DEFAULT 'DOCUMENTS';
