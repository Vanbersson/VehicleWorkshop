package com.concierge.apiconcierge.services.crm.attendance;

import com.concierge.apiconcierge.models.crm.attendance.*;
import com.concierge.apiconcierge.repositories.crm.attendance.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.security.*;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.io.IOException;

@Service
public class OrderDocumentShareService {
 private final CustomerAttendanceService attendances;
 private final ICustomerAttendanceRepository attendanceRepository;
 private final IAttendanceDocumentRepository documents;
 private final AttendanceDocumentStorage storage;
 private final IAttendanceLogRepository logs;
 private final SecureRandom random = new SecureRandom();
 public OrderDocumentShareService(CustomerAttendanceService attendances, ICustomerAttendanceRepository attendanceRepository, IAttendanceDocumentRepository documents, AttendanceDocumentStorage storage, IAttendanceLogRepository logs) {
  this.attendances=attendances; this.attendanceRepository=attendanceRepository; this.documents=documents; this.storage=storage;this.logs=logs;
 }
 public record Share(String path, Instant expiresAt) {}
 private ResponseStatusException unavailable() { return new ResponseStatusException(HttpStatus.NOT_FOUND,"Link indisponivel ou expirado."); }
 private String hash(String token) {
  try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.US_ASCII))); }
  catch (NoSuchAlgorithmException error) { throw new IllegalStateException(error); }
 }
 @Transactional
 public Share create(Integer attendanceId, Integer documentId, String email) {
  var scope=attendances.authorizedAttendance(attendanceId,email);
  var attendance=attendanceRepository.findForQuote(scope.getCompanyId(),scope.getResaleId(),attendanceId);
  if(attendance==null || attendance.getStatus()==AttendanceStatus.COMPLETED || attendance.getStatus()==AttendanceStatus.CANCELLED) throw unavailable();
  var document=documents.findByAttendanceIdAndId(attendanceId,documentId).orElseThrow(this::unavailable);
  if(document.getStage()!=AttendanceDocumentStage.DOCUMENTS) throw unavailable();
  byte[] bytes=new byte[32];random.nextBytes(bytes);
  String token=Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  Instant expires=Instant.now().plus(7,ChronoUnit.DAYS);
  document.setShareTokenHash(hash(token));document.setShareExpiresAt(expires);documents.saveAndFlush(document);
  return new Share("/public/orders/"+token,expires);
 }
 private void requireMutable(AttendanceDocument document) {
  var scope=attendanceRepository.findById(document.getAttendanceId()).orElseThrow(this::unavailable);
  var attendance=attendanceRepository.findForQuote(scope.getCompanyId(),scope.getResaleId(),scope.getId());
  if(attendance==null || attendance.getStatus()==AttendanceStatus.COMPLETED || attendance.getStatus()==AttendanceStatus.CANCELLED) throw unavailable();
 }
 private void validateToken(String token) {
  if(token==null || !token.matches("[A-Za-z0-9_-]{43}")) throw unavailable();
 }
 private AttendanceDocument validate(AttendanceDocument document) {
  if(document.getStage()!=AttendanceDocumentStage.DOCUMENTS || document.getShareExpiresAt()==null || !document.getShareExpiresAt().isAfter(Instant.now())) throw unavailable();
  var attendance=attendanceRepository.findById(document.getAttendanceId()).orElseThrow(this::unavailable);
  if(attendance.getStatus()==AttendanceStatus.CANCELLED) throw unavailable();
  return document;
 }
 @Transactional(readOnly=true)
 public AttendanceDocument page(String token) {
  validateToken(token);
  return validate(documents.findByShareTokenHash(hash(token)).orElseThrow(this::unavailable));
 }
 @Transactional
 public Instant approve(String token, boolean confirmed) {
  if(!confirmed) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Confirme a aprovacao do pedido.");
  validateToken(token);
  var document=validate(documents.findForShareApproval(hash(token)).orElseThrow(this::unavailable));
  requireMutable(document);
  if(document.getOrderApprovedAt()==null) {
   if(document.getSignedFilePath()==null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Envie o pedido assinado em PDF antes de aprovar.");
   document.setOrderApprovedAt(Instant.now());
   documents.saveAndFlush(document);
   logClientAction(document, AttendanceLogAction.ORDER_APPROVED, document.getOrderApprovedAt());
  }
  return document.getOrderApprovedAt();
 }
 @Transactional(readOnly=true)
 public AttendanceDocumentService.Download view(String token) throws IOException {
  var document=page(token);
  return new AttendanceDocumentService.Download(document,storage.read(document.getFilePath()));
 }
 @Transactional(rollbackFor=IOException.class)
 public void uploadSigned(String token, org.springframework.web.multipart.MultipartFile file) throws IOException {
  validateToken(token);
  var document=validate(documents.findForShareApproval(hash(token)).orElseThrow(this::unavailable));
  requireMutable(document);
  if(document.getOrderApprovedAt()!=null || document.getSignedFilePath()!=null) throw new ResponseStatusException(HttpStatus.CONFLICT,"O pedido assinado ja foi enviado.");
  String name=Optional.ofNullable(file.getOriginalFilename()).orElse("").replace('\\','/');
  name=name.substring(name.lastIndexOf('/')+1).replaceAll("[\\p{Cntrl}]","").trim();
  if(file.isEmpty() || file.getSize()>5L*1024*1024 || name.isEmpty() || name.length()>255 || !name.toLowerCase(Locale.ROOT).endsWith(".pdf")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Envie um PDF de ate 5 MB.");
  byte[] bytes=file.getBytes();
  if(bytes.length<5 || !new String(bytes,0,5,StandardCharsets.US_ASCII).equals("%PDF-")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"O arquivo enviado nao e um PDF valido.");
  var attendance=attendanceRepository.findById(document.getAttendanceId()).orElseThrow(this::unavailable);
  String path=storage.save(attendance.getCompanyId(),attendance.getResaleId(),document.getAttendanceId(),"pdf",bytes);
  if(org.springframework.transaction.support.TransactionSynchronizationManager.isSynchronizationActive()) org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(new org.springframework.transaction.support.TransactionSynchronization() {
   @Override public void afterCompletion(int status) { if(status==STATUS_ROLLED_BACK) try { storage.delete(path); } catch(IOException error) { org.slf4j.LoggerFactory.getLogger(OrderDocumentShareService.class).error("Could not remove rolled-back signed proposal",error); } }
  });
  document.setSignedFilePath(path);document.setSignedFileName(name);document.setSignedUploadedAt(Instant.now());
  try { documents.saveAndFlush(document); logClientAction(document, AttendanceLogAction.SIGNED_ORDER_UPLOADED, document.getSignedUploadedAt()); } catch(RuntimeException error) { try { storage.delete(path); } catch(IOException cleanup) { error.addSuppressed(cleanup); } throw error; }
 }
 @Transactional(readOnly=true)
 public AttendanceDocumentService.Download signed(String token) throws IOException {
  return signedDownload(page(token));
 }
 @Transactional(readOnly=true)
 public AttendanceDocumentService.Download signed(Integer attendanceId,Integer documentId,String email) throws IOException {
  attendances.authorizedAttendance(attendanceId,email);
  var document=documents.findByAttendanceIdAndId(attendanceId,documentId).orElseThrow(this::unavailable);
  if(document.getStage()!=AttendanceDocumentStage.DOCUMENTS) throw unavailable();
  return signedDownload(document);
 }
 private void logClientAction(AttendanceDocument document, AttendanceLogAction action, Instant occurredAt) {
  var attendance=attendanceRepository.findById(document.getAttendanceId()).orElseThrow(this::unavailable);
  if(attendance.getClientId()==null) throw unavailable();
  AttendanceLog log=new AttendanceLog();
  log.setCompanyId(attendance.getCompanyId());log.setResaleId(attendance.getResaleId());log.setAttendanceId(attendance.getId());
  log.setStage(AttendanceStatus.QUOTATION);log.setAction(action);log.setOccurredAt(occurredAt);
  log.setClientId(attendance.getClientId());log.setClientName(attendance.getClientName());
  log.setDocumentId(document.getId());log.setFileName(document.getSignedFileName());
  logs.saveAndFlush(log);
 }
 private AttendanceDocumentService.Download signedDownload(AttendanceDocument document) throws IOException {
  if(document.getSignedFilePath()==null) throw unavailable();
  byte[] bytes=storage.read(document.getSignedFilePath());
  var metadata=new AttendanceDocument();metadata.setFileName(document.getSignedFileName());metadata.setContentType("application/pdf");metadata.setSize((long)bytes.length);
  return new AttendanceDocumentService.Download(metadata,bytes);
 }

}
