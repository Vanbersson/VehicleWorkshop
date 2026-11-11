package com.concierge.apiconcierge.dtos.crm.attendance;

import com.concierge.apiconcierge.models.crm.attendance.AttendanceStatus;
import com.concierge.apiconcierge.models.crm.attendance.CustomerAttendance;
import java.util.Date;
import java.math.BigDecimal;

public record AttendanceResponseDto(Integer id, Integer visitId, Integer clientId, String clientName,
        Integer salespersonId, String salespersonName, Date dateCreated, Date dateVisit,
        AttendanceStatus status, String notes, Long version, BigDecimal quoteTotal, String cancellationReason, Date cancelledAt, String cancelledByName, String documentsNotes, String proposalNotes, Date approvalRequestedAt, Date completedAt, java.time.LocalDate expectedDeliveryDate, BigDecimal paymentTotal, java.time.LocalDate scheduledDeliveryDate, java.time.LocalDate pickupDate) {
    public static AttendanceResponseDto from(CustomerAttendance a) { return from(a, null); }
    public static AttendanceResponseDto from(CustomerAttendance a, BigDecimal quoteTotal) { return from(a, quoteTotal, BigDecimal.ZERO); }
    public static AttendanceResponseDto from(CustomerAttendance a, BigDecimal quoteTotal, BigDecimal paymentTotal) {
        return new AttendanceResponseDto(a.getId(), a.getVisitId(), a.getClientId(), a.getClientName(),
                a.getSalespersonId(), a.getSalespersonName(), a.getDateCreated(), a.getDateVisit(), a.getStatus(), a.getNotes(), a.getVersion(), quoteTotal, a.getCancellationReason(), a.getCancelledAt(), a.getCancelledByName(), a.getDocumentsNotes(), a.getProposalNotes(), a.getApprovalRequestedAt(), a.getCompletedAt(), a.getExpectedDeliveryDate(), paymentTotal, a.getScheduledDeliveryDate(), a.getPickupDate());
    }
}
