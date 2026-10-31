package com.concierge.apiconcierge.services.crm.attendance;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import static org.junit.jupiter.api.Assertions.*;
@ExtendWith(MockitoExtension.class)
class AttendanceDocumentFilesystemMigrationTest {
 @Mock JdbcTemplate jdbc;
 @Mock AttendanceDocumentStorage storage;
 @InjectMocks AttendanceDocumentFilesystemMigration migration;
 byte[] bytes="%PDF-test".getBytes();
 @BeforeEach void setup() throws Exception {
  when(jdbc.queryForObject(contains("information_schema"),eq(Integer.class),eq("file_content"))).thenReturn(1);
  when(jdbc.queryForObject(contains("information_schema"),eq(Integer.class),eq("file_path"))).thenReturn(1);
  when(jdbc.queryForList(anyString())).thenReturn(List.of(Map.of("id",7,"attendance_id",42,"content_type","application/pdf","file_content",bytes,"company_id",1,"resale_id",2)),List.of());
  when(storage.save(eq(1),eq(2),eq(42),eq("pdf"),any())).thenReturn("1/2/file.pdf");
 }
 @Test void verifiesTheFileBeforeClearingDatabaseContentAndDroppingTheBlobColumn() throws Exception {
  when(storage.read("1/2/file.pdf")).thenReturn(bytes);
  when(jdbc.update(anyString(),eq("1/2/file.pdf"),eq(7))).thenReturn(1);
  when(jdbc.queryForObject(startsWith("SELECT COUNT(*) FROM tb_"),eq(Integer.class))).thenReturn(0);
  migration.run(null);
  var order=inOrder(storage,jdbc);order.verify(storage).read("1/2/file.pdf");order.verify(jdbc).update(contains("file_content=NULL"),eq("1/2/file.pdf"),eq(7));order.verify(jdbc).execute(contains("DROP COLUMN file_content"));
  verify(storage,never()).delete(anyString());
 }
 @Test void preservesDatabaseBytesIfFileVerificationFails() throws Exception {
  when(storage.read("1/2/file.pdf")).thenReturn(new byte[]{0});
  assertThrows(IllegalStateException.class,()->migration.run(null));
  verify(jdbc,never()).update(anyString(),any(),any());verify(jdbc,never()).execute(contains("DROP COLUMN"));verify(storage).delete("1/2/file.pdf");
 }
 @Test void retainsTheVerifiedCopyWhenDatabaseCommitOutcomeIsUncertain() throws Exception {
  when(storage.read("1/2/file.pdf")).thenReturn(bytes);
  when(jdbc.update(anyString(),eq("1/2/file.pdf"),eq(7))).thenThrow(new IllegalStateException("Connection lost"));
  assertThrows(IllegalStateException.class,()->migration.run(null));verify(storage,never()).delete(anyString());verify(jdbc,never()).execute(contains("DROP COLUMN"));
 }
}
