package com.concierge.apiconcierge.services.crm.attendance;
import com.concierge.apiconcierge.models.crm.attendance.*;
import com.concierge.apiconcierge.repositories.crm.attendance.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
@ExtendWith(MockitoExtension.class)
class OrderDocumentShareServiceTest {
 @Mock CustomerAttendanceService attendances;
 @Mock ICustomerAttendanceRepository attendanceRepository;
 @Mock IAttendanceDocumentRepository documents;
 @Mock AttendanceDocumentStorage storage;
 @Mock IAttendanceLogRepository logs;
 @InjectMocks OrderDocumentShareService service;
 CustomerAttendance attendance;AttendanceDocument document;
 @BeforeEach void setup(){ attendance=new CustomerAttendance();attendance.setId(42);attendance.setCompanyId(1);attendance.setResaleId(2);attendance.setClientId(88);attendance.setClientName("Cliente");document=new AttendanceDocument();document.setId(7);document.setAttendanceId(42);document.setStage(AttendanceDocumentStage.DOCUMENTS);document.setShareExpiresAt(Instant.now().plusSeconds(60)); }
 @Test void createsAnOrderLinkAndDoesNotApproveIt(){
  when(attendances.authorizedAttendance(42,"user")).thenReturn(attendance);when(attendanceRepository.findForQuote(1,2,42)).thenReturn(attendance);when(documents.findByAttendanceIdAndId(42,7)).thenReturn(Optional.of(document));
  var result=service.create(42,7,"user");assertTrue(result.path().matches("/public/orders/[A-Za-z0-9_-]{43}"));assertNull(document.getOrderApprovedAt());assertNull(document.getProposalApprovedAt());
 }
 @Test void approvesOnlyTheOrderAfterReceivingSignedPdf(){
  document.setSignedFilePath("signed-order.pdf");
  when(documents.findForShareApproval(any())).thenReturn(Optional.of(document));when(attendanceRepository.findById(42)).thenReturn(Optional.of(attendance));
  assertThrows(ResponseStatusException.class,()->service.approve("a".repeat(43),false));
  var approved=service.approve("a".repeat(43),true);assertNotNull(approved);assertNull(document.getProposalApprovedAt());assertEquals(approved,service.approve("a".repeat(43),true));verify(documents,times(1)).saveAndFlush(document);verify(logs,times(1)).saveAndFlush(any());
 }
 @Test void rejectsProposalTokensOnOrderRoutes(){document.setStage(AttendanceDocumentStage.PROPOSAL);when(documents.findByShareTokenHash(any())).thenReturn(Optional.of(document));assertThrows(ResponseStatusException.class,()->service.page("a".repeat(43)));}
 @Test void rejectsExpiredTokens(){document.setShareExpiresAt(Instant.now().minusSeconds(1));when(documents.findForShareApproval(any())).thenReturn(Optional.of(document));assertThrows(ResponseStatusException.class,()->service.approve("a".repeat(43),true));verify(documents,never()).saveAndFlush(any());}
 @Test void rejectsCancelledAttendance(){attendance.setStatus(AttendanceStatus.CANCELLED);when(documents.findForShareApproval(any())).thenReturn(Optional.of(document));when(attendanceRepository.findById(42)).thenReturn(Optional.of(attendance));assertThrows(ResponseStatusException.class,()->service.approve("a".repeat(43),true));verify(documents,never()).saveAndFlush(any());}
 @Test void requiresSignedOrderBeforeApproval(){
  when(documents.findForShareApproval(any())).thenReturn(Optional.of(document));when(attendanceRepository.findById(42)).thenReturn(Optional.of(attendance));
  assertThrows(ResponseStatusException.class,()->service.approve("a".repeat(43),true));verify(documents,never()).saveAndFlush(any());assertNull(document.getOrderApprovedAt());
 }
 @Test void storesSignedPdfBeforeApprovingTheOrder() throws Exception {
  when(documents.findForShareApproval(any())).thenReturn(Optional.of(document));when(attendanceRepository.findById(42)).thenReturn(Optional.of(attendance));when(storage.save(eq(1),eq(2),eq(42),eq("pdf"),any())).thenReturn("signed-order.pdf");
  service.uploadSigned("a".repeat(43),new org.springframework.mock.web.MockMultipartFile("file","pedido-assinado.pdf","application/pdf","%PDF-test".getBytes()));
  assertEquals("signed-order.pdf",document.getSignedFilePath());assertNotNull(document.getSignedUploadedAt());assertNull(document.getOrderApprovedAt());
  assertNotNull(service.approve("a".repeat(43),true));assertNull(document.getProposalApprovedAt());
 }
 @Test void rejectsInvalidSignedOrderFiles(){
  when(documents.findForShareApproval(any())).thenReturn(Optional.of(document));when(attendanceRepository.findById(42)).thenReturn(Optional.of(attendance));
  assertThrows(ResponseStatusException.class,()->service.uploadSigned("a".repeat(43),new org.springframework.mock.web.MockMultipartFile("file","pedido.pdf","application/pdf","image".getBytes())));
  assertThrows(ResponseStatusException.class,()->service.uploadSigned("a".repeat(43),new org.springframework.mock.web.MockMultipartFile("file","pedido.pdf","application/pdf",new byte[5*1024*1024+1])));
  verifyNoInteractions(storage);verify(documents,never()).saveAndFlush(any());
 }


 @Test void recordsSignedOrderUploadAndApprovalWithClientAndDates() throws Exception {
  when(documents.findForShareApproval(any())).thenReturn(Optional.of(document));when(attendanceRepository.findById(42)).thenReturn(Optional.of(attendance));when(storage.save(any(),any(),any(),any(),any())).thenReturn("signed.pdf");
  service.uploadSigned("a".repeat(43),new org.springframework.mock.web.MockMultipartFile("file","pedido-assinado.pdf","application/pdf","%PDF-test".getBytes()));
  service.approve("a".repeat(43),true);service.approve("a".repeat(43),true);
  ArgumentCaptor<AttendanceLog> entries=ArgumentCaptor.forClass(AttendanceLog.class);verify(logs,times(2)).saveAndFlush(entries.capture());
  assertEquals(AttendanceLogAction.SIGNED_ORDER_UPLOADED,entries.getAllValues().get(0).getAction());assertEquals(document.getSignedUploadedAt(),entries.getAllValues().get(0).getOccurredAt());
  assertEquals(AttendanceLogAction.ORDER_APPROVED,entries.getAllValues().get(1).getAction());assertEquals(document.getOrderApprovedAt(),entries.getAllValues().get(1).getOccurredAt());
  for(var log:entries.getAllValues()){assertEquals(AttendanceStatus.QUOTATION,log.getStage());assertEquals(88,log.getClientId());assertEquals("Cliente",log.getClientName());assertEquals(42,log.getAttendanceId());assertEquals(7,log.getDocumentId());assertEquals("pedido-assinado.pdf",log.getFileName());assertNull(log.getUserId());}
 }
 @Test void cleansUpSignedOrderIfLoggingFails() throws Exception {
  when(documents.findForShareApproval(any())).thenReturn(Optional.of(document));when(attendanceRepository.findById(42)).thenReturn(Optional.of(attendance));when(storage.save(any(),any(),any(),any(),any())).thenReturn("signed.pdf");when(logs.saveAndFlush(any())).thenThrow(new IllegalStateException("Audit unavailable"));
  assertThrows(IllegalStateException.class,()->service.uploadSigned("a".repeat(43),new org.springframework.mock.web.MockMultipartFile("file","pedido.pdf","application/pdf","%PDF-test".getBytes())));verify(storage).delete("signed.pdf");
 }
}
