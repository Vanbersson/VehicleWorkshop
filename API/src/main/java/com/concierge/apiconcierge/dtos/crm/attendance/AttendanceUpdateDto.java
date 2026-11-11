package com.concierge.apiconcierge.dtos.crm.attendance;

import com.concierge.apiconcierge.models.crm.attendance.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AttendanceUpdateDto(@NotNull Integer id, @NotNull AttendanceStatus status,
        @Size(max = 2000) String notes, @NotNull Long version,
        @Size(max = 2000) String documentsNotes, @Size(max = 2000) String proposalNotes, @jakarta.validation.constraints.Positive Integer clientId, java.time.LocalDate expectedDeliveryDate, @jakarta.validation.constraints.Positive Integer salespersonId, java.time.LocalDate scheduledDeliveryDate, java.time.LocalDate pickupDate) {
    public AttendanceUpdateDto(Integer id, AttendanceStatus status, String notes, Long version, String documentsNotes, String proposalNotes, Integer clientId, java.time.LocalDate expectedDeliveryDate, Integer salespersonId) {
        this(id, status, notes, version, documentsNotes, proposalNotes, clientId, expectedDeliveryDate, salespersonId, null, null);
    }
    public AttendanceUpdateDto(Integer id, AttendanceStatus status, String notes, Long version, String documentsNotes, String proposalNotes, Integer clientId, java.time.LocalDate expectedDeliveryDate) {
        this(id,status,notes,version,documentsNotes,proposalNotes,clientId,expectedDeliveryDate,null);
    }
    public AttendanceUpdateDto(Integer id, AttendanceStatus status, String notes, Long version, String documentsNotes, String proposalNotes, Integer clientId) {
        this(id,status,notes,version,documentsNotes,proposalNotes,clientId,null);
    }
    public AttendanceUpdateDto(Integer id, AttendanceStatus status, String notes, Long version, String documentsNotes, String proposalNotes) {
        this(id, status, notes, version, documentsNotes, proposalNotes, null);
    }
    public AttendanceUpdateDto(Integer id, AttendanceStatus status, String notes, Long version) {
        this(id, status, notes, version, null, null, null);
    }
}
