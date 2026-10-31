-- Apply before deploying the single-company registration rule (MySQL).
-- If multiple companies exist, this migration fails without deleting records.
-- Resolve existing duplicates and their relationships before retrying.
ALTER TABLE tb_company
    ADD COLUMN singleton_slot TINYINT GENERATED ALWAYS AS (1) STORED,
    ADD CONSTRAINT uk_company_singleton UNIQUE (singleton_slot);
