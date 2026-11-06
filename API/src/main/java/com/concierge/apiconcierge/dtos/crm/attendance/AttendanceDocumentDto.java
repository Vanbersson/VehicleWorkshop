package com.concierge.apiconcierge.dtos.crm.attendance;
import java.util.Date;
import com.concierge.apiconcierge.models.crm.attendance.AttendanceDocumentStage;
public record AttendanceDocumentDto(Integer id, String fileName, String contentType, Long size, Date createdAt, AttendanceDocumentStage stage, java.time.Instant proposalApprovedAt, String signedFileName, java.time.Instant signedUploadedAt, java.time.Instant orderApprovedAt, java.math.BigDecimal receiptAmount, Integer uploadedByUserId, String uploadedByUserName, Integer updatedByUserId, String updatedByUserName, java.time.Instant updatedAt) {
 public AttendanceDocumentDto(Integer id, String fileName, String contentType, Long size, Date createdAt, AttendanceDocumentStage stage, java.time.Instant proposalApprovedAt, String signedFileName, java.time.Instant signedUploadedAt, java.time.Instant orderApprovedAt, java.math.BigDecimal receiptAmount, Integer uploadedByUserId, String uploadedByUserName) {
  this(id,fileName,contentType,size,createdAt,stage,proposalApprovedAt,signedFileName,signedUploadedAt,orderApprovedAt,receiptAmount,uploadedByUserId,uploadedByUserName,null,null,null);
 }
 public AttendanceDocumentDto(Integer id, String fileName, String contentType, Long size, Date createdAt, AttendanceDocumentStage stage, java.time.Instant proposalApprovedAt, String signedFileName, java.time.Instant signedUploadedAt, java.time.Instant orderApprovedAt, java.math.BigDecimal receiptAmount) {
  this(id,fileName,contentType,size,createdAt,stage,proposalApprovedAt,signedFileName,signedUploadedAt,orderApprovedAt,receiptAmount,null,null);
 }
 public AttendanceDocumentDto(Integer id, String fileName, String contentType, Long size, Date createdAt, AttendanceDocumentStage stage, java.time.Instant proposalApprovedAt, String signedFileName, java.time.Instant signedUploadedAt, java.time.Instant orderApprovedAt) {
  this(id,fileName,contentType,size,createdAt,stage,proposalApprovedAt,signedFileName,signedUploadedAt,orderApprovedAt,null);
 }
 public AttendanceDocumentDto(Integer id, String fileName, String contentType, Long size, Date createdAt, AttendanceDocumentStage stage, java.time.Instant proposalApprovedAt, String signedFileName, java.time.Instant signedUploadedAt) {
  this(id,fileName,contentType,size,createdAt,stage,proposalApprovedAt,signedFileName,signedUploadedAt,null);
 }
 public AttendanceDocumentDto(Integer id, String fileName, String contentType, Long size, Date createdAt, AttendanceDocumentStage stage, java.time.Instant proposalApprovedAt) {
  this(id, fileName, contentType, size, createdAt, stage, proposalApprovedAt, null, null);
 }
 public AttendanceDocumentDto(Integer id, String fileName, String contentType, Long size, Date createdAt, AttendanceDocumentStage stage) {
  this(id, fileName, contentType, size, createdAt, stage, null);
 }
 public AttendanceDocumentDto(Integer id, String fileName, String contentType, Long size, Date createdAt) {
  this(id, fileName, contentType, size, createdAt, AttendanceDocumentStage.DOCUMENTS);
 }
}
