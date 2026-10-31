package com.concierge.apiconcierge.services.crm.attendance;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import java.nio.file.*;
import static org.junit.jupiter.api.Assertions.*;
class AttendanceDocumentStorageTest {
 @TempDir Path temp;
 @Test void persistsOriginalBytesInTenantFoldersAndUsesUniqueFileNames() throws Exception {
  AttendanceDocumentStorage storage=new AttendanceDocumentStorage(temp.resolve("images").toString(),"");
  byte[] content="%PDF-test".getBytes();
  String first=storage.save(1,2,42,"pdf",content);String second=storage.save(1,2,42,"pdf",content);
  assertNotEquals(first,second);assertTrue(first.startsWith("1/2/attendance/42/documents/"));
  assertArrayEquals(content,Files.readAllBytes(temp.resolve("attendance-documents").resolve(first)));assertArrayEquals(content,storage.read(first));
  storage.delete(first);assertFalse(Files.exists(temp.resolve("attendance-documents").resolve(first)));assertArrayEquals(content,storage.read(second));
 }
 @Test void supportsACustomDocumentFolderOutsidePublicImages() throws Exception {
  AttendanceDocumentStorage storage=new AttendanceDocumentStorage(temp.resolve("images").toString(),temp.resolve("private-files").toString());
  String relative=storage.save(1,2,42,"png",new byte[]{1});assertTrue(Files.exists(temp.resolve("private-files").resolve(relative)));
 }
 @Test void blocksTraversalAndPublicStorageRoots(){
  AttendanceDocumentStorage storage=new AttendanceDocumentStorage(temp.resolve("images").toString(),"");
  assertThrows(RuntimeException.class,()->storage.read("../outside.pdf"));
  assertThrows(IllegalArgumentException.class,()->new AttendanceDocumentStorage(temp.resolve("images").toString(),temp.resolve("images/documents").toString()));
 }
}
