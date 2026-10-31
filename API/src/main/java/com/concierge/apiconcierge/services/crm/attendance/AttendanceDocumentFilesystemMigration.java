package com.concierge.apiconcierge.services.crm.attendance;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.Map;

/** Opt-in migration for installations that applied the previous BLOB schema. */
@Component
@ConditionalOnProperty(name="attendance.documents.migrate-from-database", havingValue="true")
public class AttendanceDocumentFilesystemMigration implements ApplicationRunner {
 private final JdbcTemplate jdbc;
 private final AttendanceDocumentStorage storage;
 public AttendanceDocumentFilesystemMigration(JdbcTemplate jdbc,AttendanceDocumentStorage storage){this.jdbc=jdbc;this.storage=storage;}
 private boolean columnExists(String name){return jdbc.queryForObject("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='tb_crm_attendance_document' AND column_name=?",Integer.class,name)>0;}
 @Override public void run(ApplicationArguments args) throws Exception {
  if(!columnExists("file_content"))return;
  if(!columnExists("file_path"))jdbc.execute("ALTER TABLE tb_crm_attendance_document ADD COLUMN file_path VARCHAR(1024) NULL");
  jdbc.execute("ALTER TABLE tb_crm_attendance_document MODIFY COLUMN file_content MEDIUMBLOB NULL");
  while(true){
   var rows=jdbc.queryForList("SELECT d.id,d.attendance_id,d.content_type,d.file_content,a.company_id,a.resale_id FROM tb_crm_attendance_document d JOIN tb_crm_customer_attendance a ON a.id=d.attendance_id WHERE d.file_content IS NOT NULL ORDER BY d.id LIMIT 1");
   if(rows.isEmpty())break;
   var row=rows.get(0);byte[] bytes=(byte[])row.get("file_content");
   String extension=Map.of("application/pdf","pdf","image/jpeg","jpg","image/png","png","image/webp","webp").get((String)row.get("content_type"));
   if(extension==null)throw new IllegalStateException("Unsupported legacy document type; original content was preserved.");
   String path=storage.save(((Number)row.get("company_id")).intValue(),((Number)row.get("resale_id")).intValue(),((Number)row.get("attendance_id")).intValue(),extension,bytes);
   try{
    if(!Arrays.equals(bytes,storage.read(path)))throw new IllegalStateException("Document copy verification failed.");
   }catch(Exception error){try{storage.delete(path);}catch(Exception cleanup){error.addSuppressed(cleanup);}throw error;}
   // Keep the verified copy on uncertain database outcomes; never risk deleting the only remaining bytes.
   int updated=jdbc.update("UPDATE tb_crm_attendance_document SET file_path=?,file_content=NULL WHERE id=? AND file_content IS NOT NULL",path,row.get("id"));
   if(updated!=1)throw new IllegalStateException("Legacy document changed during migration; verified copy retained.");
  }
  Integer missing=jdbc.queryForObject("SELECT COUNT(*) FROM tb_crm_attendance_document WHERE file_path IS NULL OR file_path=''",Integer.class);
  if(missing!=null && missing>0)throw new IllegalStateException("Some documents have no file path; schema cleanup was stopped to preserve data.");
  jdbc.execute("ALTER TABLE tb_crm_attendance_document MODIFY COLUMN file_path VARCHAR(1024) NOT NULL, DROP COLUMN file_content");
 }
}
