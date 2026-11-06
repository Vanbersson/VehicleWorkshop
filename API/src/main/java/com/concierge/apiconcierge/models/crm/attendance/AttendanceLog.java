package com.concierge.apiconcierge.models.crm.attendance;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "tb_crm_attendance_log", indexes = @Index(name = "idx_attendance_log", columnList = "attendance_id,occurred_at,id"))
public class AttendanceLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "company_id", nullable = false, updatable = false)
    private Integer companyId;
    @Column(name = "resale_id", nullable = false, updatable = false)
    private Integer resaleId;
    @Column(name = "attendance_id", nullable = false, updatable = false)
    private Integer attendanceId;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40, updatable = false)
    private AttendanceStatus stage;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50, updatable = false)
    private AttendanceLogAction action;
    @Column(name = "user_id", updatable = false)
    private Integer userId;
    @Column(name = "user_name", updatable = false)
    private String userName;
    @Column(name = "client_id", updatable = false)
    private Integer clientId;
    @Column(name = "client_name", updatable = false)
    private String clientName;
    @Column(name = "occurred_at", nullable = false, updatable = false)
    private Instant occurredAt;
    // Keep a snapshot: removing the document must not remove its history.
    @Column(name = "document_id", updatable = false)
    private Integer documentId;
    @Column(name = "file_name", updatable = false)
    private String fileName;
    @Column(name = "previous_amount", precision = 19, scale = 2, updatable = false)
    private java.math.BigDecimal previousAmount;
    @Column(name = "new_amount", precision = 19, scale = 2, updatable = false)
    private java.math.BigDecimal newAmount;
}
