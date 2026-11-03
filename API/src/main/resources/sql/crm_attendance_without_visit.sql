-- Execute before deploying the API. Keeps the unique constraint for linked visits.
ALTER TABLE tb_crm_customer_attendance MODIFY COLUMN visit_id INT NULL;
