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
class ProposalDocumentShareServiceTest {
 @Mock CustomerAttendanceService attendances;
 @Mock ICustomerAttendanceRepository attendanceRepository;
 @Mock IAttendanceDocumentRepository documents;
 @Mock AttendanceDocumentStorage storage;
 @Mock IAttendanceLogRepository logs;
 @InjectMocks ProposalDocumentShareService service;
 CustomerAttendance attendance; AttendanceDocument document;
 @BeforeEach void setup() {
  lenient().when(attendanceRepository.findForQuote(1,2,42)).thenAnswer(call -> attendance);
  attendance=new CustomerAttendance();attendance.setId(42);attendance.setCompanyId(1);attendance.setResaleId(2);attendance.setClientId(88);attendance.setClientName("Cliente");
  document=new AttendanceDocument();document.setId(7);document.setAttendanceId(42);document.setStage(AttendanceDocumentStage.PROPOSAL);document.setFilePath("file.pdf");document.setShareExpiresAt(Instant.now().plusSeconds(60));
 }
 private void creation() {
  when(attendances.authorizedAttendance(42,"user")).thenReturn(attendance);
  when(attendanceRepository.findForQuote(1,2,42)).thenReturn(attendance);
  when(documents.findByAttendanceIdAndId(42,7)).thenReturn(Optional.of(document));
 }
 @Test void createsExpiringRandomLinkAndStoresOnlyHash() {
  creation();var first=service.create(42,7,"user");String old=document.getShareTokenHash();var second=service.create(42,7,"user");
  assertTrue(first.path().matches("/public/proposals/[A-Za-z0-9_-]{43}"));assertNotEquals(first.path(),second.path());assertNotEquals(old,document.getShareTokenHash());assertEquals(64,document.getShareTokenHash().length());assertTrue(first.expiresAt().isAfter(Instant.now().plusSeconds(6*86400)));
 }
 @Test void rejectsSharingNonProposalDocuments() {
  creation();document.setStage(AttendanceDocumentStage.DOCUMENTS);
  assertThrows(ResponseStatusException.class,()->service.create(42,7,"user"));verify(documents,never()).saveAndFlush(any());
 }
 @Test void servesValidDocumentWithoutAccountAuthentication() throws Exception {
  when(documents.findByShareTokenHash(any())).thenReturn(Optional.of(document));when(attendanceRepository.findById(42)).thenReturn(Optional.of(attendance));when(storage.read("file.pdf")).thenReturn(new byte[]{1});
  assertArrayEquals(new byte[]{1},service.view("a".repeat(43)).content());verifyNoInteractions(attendances);
 }
 @Test void rejectsExpiredOrMalformedTokens() {
  assertThrows(ResponseStatusException.class,()->service.view("bad"));
  document.setShareExpiresAt(Instant.now().minusSeconds(1));when(documents.findByShareTokenHash(any())).thenReturn(Optional.of(document));
  assertThrows(ResponseStatusException.class,()->service.view("a".repeat(43)));verifyNoInteractions(storage);
 }
 @Test void rejectsCancelledAttendance() {
  attendance.setStatus(AttendanceStatus.CANCELLED);when(documents.findByShareTokenHash(any())).thenReturn(Optional.of(document));when(attendanceRepository.findById(42)).thenReturn(Optional.of(attendance));
  assertThrows(ResponseStatusException.class,()->service.view("a".repeat(43)));verifyNoInteractions(storage);
 }
 @Test void approvalIsExplicitAndIdempotent() {
  document.setSignedFilePath("signed.pdf");
  when(documents.findForShareApproval(any())).thenReturn(Optional.of(document));when(attendanceRepository.findById(42)).thenReturn(Optional.of(attendance));
  assertThrows(ResponseStatusException.class,()->service.approve("a".repeat(43),false));
  var approved=service.approve("a".repeat(43),true);
  assertNotNull(approved);assertEquals(approved,service.approve("a".repeat(43),true));
  verify(documents,times(1)).saveAndFlush(document);verify(logs,times(1)).saveAndFlush(any());verifyNoInteractions(storage);
 }
 @Test void pageDoesNotApproveTheProposal() {
  when(documents.findByShareTokenHash(any())).thenReturn(Optional.of(document));when(attendanceRepository.findById(42)).thenReturn(Optional.of(attendance));
  service.page("a".repeat(43));assertNull(document.getProposalApprovedAt());verify(documents,never()).saveAndFlush(any());
 }
 @Test void expiredLinkCannotApprove() {
  document.setShareExpiresAt(Instant.now().minusSeconds(1));when(documents.findForShareApproval(any())).thenReturn(Optional.of(document));
  assertThrows(ResponseStatusException.class,()->service.approve("a".repeat(43),true));verify(documents,never()).saveAndFlush(any());
 }

 @Test void approvalRequiresSignedProposal() {
  when(documents.findForShareApproval(any())).thenReturn(Optional.of(document));when(attendanceRepository.findById(42)).thenReturn(Optional.of(attendance));
  assertThrows(ResponseStatusException.class,()->service.approve("a".repeat(43),true));assertNull(document.getProposalApprovedAt());verify(documents,never()).saveAndFlush(any());
 }
 @Test void uploadsSignedPdfWithoutApprovingAndThenAllowsApproval() throws Exception {
  when(documents.findForShareApproval(any())).thenReturn(Optional.of(document));when(attendanceRepository.findById(42)).thenReturn(Optional.of(attendance));
  when(storage.save(eq(1),eq(2),eq(42),eq("pdf"),any())).thenReturn("signed.pdf");
  service.uploadSigned("a".repeat(43),new org.springframework.mock.web.MockMultipartFile("file","assinada.pdf","application/pdf","%PDF-test".getBytes()));
  assertEquals("signed.pdf",document.getSignedFilePath());assertEquals("assinada.pdf",document.getSignedFileName());assertNotNull(document.getSignedUploadedAt());assertNull(document.getProposalApprovedAt());
  assertNotNull(service.approve("a".repeat(43),true));
  ArgumentCaptor<AttendanceLog> captor=ArgumentCaptor.forClass(AttendanceLog.class);verify(logs,times(2)).saveAndFlush(captor.capture());
  var uploaded=captor.getAllValues().get(0);var approved=captor.getAllValues().get(1);
  assertEquals(AttendanceLogAction.SIGNED_DOCUMENT_UPLOADED,uploaded.getAction());assertEquals(document.getSignedUploadedAt(),uploaded.getOccurredAt());
  assertEquals(AttendanceLogAction.PROPOSAL_APPROVED,approved.getAction());assertEquals(document.getProposalApprovedAt(),approved.getOccurredAt());
  for(var entry:captor.getAllValues()) {assertEquals(88,entry.getClientId());assertEquals("Cliente",entry.getClientName());assertNull(entry.getUserId());assertEquals(42,entry.getAttendanceId());assertEquals(7,entry.getDocumentId());assertEquals("assinada.pdf",entry.getFileName());assertEquals(AttendanceStatus.COMMERCIAL_PROPOSAL,entry.getStage());}

 }
 @Test void rejectsInvalidSignedFilesAndDuplicateUploads() {
  when(documents.findForShareApproval(any())).thenReturn(Optional.of(document));when(attendanceRepository.findById(42)).thenReturn(Optional.of(attendance));
  assertThrows(ResponseStatusException.class,()->service.uploadSigned("a".repeat(43),new org.springframework.mock.web.MockMultipartFile("file","assinada.pdf","application/pdf","invalid".getBytes())));
  assertThrows(ResponseStatusException.class,()->service.uploadSigned("a".repeat(43),new org.springframework.mock.web.MockMultipartFile("file","assinada.pdf","application/pdf",new byte[5*1024*1024+1])));
  document.setSignedFilePath("existing.pdf");
  assertThrows(ResponseStatusException.class,()->service.uploadSigned("a".repeat(43),new org.springframework.mock.web.MockMultipartFile("file","assinada.pdf","application/pdf","%PDF-test".getBytes())));
  verifyNoInteractions(storage);verify(documents,never()).saveAndFlush(any());
 }


 @Test void cleansSignedFileIfAuditFails() throws Exception {
  when(documents.findForShareApproval(any())).thenReturn(Optional.of(document));when(attendanceRepository.findById(42)).thenReturn(Optional.of(attendance));
  when(storage.save(any(),any(),any(),any(),any())).thenReturn("signed.pdf");when(logs.saveAndFlush(any())).thenThrow(new IllegalStateException("Audit unavailable"));
  assertThrows(IllegalStateException.class,()->service.uploadSigned("a".repeat(43),new org.springframework.mock.web.MockMultipartFile("file","assinada.pdf","application/pdf","%PDF-test".getBytes())));verify(storage).delete("signed.pdf");
 }
 @Test void invalidClientActionsDoNotWriteLogs() {
  when(documents.findForShareApproval(any())).thenReturn(Optional.of(document));when(attendanceRepository.findById(42)).thenReturn(Optional.of(attendance));
  assertThrows(ResponseStatusException.class,()->service.approve("a".repeat(43),true));
  assertThrows(ResponseStatusException.class,()->service.uploadSigned("a".repeat(43),new org.springframework.mock.web.MockMultipartFile("file","bad.pdf","application/pdf","bad".getBytes())));verifyNoInteractions(logs);
 }

 @Test void completedAttendanceRejectsNewLinksApprovalsAndSignatures() {
  attendance.setStatus(AttendanceStatus.COMPLETED);
  when(attendances.authorizedAttendance(42,"user")).thenReturn(attendance);
  assertThrows(ResponseStatusException.class,()->service.create(42,7,"user"));
  when(documents.findForShareApproval(any())).thenReturn(Optional.of(document));
  when(attendanceRepository.findById(42)).thenReturn(Optional.of(attendance));
  assertThrows(ResponseStatusException.class,()->service.approve("a".repeat(43),true));
  assertThrows(ResponseStatusException.class,()->service.uploadSigned("a".repeat(43),new org.springframework.mock.web.MockMultipartFile("file","doc.pdf","application/pdf","%PDF-test".getBytes())));
  verify(documents,never()).saveAndFlush(any()); verifyNoInteractions(storage);
 }

}
