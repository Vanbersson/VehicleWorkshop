package com.concierge.apiconcierge.models.crm.attendance;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@Entity
@Table(name = "tb_crm_attendance_document")
public class AttendanceDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "attendance_id", nullable = false)
    private Integer attendanceId;
    @Enumerated(EnumType.STRING)
    @Column(name = "stage", nullable = false, columnDefinition = "varchar(30) default 'DOCUMENTS'")
    private AttendanceDocumentStage stage = AttendanceDocumentStage.DOCUMENTS;
    @Column(name = "receipt_amount", precision = 19, scale = 2)
    private java.math.BigDecimal receiptAmount;
    @Column(name = "uploaded_by_user_id")
    private Integer uploadedByUserId;
    @Column(name = "uploaded_by_user_name")
    private String uploadedByUserName;
    @Column(name = "updated_by_user_id")
    private Integer updatedByUserId;
    @Column(name = "updated_by_user_name")
    private String updatedByUserName;
    @Column(name = "updated_at")
    private java.time.Instant updatedAt;
    @Column(name = "file_name", nullable = false)
    private String fileName;
    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;
    @Column(name = "file_size", nullable = false)
    private Long size;
    @Column(name = "created_at", nullable = false)
    private Date createdAt;
    @Column(name = "file_path", nullable = false, length = 1024)
    private String filePath;
    @Column(name = "share_token_hash", length = 64, unique = true)
    private String shareTokenHash;
    @Column(name = "share_expires_at")
    private java.time.Instant shareExpiresAt;
    @Column(name = "proposal_approved_at")
    private java.time.Instant proposalApprovedAt;
    @Column(name = "order_approved_at")
    private java.time.Instant orderApprovedAt;
    @Column(name = "signed_file_path", length = 1024)
    private String signedFilePath;
    @Column(name = "signed_file_name")
    private String signedFileName;
    @Column(name = "signed_uploaded_at")
    private java.time.Instant signedUploadedAt;
}
