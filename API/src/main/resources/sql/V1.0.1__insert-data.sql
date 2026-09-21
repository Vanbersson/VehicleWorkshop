
INSERT INTO `tb_address`
(`zip_code`, `state`, `city`, `neighborhood`, `address`)
VALUES
('54590000','PE','Cabo de Santo Agostinho','Distrito DIPER','Via pedro rossi');

INSERT INTO tb_brand
 (status,name)
 VALUE
 (0,'randon'),
 (0,'librelato'),
 (0,'facchini'),
 (0,'fiat'),
 (0,'ford'),
 (0,'volkswagem'),
 (0,'toyota'),
 (0,'yamaha'),
 (0,'honda'),
 (0,'guerra'),
 (0,'byd'),
 (0,'general motors'),
 (0,'hyundai'),
 (0,'hyva'),
 (0,'iveco');

 INSERT INTO tb_unit_measure
 (status,unit_measure,description)
 VALUES
 (0,'cj','conjunto'),
 (0,'cx','caixa'),
 (0,'gl','galão'),
 (0,'jg','jogo'),
 (0,'kg','kilograma'),
 (0,'mt','metro'),
 (0,'pa','par'),
 (0,'pc','peça'),
 (0,'un','unidade'),
 (0,'lt','litro');

INSERT INTO tb_permission
(id,description,menu)
VALUES
(100,'Editar entrada de veículo','Portaria'),
(101,'Autorizar saída de veículo','Portaria'),
(102,'Autorizar saída de veículo - 1ª','Portaria'),
(103,'Autorizar saída de veículo - 2ª','Portaria'),
(104,'Remover autorização de saída de veículo - 1ª','Portaria'),
(105,'Remover autorização de saída de veículo - 2ª','Portaria'),
(106,'Autorizar saída de veículo sem O.S.','Portaria'),
(107,'Remover autorização de saída de veículo sem O.S.','Portaria'),
(108,'Autorizar entrada de veículo','Portaria'),
(150,'Gerar orçamento','Portaria'),
(151,'Manutenção orçamento','Portaria'),
(152,'Visualizar orçamento','Portaria'),
(153,'Receber notificações de entrada veículo','Portaria'),
(154,'Receber notificações de saída veículo','Portaria'),
(300,'Alterar quantidade material','Oficina');

INSERT INTO `tb_menu`
(`id`, `description`)
VALUES
('0_0','Dashboard'),

('1_0','Portaria'),
('1_1','Entrada de Veículo'),
('1_2','Veículos'),
('1_5','Saída de Veiculo'),
('1_3','Motorista'),
('1_99','Cadastros'),
('1_99_0','Modelo'),
('1_99_1','Veículo'),
('1_100','Módulo'),

('2_0','Peças'),
('2_1','Atendimento'),

('2_2','Consultas'),
('2_2_0','Orçamentos'),

('2_3','Compras'),
('2_3_0','Pedidos de Compras'),

('2_99','Cadastros'),
('2_99_0','Peças'),
('2_99_1','Grupo de Peças'),
('2_99_2','Categoria de Peças'),
('2_99_3','Unidades de Medida'),
('2_100','Módulo'),

('3_0','Oficina'),
('3_1','Atendimento Oficina'),

('3_2','Controle de equipamentos'),
('3_2_0','Requisições'),
('3_2_1','Cadastros'),
('3_2_1_0','Categoria'),
('3_2_1_1','Material'),
('3_3','Orçamentos'),
('3_99','Cadastros'),
('3_99_0','Mecânico'),
('3_99_1','Departamentos'),

('4_0','Faturamento'),
('4_1','Manutenção Clientes'),
('4_99','Cadastros'),
('4_99_0','Categoria de Clientes'),
('4_99_1','Condição de pagamento'),

('5_0','CRM'),
('5_1','Mapa'),
('5_99','Cadastros'),
('5_99_0','Vendedores'),

('100_0','Relatório'),
('100_1','Portaria'),
('100_1_0','Veículos'),
('100_2','Peças'),
('100_2_0','Pedidos de compras'),

('100_3','Oficina'),
('100_3_0','Controle de equipamentos'),
('100_3_1','Requisições'),


('999_0','Configuração'),
('999_2','Cadastros'),
('999_2_0','Empresa'),
('999_2_1','Usuários'),
('999_2_2','Marcas');

INSERT INTO `tb_company`
(`status`, `name`, `cnpj`, `email`, `cellphone`, `phone`, `zip_code`, `state`, `city`, `neighborhood`, `address`, `address_number`)
VALUES
(0,'Nativa Máquinas e Implementos Ltda','08274520000102','ti@nativarossi.com.br','','8135211030','54590000', 'PE','Cabo de Santo Agostinho','Distrito DIPER','Via pedro rossi','382');

INSERT INTO `tb_resale`
(`company_id`,`status`, `name`, `cnpj`, `email`, `cellphone`, `phone`,  `zip_code`, `state`, `city`, `neighborhood`, `address`, `address_number`)
VALUES
(1,0,'Nativa Máquinas e Implementos Ltda','08274520000102','ti@nativarossi.com.br','','8135211030','54590000', 'PE','Cabo de Santo Agostinho','Distrito DIPER','Via pedro rossi','382');

INSERT INTO `tb_user_role`
(`company_id`, `resale_id`, `status`, `description`)
VALUES
(1,1,0,'TI'),
(1,1,0,'Vendedor'),
(1,1,0,'Comprador'),
(1,1,0,'Assistente'),
(1,1,0,'Financeiro'),
(1,1,0,'Diretoria'),
(1,1,0,'Gerente'),
(1,1,0,'Almoxarife'),
(1,1,0,'Mecânico'),
(1,1,0,'Porteiro'),
(1,1,0,'Motorista'),
(1,1,0,'Recursos Humanos');

INSERT INTO `tb_user`
(`company_id`, `resale_id`,`status`, `name`, `email`, `password`, `cellphone`, `limit_discount`, `role_id`, `role_desc`, `role_func`, `photo_url`)
VALUES
(1,1,0,'Administrador','vambersson@gmail.com','$2a$10$9EKoKdyZdu.iFS8QnBykoOCW1Gix0PB/k6PN5L5t7URoddZ.wsu9i','81982158862',10,1,'TI',0,'');

INSERT INTO tb_vehicle_model
(company_id, resale_id, status, description)
VALUES
(1,1,0,'Cavalo Mecânico'),
(1,1,0,'Graneleiro'),
(1,1,0,'Basculante'),
(1,1,0,'Tanque'),
(1,1,0,'Carrega Tudo'),
(1,1,0,'Dolly'),
(1,1,0,'Carroceria'),
(1,1,0,'Porta Contêiner'),
(1,1,0,'Furgão Lonado'),
(1,1,0,'Furgão Alumínio'),
(1,1,0,'Veículo Empresa'),
(1,1,0,'Veículo Passeio'),
(1,1,0,'Entrega Material'),
(1,1,0,'Coleta Material'),
(1,1,0,'Outro');

INSERT INTO `tb_client_category`
(`company_id`, `resale_id`, `status`,`description`)
VALUES
(1,1,0,'P.F. Consumidor'),
(1,1,0,'P.J. C/Insc. Est.'),
(1,1,0,'P.J. S/Insc. Est.');

INSERT INTO tb_payment_type
(`company_id`, `resale_id`, `status`, `description`)
VALUE
(1,1,0,'À vista (dinheiro)'),
(1,1,0,'À vista (pix)'),
(1,1,0,'À vista (transferência)'),
(1,1,0,'Cartão de débito'),
(1,1,0,'Cartão de crédito'),
(1,1,0,'Cartão de crédito parcelado 2x'),
(1,1,0,'Cartão de crédito parcelado 3x'),
(1,1,0,'Cartão de crédito parcelado 4x'),
(1,1,0,'Cartão de crédito parcelado 5x'),
(1,1,0,'Cartão de crédito parcelado 6x'),
(1,1,0,'Cartão de crédito parcelado 7x'),
(1,1,0,'Cartão de crédito parcelado 8x'),
(1,1,0,'Cartão de crédito parcelado 9x'),
(1,1,0,'Cartão de crédito parcelado 10x'),
(1,1,0,'Cartão de crédito parcelado 11x'),
(1,1,0,'Cartão de crédito parcelado 12x'),
(1,1,0,'Faturamento especial'),
(1,1,0,'Faturamento 28 dias'),
(1,1,0,'Faturamento 30 dias'),
(1,1,0,'Faturamento 30/60 dias'),
(1,1,0,'Faturamento 30/60/90 dias'),
(1,1,0,'Faturamento 30/60/90/120 dias'),
(1,1,0,'Faturamento 30/60/90/120/150 dias'),
(1,1,0,'Faturamento 30/60/90/120/150/180 dias');


INSERT INTO `tb_conf_vehicle_entry_checklist`
(`company_id`, `resale_id`,`checklist1Enabled`, `checklist1Desc`, `checklist2Enabled`, `checklist2Desc`, `checklist3Enabled`, `checklist3Desc`, `checklist4Enabled`, `checklist4Desc`, `checklist5Enabled`, `checklist5Desc`, `checklist6Enabled`, `checklist6Desc`, `checklist7Enabled`, `checklist7Desc`, `checklist8Enabled`, `checklist8Desc`, `checklist9Enabled`, `checklist9Desc`, `checklist10Enabled`, `checklist10Desc`, `checklist11Enabled`, `checklist11Desc`, `checklist12Enabled`, `checklist12Desc`, `checklist13Enabled`, `checklist13Desc`, `checklist14Enabled`, `checklist14Desc`, `checklist15Enabled`, `checklist15Desc`, `checklist16Enabled`, `checklist16Desc`, `checklist17Enabled`, `checklist17Desc`, `checklist18Enabled`, `checklist18Desc`, `checklist19Enabled`, `checklist19Desc`, `checklist20Enabled`, `checklist20Desc`)
VALUES
(1,1,null,'',null,'',null,'',null,'',null,'',null,'',null,'',null,'',null,'',null,'',null,'',null,'',null,'',null,'',null,'',null,'',null,'',null,'',null,'',null,'');







