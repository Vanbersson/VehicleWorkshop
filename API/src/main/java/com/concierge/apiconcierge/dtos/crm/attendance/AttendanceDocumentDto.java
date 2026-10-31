package com.concierge.apiconcierge.dtos.crm.attendance;
import java.util.Date;
public record AttendanceDocumentDto(Integer id, String fileName, String contentType, Long size, Date createdAt) {}
