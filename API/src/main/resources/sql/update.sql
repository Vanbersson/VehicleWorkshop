ALTER TABLE tb_client_company ADD COLUMN region_id int after phone;

ALTER TABLE tb_client_company ADD CONSTRAINT fk_client_company_region
FOREIGN KEY (region_id) REFERENCES tb_client_company_region(id);

INSERT INTO `tb_menu`(`id`, `description`) VALUES ('999_2_4','Grupo Vendedores');