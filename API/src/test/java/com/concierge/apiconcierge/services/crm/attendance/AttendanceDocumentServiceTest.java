package com.concierge.apiconcierge.services.crm.attendance;
import com.concierge.apiconcierge.models.crm.attendance.*;
import com.concierge.apiconcierge.repositories.crm.attendance.*;
import com.concierge.apiconcierge.exceptions.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import java.nio.charset.StandardCharsets;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.mockito.AdditionalMatchers.aryEq;
import static org.junit.jupiter.api.Assertions.*;
@ExtendWith(MockitoExtension.class)
class AttendanceDocumentServiceTest {
 @Mock CustomerAttendanceService attendances;
 @Mock ICustomerAttendanceRepository attendanceRepository;
 @Mock IAttendanceDocumentRepository documents;
 @Mock AttendanceDocumentStorage storage;
 @InjectMocks AttendanceDocumentService service;
 CustomerAttendance attendance;
 @BeforeEach void setup(){attendance=new CustomerAttendance();attendance.setId(42);attendance.setCompanyId(1);attendance.setResaleId(2);when(attendances.authorizedAttendance(42,"user")).thenReturn(attendance);lenient().when(attendanceRepository.findForQuote(1,2,42)).thenReturn(attendance);}
 @Test void storesPdfBytesInTheFolderAndOnlyThePathInTheDatabase() throws Exception {
  when(storage.save(eq(1),eq(2),eq(42),eq("pdf"),any())).thenReturn("1/2/attendance/42/documents/file.pdf");
  byte[] bytes="%PDF-1.7 test".getBytes(StandardCharsets.US_ASCII);
  when(documents.saveAndFlush(any())).thenAnswer(call->{AttendanceDocument d=call.getArgument(0);d.setId(8);return d;});
  var saved=service.upload(42,new MockMultipartFile("file","contrato.pdf","application/pdf",bytes),"user");
  assertEquals(8,saved.id());assertEquals("application/pdf",saved.contentType());assertEquals((long)bytes.length,saved.size());
  ArgumentCaptor<AttendanceDocument> doc=ArgumentCaptor.forClass(AttendanceDocument.class);verify(documents).saveAndFlush(doc.capture());assertEquals(42,doc.getValue().getAttendanceId());assertEquals("1/2/attendance/42/documents/file.pdf",doc.getValue().getFilePath());verify(storage).save(eq(1),eq(2),eq(42),eq("pdf"),aryEq(bytes));
 }
 @Test void acceptsPngAndDetectsTypeFromBytesRatherThanDeclaredMime() throws Exception {
  when(documents.saveAndFlush(any())).thenAnswer(call->{AttendanceDocument d=call.getArgument(0);d.setId(9);return d;});
  var saved=service.upload(42,new MockMultipartFile("file","foto.png","application/octet-stream",new byte[]{(byte)137,80,78,71,13,10,26,10}),"user");assertEquals("image/png",saved.contentType());
 }
 @Test void rejectsUnsupportedContentAndDisguisedExtensions(){
  assertThrows(BusinessException.class,()->service.upload(42,new MockMultipartFile("file","foto.png","image/png","executable".getBytes()),"user"));
  assertThrows(BusinessException.class,()->service.upload(42,new MockMultipartFile("file","script.html","application/pdf","%PDF-test".getBytes()),"user"));verify(documents,never()).saveAndFlush(any());
 }
 @Test void rejectsEmptyAndOversizedFiles(){
  assertThrows(BusinessException.class,()->service.upload(42,new MockMultipartFile("file","vazio.pdf","application/pdf",new byte[0]),"user"));
  assertThrows(BusinessException.class,()->service.upload(42,new MockMultipartFile("file","grande.pdf","application/pdf",new byte[5*1024*1024+1]),"user"));
 }
 @Test void cancellationBlocksUploadButPreservesReading() throws Exception {
  attendance.setStatus(AttendanceStatus.CANCELLED);
  assertThrows(BusinessException.class,()->service.upload(42,new MockMultipartFile("file","doc.pdf","application/pdf","%PDF-test".getBytes()),"user"));
  when(documents.listMetadata(42)).thenReturn(List.of());assertTrue(service.list(42,"user").isEmpty());
  AttendanceDocument saved=new AttendanceDocument();saved.setFilePath("1/2/attendance/42/documents/file.pdf");when(storage.read(saved.getFilePath())).thenReturn(new byte[]{1,2,3});when(documents.findByAttendanceIdAndId(42,8)).thenReturn(Optional.of(saved));var downloaded=service.download(42,8,"user");assertSame(saved,downloaded.document());assertArrayEquals(new byte[]{1,2,3},downloaded.content());verify(documents,never()).saveAndFlush(any());
 }
 @Test void rejectsAFileFromAnotherAttendance(){when(documents.findByAttendanceIdAndId(42,999)).thenReturn(Optional.empty());assertThrows(ResourcesNotFoundException.class,()->service.download(42,999,"user"));}
 @Test void authorizationIsRequiredBeforeListingOrDownloading(){when(attendances.authorizedAttendance(42,"user")).thenThrow(new BusinessException("Denied"));assertThrows(BusinessException.class,()->service.list(42,"user"));assertThrows(BusinessException.class,()->service.download(42,8,"user"));verifyNoInteractions(documents);}
 @Test void removesTheFileIfSavingMetadataFails() throws Exception {
  when(storage.save(any(),any(),any(),any(),any())).thenReturn("1/2/attendance/42/documents/file.pdf");
  when(documents.saveAndFlush(any())).thenThrow(new IllegalStateException("Database offline"));
  assertThrows(IllegalStateException.class,()->service.upload(42,new MockMultipartFile("file","contrato.pdf","application/pdf","%PDF-test".getBytes()),"user"));
  verify(storage).delete("1/2/attendance/42/documents/file.pdf");
 }
}
