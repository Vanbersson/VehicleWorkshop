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
 @Mock IAttendanceLogRepository logs;
 @Mock com.concierge.apiconcierge.repositories.user.IUserRepository users;
 @InjectMocks AttendanceDocumentService service;
 CustomerAttendance attendance;
 @BeforeEach void setup(){var uploader=new com.concierge.apiconcierge.models.user.User();uploader.setId(9);uploader.setName("Operador");lenient().when(users.filterEmail(1,2,"user")).thenReturn(uploader);attendance=new CustomerAttendance();attendance.setId(42);attendance.setCompanyId(1);attendance.setResaleId(2);when(attendances.authorizedAttendance(42,"user")).thenReturn(attendance);lenient().when(attendanceRepository.findForQuote(1,2,42)).thenReturn(attendance);}
 @Test void storesPdfBytesInTheFolderAndOnlyThePathInTheDatabase() throws Exception {
  when(storage.save(eq(1),eq(2),eq(42),eq("pdf"),any())).thenReturn("1/2/attendance/42/documents/file.pdf");
  byte[] bytes="%PDF-1.7 test".getBytes(StandardCharsets.US_ASCII);
  when(documents.saveAndFlush(any())).thenAnswer(call->{AttendanceDocument d=call.getArgument(0);d.setId(8);return d;});
  var saved=service.upload(42,new MockMultipartFile("file","contrato.pdf","application/pdf",bytes),"user");
  assertEquals(8,saved.id());assertEquals("application/pdf",saved.contentType());assertEquals((long)bytes.length,saved.size());
  ArgumentCaptor<AttendanceDocument> doc=ArgumentCaptor.forClass(AttendanceDocument.class);verify(documents).saveAndFlush(doc.capture());assertEquals(42,doc.getValue().getAttendanceId());assertEquals("1/2/attendance/42/documents/file.pdf",doc.getValue().getFilePath());verify(storage).save(eq(1),eq(2),eq(42),eq("pdf"),aryEq(bytes));
 }
 @Test void rejectsOrderImagesEvenWhenDeclaredAsPdf() {
  byte[] png=new byte[]{(byte)137,80,78,71,13,10,26,10};
  assertThrows(BusinessException.class,()->service.upload(42,new MockMultipartFile("file","pedido.pdf","application/pdf",png),AttendanceDocumentStage.DOCUMENTS,"user"));
  verify(documents,never()).saveAndFlush(any());verifyNoInteractions(storage);
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
  when(documents.listMetadata(42,AttendanceDocumentStage.DOCUMENTS)).thenReturn(List.of());assertTrue(service.list(42,"user").isEmpty());
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
 @Test void listsOnlyTheRequestedStage() {
  when(documents.listMetadata(42,AttendanceDocumentStage.PROPOSAL)).thenReturn(List.of());
  assertTrue(service.list(42,AttendanceDocumentStage.PROPOSAL,"user").isEmpty());
  verify(documents).listMetadata(42,AttendanceDocumentStage.PROPOSAL);
  verify(documents,never()).listMetadata(42,AttendanceDocumentStage.DOCUMENTS);
 }
 @Test void savesTheProposalStageWithTheAttachment() throws Exception {
  when(documents.saveAndFlush(any())).thenAnswer(call->call.getArgument(0));
  var saved=service.upload(42,new MockMultipartFile("file","proposta.pdf","application/pdf","%PDF-test".getBytes()),AttendanceDocumentStage.PROPOSAL,"user");
  assertEquals(AttendanceDocumentStage.PROPOSAL,saved.stage());
  ArgumentCaptor<AttendanceDocument> doc=ArgumentCaptor.forClass(AttendanceDocument.class);
  verify(documents).saveAndFlush(doc.capture());
  assertEquals(AttendanceDocumentStage.PROPOSAL,doc.getValue().getStage());
 }

 @Test void removesOnlyProposalDocumentsAndDeletesBytesAfterCommit() throws Exception {
  AttendanceDocument doc=new AttendanceDocument();doc.setStage(AttendanceDocumentStage.PROPOSAL);doc.setFilePath("proposal.pdf");
  when(documents.findByAttendanceIdAndId(42,8)).thenReturn(Optional.of(doc));
  org.springframework.transaction.support.TransactionSynchronizationManager.initSynchronization();
  try {
   service.removeProposalDocument(42,8,"user");
   verify(documents).delete(doc);verify(documents).flush();verify(storage,never()).delete(any());
   for(var sync:org.springframework.transaction.support.TransactionSynchronizationManager.getSynchronizations()) sync.afterCommit();
   verify(storage).delete("proposal.pdf");
  } finally { org.springframework.transaction.support.TransactionSynchronizationManager.clearSynchronization(); }
 }
 @Test void removalRejectsOtherStagesAndCancelledAttendances() {
  AttendanceDocument doc=new AttendanceDocument();
  when(documents.findByAttendanceIdAndId(42,8)).thenReturn(Optional.of(doc));
  assertThrows(BusinessException.class,()->service.removeProposalDocument(42,8,"user"));
  attendance.setStatus(AttendanceStatus.CANCELLED);
  assertThrows(BusinessException.class,()->service.removeProposalDocument(42,8,"user"));
  verify(documents,never()).delete(any());verifyNoInteractions(storage);
 }
 @Test void removalRequiresAuthorization() {
  when(attendances.authorizedAttendance(42,"user")).thenThrow(new BusinessException("Denied"));
  assertThrows(BusinessException.class,()->service.removeProposalDocument(42,8,"user"));
  verifyNoInteractions(documents,storage);
 }

 @Test void rejectsASecondProposalDocumentBeforeWritingBytes() {
  when(documents.findFirstByAttendanceIdAndStage(42,AttendanceDocumentStage.PROPOSAL)).thenReturn(Optional.of(new AttendanceDocument()));
  assertThrows(BusinessException.class,()->service.upload(42,new MockMultipartFile("file","proposta.pdf","application/pdf","%PDF-test".getBytes()),AttendanceDocumentStage.PROPOSAL,"user"));
  verify(documents,never()).saveAndFlush(any());verifyNoInteractions(storage);
 }

 @Test void deletesOriginalAndSignedFilesOnlyAfterCommit() throws Exception {
  var doc=new AttendanceDocument();doc.setStage(AttendanceDocumentStage.PROPOSAL);doc.setFilePath("original.pdf");doc.setSignedFilePath("signed.pdf");when(documents.findByAttendanceIdAndId(42,8)).thenReturn(Optional.of(doc));
  org.springframework.transaction.support.TransactionSynchronizationManager.initSynchronization();
  try {
   service.removeProposalDocument(42,8,"user");verify(documents).delete(doc);verifyNoInteractions(storage);
   for(var sync:org.springframework.transaction.support.TransactionSynchronizationManager.getSynchronizations()) sync.afterCommit();
   verify(storage).delete("original.pdf");verify(storage).delete("signed.pdf");
  } finally { org.springframework.transaction.support.TransactionSynchronizationManager.clearSynchronization(); }
 }
 @Test void rollbackPreservesBothProposalFiles() throws Exception {
  var doc=new AttendanceDocument();doc.setStage(AttendanceDocumentStage.PROPOSAL);doc.setFilePath("original.pdf");doc.setSignedFilePath("signed.pdf");when(documents.findByAttendanceIdAndId(42,8)).thenReturn(Optional.of(doc));
  org.springframework.transaction.support.TransactionSynchronizationManager.initSynchronization();
  try {
   service.removeProposalDocument(42,8,"user");
   for(var sync:org.springframework.transaction.support.TransactionSynchronizationManager.getSynchronizations()) sync.afterCompletion(org.springframework.transaction.support.TransactionSynchronization.STATUS_ROLLED_BACK);
   verifyNoInteractions(storage);
  } finally { org.springframework.transaction.support.TransactionSynchronizationManager.clearSynchronization(); }
 }

 @Test void proposalRejectsImagesEvenWhenRenamedToPdf() {
  byte[] png=new byte[]{(byte)137,80,78,71,13,10,26,10};
  assertThrows(BusinessException.class,()->service.upload(42,new MockMultipartFile("file","foto.png","image/png",png),AttendanceDocumentStage.PROPOSAL,"user"));
  assertThrows(BusinessException.class,()->service.upload(42,new MockMultipartFile("file","proposta.pdf","application/pdf",png),AttendanceDocumentStage.PROPOSAL,"user"));
  verifyNoInteractions(storage);verify(documents,never()).saveAndFlush(any());
 }

 @Test void removesOrderAttachmentAfterCommit() throws Exception {
  var doc=new AttendanceDocument();doc.setStage(AttendanceDocumentStage.DOCUMENTS);doc.setFilePath("pedido.pdf");when(documents.findByAttendanceIdAndId(42,8)).thenReturn(Optional.of(doc));
  org.springframework.transaction.support.TransactionSynchronizationManager.initSynchronization();
  try {
   service.removeOrderDocument(42,8,"user");verify(documents).delete(doc);verifyNoInteractions(storage);
   for(var sync:org.springframework.transaction.support.TransactionSynchronizationManager.getSynchronizations()) sync.afterCommit();
   verify(storage).delete("pedido.pdf");
  } finally { org.springframework.transaction.support.TransactionSynchronizationManager.clearSynchronization(); }
 }
 @Test void orderRemovalRejectsProposalAttachments() {
  var doc=new AttendanceDocument();doc.setStage(AttendanceDocumentStage.PROPOSAL);when(documents.findByAttendanceIdAndId(42,8)).thenReturn(Optional.of(doc));
  assertThrows(BusinessException.class,()->service.removeOrderDocument(42,8,"user"));verify(documents,never()).delete(any());verifyNoInteractions(storage);
 }

 @Test void rejectsASecondOrderPdf() {
  when(documents.findFirstByAttendanceIdAndStage(42,AttendanceDocumentStage.DOCUMENTS)).thenReturn(Optional.of(new AttendanceDocument()));
  assertThrows(BusinessException.class,()->service.upload(42,new MockMultipartFile("file","pedido.pdf","application/pdf","%PDF-test".getBytes()),AttendanceDocumentStage.DOCUMENTS,"user"));
  verify(documents,never()).saveAndFlush(any());verifyNoInteractions(storage);
 }


 @Test void acceptsMultiplePaymentReceiptsWithIndividualValues() throws Exception {
  when(storage.save(any(),any(),any(),any(),any())).thenReturn("receipt");
  when(documents.saveAndFlush(any())).thenAnswer(call->call.getArgument(0));
  var pdf=service.upload(42,new MockMultipartFile("file","receipt.pdf","application/pdf","%PDF-test".getBytes()),AttendanceDocumentStage.PAYMENT,new java.math.BigDecimal("20.50"),"user");
  var image=service.upload(42,new MockMultipartFile("file","receipt.png","image/png",new byte[]{(byte)137,80,78,71,13,10,26,10}),AttendanceDocumentStage.PAYMENT,new java.math.BigDecimal("30.00"),"user");
  assertEquals(new java.math.BigDecimal("20.50"),pdf.receiptAmount());assertEquals(new java.math.BigDecimal("30.00"),image.receiptAmount());assertEquals(AttendanceDocumentStage.PAYMENT,image.stage());assertEquals(9,pdf.uploadedByUserId());assertEquals("Operador",image.uploadedByUserName());assertEquals(9,image.updatedByUserId());assertNotNull(image.updatedAt());
  verify(documents,never()).findFirstByAttendanceIdAndStage(any(),any());
 }
 @Test void requiresPositivePaymentValueWithTwoDecimalPlaces() {
  var file=new MockMultipartFile("file","receipt.pdf","application/pdf","%PDF-test".getBytes());
  for(var value:List.of(new java.math.BigDecimal("0"),new java.math.BigDecimal("-1"),new java.math.BigDecimal("1.234"))) assertThrows(BusinessException.class,()->service.upload(42,file,AttendanceDocumentStage.PAYMENT,value,"user"));
  assertThrows(BusinessException.class,()->service.upload(42,file,AttendanceDocumentStage.PAYMENT,null,"user"));verifyNoInteractions(storage);
 }
 @Test void updatesOnlyPaymentReceiptValues() {
  AttendanceDocument doc=new AttendanceDocument();doc.setStage(AttendanceDocumentStage.PAYMENT);
  when(documents.findByAttendanceIdAndId(42,8)).thenReturn(Optional.of(doc));when(documents.saveAndFlush(doc)).thenReturn(doc);
  assertEquals(new java.math.BigDecimal("45.50"),service.updateReceiptAmount(42,8,new java.math.BigDecimal("45.50"),"user").receiptAmount());
  doc.setStage(AttendanceDocumentStage.PROPOSAL);assertThrows(BusinessException.class,()->service.updateReceiptAmount(42,8,new java.math.BigDecimal("20"),"user"));
 }

 @Test void removesPaymentReceiptAndDeletesFileAfterCommit() throws Exception {
  AttendanceDocument doc=new AttendanceDocument();doc.setStage(AttendanceDocumentStage.PAYMENT);doc.setFilePath("receipt.pdf");
  when(documents.findByAttendanceIdAndId(42,8)).thenReturn(Optional.of(doc));
  org.springframework.transaction.support.TransactionSynchronizationManager.initSynchronization();
  try {
   service.removePaymentReceipt(42,8,"user");verify(documents).delete(doc);verify(documents).flush();verify(storage,never()).delete(any());
   for(var sync:org.springframework.transaction.support.TransactionSynchronizationManager.getSynchronizations()) sync.afterCommit();
   verify(storage).delete("receipt.pdf");
  } finally {org.springframework.transaction.support.TransactionSynchronizationManager.clearSynchronization();}
 }
 @Test void paymentRemovalRejectsOtherStagesAndCancelledAttendances() {
  AttendanceDocument doc=new AttendanceDocument();doc.setStage(AttendanceDocumentStage.PROPOSAL);
  when(documents.findByAttendanceIdAndId(42,8)).thenReturn(Optional.of(doc));
  assertThrows(BusinessException.class,()->service.removePaymentReceipt(42,8,"user"));
  doc.setStage(AttendanceDocumentStage.DOCUMENTS);assertThrows(BusinessException.class,()->service.removePaymentReceipt(42,8,"user"));
  doc.setStage(AttendanceDocumentStage.PAYMENT);attendance.setStatus(AttendanceStatus.CANCELLED);
  assertThrows(BusinessException.class,()->service.removePaymentReceipt(42,8,"user"));verify(documents,never()).delete(any());verifyNoInteractions(storage);
 }

 @Test void editingReceiptValuePreservesOriginalUploader() {
  AttendanceDocument doc=new AttendanceDocument();doc.setStage(AttendanceDocumentStage.PAYMENT);doc.setUploadedByUserId(15);doc.setUploadedByUserName("Original");
  when(documents.findByAttendanceIdAndId(42,8)).thenReturn(Optional.of(doc));when(documents.saveAndFlush(doc)).thenReturn(doc);
  var saved=service.updateReceiptAmount(42,8,new java.math.BigDecimal("25"),"user");
  assertEquals(15,saved.uploadedByUserId());assertEquals("Original",saved.uploadedByUserName());assertEquals(9,saved.updatedByUserId());assertEquals("Operador",saved.updatedByUserName());assertNotNull(saved.updatedAt());
 }
 @Test void rejectsPaymentUploadWhenAuthenticatedUserCannotBeResolved() {
  when(users.filterEmail(1,2,"user")).thenReturn(null);
  assertThrows(BusinessException.class,()->service.upload(42,new MockMultipartFile("file","receipt.pdf","application/pdf","%PDF-test".getBytes()),AttendanceDocumentStage.PAYMENT,new java.math.BigDecimal("20"),"user"));
  verifyNoInteractions(storage);verify(documents,never()).saveAndFlush(any());
 }

 @Test void rejectsValueChangesWithoutResolvedUserAndPreservesReceipt() {
  AttendanceDocument doc=new AttendanceDocument();doc.setStage(AttendanceDocumentStage.PAYMENT);doc.setReceiptAmount(new java.math.BigDecimal("10.00"));doc.setUpdatedByUserId(15);
  when(documents.findByAttendanceIdAndId(42,8)).thenReturn(Optional.of(doc));when(users.filterEmail(1,2,"user")).thenReturn(null);
  assertThrows(BusinessException.class,()->service.updateReceiptAmount(42,8,new java.math.BigDecimal("20"),"user"));
  assertEquals(new java.math.BigDecimal("10.00"),doc.getReceiptAmount());assertEquals(15,doc.getUpdatedByUserId());verify(documents,never()).saveAndFlush(any());
 }

 @Test void recordsProposalUploadAndRemovalWithAuthenticatedActorAndFileSnapshot() throws Exception {
  when(storage.save(any(),any(),any(),any(),any())).thenReturn("proposal.pdf");
  when(documents.saveAndFlush(any())).thenAnswer(call->{AttendanceDocument doc=call.getArgument(0);doc.setId(8);return doc;});
  service.upload(42,new MockMultipartFile("file","proposta.pdf","application/pdf","%PDF-test".getBytes()),AttendanceDocumentStage.PROPOSAL,"user");
  ArgumentCaptor<AttendanceLog> entries=ArgumentCaptor.forClass(AttendanceLog.class);
  AttendanceDocument doc=new AttendanceDocument();doc.setId(8);doc.setStage(AttendanceDocumentStage.PROPOSAL);doc.setFileName("proposta.pdf");doc.setFilePath("proposal.pdf");
  var remover=new com.concierge.apiconcierge.models.user.User();remover.setId(10);remover.setName("Removedor");when(users.filterEmail(1,2,"user")).thenReturn(remover);
  when(documents.findByAttendanceIdAndId(42,8)).thenReturn(Optional.of(doc));
  org.springframework.transaction.support.TransactionSynchronizationManager.initSynchronization();
  try {service.removeProposalDocument(42,8,"user");} finally {org.springframework.transaction.support.TransactionSynchronizationManager.clearSynchronization();}
  verify(logs,times(2)).saveAndFlush(entries.capture());var added=entries.getAllValues().get(0);var removed=entries.getAllValues().get(1);
  assertEquals(AttendanceLogAction.DOCUMENT_ADDED,added.getAction());assertEquals(9,added.getUserId());assertEquals("Operador",added.getUserName());
  assertEquals(AttendanceLogAction.DOCUMENT_REMOVED,removed.getAction());assertEquals(10,removed.getUserId());assertEquals("Removedor",removed.getUserName());
  for(var entry:entries.getAllValues()) {assertEquals(42,entry.getAttendanceId());assertEquals(1,entry.getCompanyId());assertEquals(2,entry.getResaleId());assertEquals(AttendanceStatus.COMMERCIAL_PROPOSAL,entry.getStage());assertEquals(8,entry.getDocumentId());assertEquals("proposta.pdf",entry.getFileName());assertNotNull(entry.getOccurredAt());}
 }
 @Test void cleansUpProposalFileWhenWritingAuditFails() throws Exception {
  when(storage.save(any(),any(),any(),any(),any())).thenReturn("proposal.pdf");when(documents.saveAndFlush(any())).thenAnswer(call->call.getArgument(0));
  when(logs.saveAndFlush(any())).thenThrow(new IllegalStateException("Audit unavailable"));
  assertThrows(IllegalStateException.class,()->service.upload(42,new MockMultipartFile("file","proposta.pdf","application/pdf","%PDF-test".getBytes()),AttendanceDocumentStage.PROPOSAL,"user"));
  verify(storage).delete("proposal.pdf");
 }
 @Test void refusesProposalRemovalWhenAuditCannotBeSaved() {
  AttendanceDocument doc=new AttendanceDocument();doc.setStage(AttendanceDocumentStage.PROPOSAL);when(documents.findByAttendanceIdAndId(42,8)).thenReturn(Optional.of(doc));
  when(logs.saveAndFlush(any())).thenThrow(new IllegalStateException("Audit unavailable"));
  assertThrows(IllegalStateException.class,()->service.removeProposalDocument(42,8,"user"));verify(documents,never()).delete(any());verifyNoInteractions(storage);
 }
 @Test void rejectedProposalActionsDoNotCreateAuditEntries() {
  assertThrows(BusinessException.class,()->service.upload(42,new MockMultipartFile("file","bad.pdf","application/pdf",new byte[0]),AttendanceDocumentStage.PROPOSAL,"user"));
  attendance.setStatus(AttendanceStatus.CANCELLED);assertThrows(BusinessException.class,()->service.removeProposalDocument(42,8,"user"));verifyNoInteractions(logs);
 }

 @Test void recordsOrderAdditionAndRemovalWithAuthenticatedUser() throws Exception {
  when(documents.saveAndFlush(any())).thenAnswer(call->{AttendanceDocument doc=call.getArgument(0);doc.setId(8);return doc;});
  service.upload(42,new MockMultipartFile("file","pedido.pdf","application/pdf","%PDF-test".getBytes()),AttendanceDocumentStage.DOCUMENTS,"user");
  AttendanceDocument doc=new AttendanceDocument();doc.setId(8);doc.setStage(AttendanceDocumentStage.DOCUMENTS);doc.setFileName("pedido.pdf");when(documents.findByAttendanceIdAndId(42,8)).thenReturn(Optional.of(doc));
  org.springframework.transaction.support.TransactionSynchronizationManager.initSynchronization();
  try{service.removeOrderDocument(42,8,"user");}finally{org.springframework.transaction.support.TransactionSynchronizationManager.clearSynchronization();}
  ArgumentCaptor<AttendanceLog> entries=ArgumentCaptor.forClass(AttendanceLog.class);verify(logs,times(2)).saveAndFlush(entries.capture());
  assertEquals(AttendanceLogAction.DOCUMENT_ADDED,entries.getAllValues().get(0).getAction());assertEquals(AttendanceLogAction.DOCUMENT_REMOVED,entries.getAllValues().get(1).getAction());
  for(var log:entries.getAllValues()){assertEquals(AttendanceStatus.QUOTATION,log.getStage());assertEquals(9,log.getUserId());assertEquals("Operador",log.getUserName());assertEquals("pedido.pdf",log.getFileName());assertEquals(8,log.getDocumentId());assertNotNull(log.getOccurredAt());}
 }

 @Test void recordsPaymentAdditionValueChangeAndRemovalWithAmountsAndActor() throws Exception {
  when(documents.saveAndFlush(any())).thenAnswer(call->{AttendanceDocument doc=call.getArgument(0);doc.setId(8);return doc;});
  service.upload(42,new MockMultipartFile("file","recibo.pdf","application/pdf","%PDF-test".getBytes()),AttendanceDocumentStage.PAYMENT,new java.math.BigDecimal("20.50"),"user");
  AttendanceDocument doc=new AttendanceDocument();doc.setId(8);doc.setStage(AttendanceDocumentStage.PAYMENT);doc.setFileName("recibo.pdf");doc.setReceiptAmount(new java.math.BigDecimal("20.50"));
  when(documents.findByAttendanceIdAndId(42,8)).thenReturn(Optional.of(doc));
  service.updateReceiptAmount(42,8,new java.math.BigDecimal("35.75"),"user");
  org.springframework.transaction.support.TransactionSynchronizationManager.initSynchronization();
  try{service.removePaymentReceipt(42,8,"user");}finally{org.springframework.transaction.support.TransactionSynchronizationManager.clearSynchronization();}
  ArgumentCaptor<AttendanceLog> entries=ArgumentCaptor.forClass(AttendanceLog.class);verify(logs,times(3)).saveAndFlush(entries.capture());
  var added=entries.getAllValues().get(0);var changed=entries.getAllValues().get(1);var removed=entries.getAllValues().get(2);
  assertEquals(AttendanceLogAction.DOCUMENT_ADDED,added.getAction());assertEquals(new java.math.BigDecimal("20.50"),added.getNewAmount());
  assertEquals(AttendanceLogAction.RECEIPT_AMOUNT_CHANGED,changed.getAction());assertEquals(new java.math.BigDecimal("20.50"),changed.getPreviousAmount());assertEquals(new java.math.BigDecimal("35.75"),changed.getNewAmount());
  assertEquals(AttendanceLogAction.DOCUMENT_REMOVED,removed.getAction());assertEquals(new java.math.BigDecimal("35.75"),removed.getPreviousAmount());
  for(var log:entries.getAllValues()){assertEquals(AttendanceStatus.PAYMENT_PENDING,log.getStage());assertEquals(9,log.getUserId());assertEquals("Operador",log.getUserName());assertEquals("recibo.pdf",log.getFileName());assertEquals(8,log.getDocumentId());assertNotNull(log.getOccurredAt());}
 }
 @Test void unchangedPaymentValueDoesNotCreateAuditOrUpdateTimestamp() {
  AttendanceDocument doc=new AttendanceDocument();doc.setStage(AttendanceDocumentStage.PAYMENT);doc.setReceiptAmount(new java.math.BigDecimal("20.00"));
  when(documents.findByAttendanceIdAndId(42,8)).thenReturn(Optional.of(doc));
  service.updateReceiptAmount(42,8,new java.math.BigDecimal("20"),"user");
  verifyNoInteractions(logs);verify(documents,never()).saveAndFlush(any());assertNull(doc.getUpdatedAt());
 }
 @Test void preventsPaymentRemovalWhenAuditFails() {
  AttendanceDocument doc=new AttendanceDocument();doc.setStage(AttendanceDocumentStage.PAYMENT);when(documents.findByAttendanceIdAndId(42,8)).thenReturn(Optional.of(doc));when(logs.saveAndFlush(any())).thenThrow(new IllegalStateException("Audit unavailable"));
  assertThrows(IllegalStateException.class,()->service.removePaymentReceipt(42,8,"user"));verify(documents,never()).delete(any());verifyNoInteractions(storage);
 }
}
