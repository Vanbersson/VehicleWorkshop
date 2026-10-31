-- Executar somente se a coluna ie ainda nao existir em tb_resale.
-- Com spring.jpa.ddl-auto=update, a coluna e criada ao reiniciar a API atualizada.
ALTER TABLE tb_resale ADD COLUMN ie VARCHAR(30) NULL;
