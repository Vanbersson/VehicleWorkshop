package com.concierge.apiconcierge.dtos.crm.attendance;
import com.concierge.apiconcierge.models.crm.attendance.*;
import java.time.Instant;
public record AttendanceLogDto(Long id, AttendanceStatus stage, AttendanceLogAction action, Integer userId, String userName, Instant occurredAt, Integer documentId, String fileName, Integer clientId, String clientName, java.math.BigDecimal previousAmount, java.math.BigDecimal newAmount) {
    public static AttendanceLogDto from(AttendanceLog log) {
        return new AttendanceLogDto(log.getId(), log.getStage(), log.getAction(), log.getUserId(), log.getUserName(), log.getOccurredAt(), log.getDocumentId(), log.getFileName(), log.getClientId(), log.getClientName(), log.getPreviousAmount(), log.getNewAmount());
    }
}
