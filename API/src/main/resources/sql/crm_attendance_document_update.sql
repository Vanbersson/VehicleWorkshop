-- Atualizacao direta, sem procedure.
-- Se voce executou crm_attendance_document.sql na versao atual,
-- a tabela ja possui file_path e nao precisa de ALTER TABLE.
-- Confira a estrutura:
SHOW COLUMNS FROM tb_crm_attendance_document;

-- SOMENTE se voce executou a primeira versao de criacao,
-- com file_content e sem file_path, e ainda NAO salvou documentos:
-- confirme que a tabela esta vazia antes de executar o ALTER abaixo.
SELECT COUNT(*) AS documentos_cadastrados FROM tb_crm_attendance_document;

-- Execute manualmente apenas se a contagem acima for ZERO e a tabela
-- possuir file_content, mas nao possuir file_path:
-- ALTER TABLE tb_crm_attendance_document
--     ADD COLUMN file_path VARCHAR(1024) NOT NULL,
--     DROP COLUMN file_content;

-- Se houver documentos na versao antiga, transfira os arquivos para a pasta
-- antes de remover file_content. Consulte crm_attendance_document_storage.md.
