ALTER TABLE tb_crm_attendance_log
 ADD COLUMN previous_amount DECIMAL(19,2) NULL,
 ADD COLUMN new_amount DECIMAL(19,2) NULL;
