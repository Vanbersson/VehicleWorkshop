package com.concierge.apiconcierge.models.crm.attendance;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.Date;

@Getter
@Setter
@Entity
@Table(name = "tb_crm_customer_attendance", uniqueConstraints = @UniqueConstraint(name = "uk_customer_attendance_visit", columnNames = "visit_id"))
public class CustomerAttendance {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "company_id", nullable = false)
    private Integer companyId;
    @Column(name = "resale_id", nullable = false)
    private Integer resaleId;
    @Column(name = "visit_id")
    private Integer visitId;
    @Column(name = "client_id")
    private Integer clientId;
    @Column(name = "client_name", nullable = false)
    private String clientName;
    @Column(name = "salesperson_id", nullable = false)
    private Integer salespersonId;
    @Column(name = "salesperson_name", nullable = false)
    private String salespersonName;
    @Column(name = "date_created", nullable = false)
    private Date dateCreated;
    @Column(name = "date_visit")
    private Date dateVisit;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private AttendanceStatus status = AttendanceStatus.VISIT_COMPLETED;
    @Column(length = 2000)
    private String notes = "";
    @Column(name = "cancellation_reason", length = 2000)
    private String cancellationReason;
    @Column(name = "cancelled_at")
    private Date cancelledAt;
    @Column(name = "cancelled_by_id")
    private Integer cancelledById;
    @Column(name = "cancelled_by_name")
    private String cancelledByName;
    @Column(name = "documents_notes", length = 2000)
    private String documentsNotes;
    @Column(name = "proposal_notes", length = 2000)
    private String proposalNotes;
    @Column(name = "approval_requested_at")
    private Date approvalRequestedAt;
    @Column(name = "completed_at")
    private Date completedAt;
    @Version
    private Long version;
}
