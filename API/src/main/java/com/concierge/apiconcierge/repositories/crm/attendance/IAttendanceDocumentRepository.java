package com.concierge.apiconcierge.repositories.crm.attendance;
import com.concierge.apiconcierge.models.crm.attendance.AttendanceDocument;
import com.concierge.apiconcierge.dtos.crm.attendance.AttendanceDocumentDto;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
import com.concierge.apiconcierge.models.crm.attendance.AttendanceDocumentStage;
public interface IAttendanceDocumentRepository extends JpaRepository<AttendanceDocument,Integer> {
 @Query("select new com.concierge.apiconcierge.dtos.crm.attendance.AttendanceDocumentDto(d.id,d.fileName,d.contentType,d.size,d.createdAt,d.stage,d.proposalApprovedAt,d.signedFileName,d.signedUploadedAt,d.orderApprovedAt,d.receiptAmount,d.uploadedByUserId,d.uploadedByUserName,d.updatedByUserId,d.updatedByUserName,d.updatedAt) from AttendanceDocument d where d.attendanceId = :id and d.stage = :stage order by d.createdAt desc, d.id desc")
 List<AttendanceDocumentDto> listMetadata(@Param("id") Integer id, @Param("stage") AttendanceDocumentStage stage);
 default List<AttendanceDocumentDto> listMetadata(Integer id) { return listMetadata(id, AttendanceDocumentStage.DOCUMENTS); }
 @Query("select new com.concierge.apiconcierge.dtos.crm.attendance.QuoteTotalDto(d.attendanceId,sum(d.receiptAmount)) from AttendanceDocument d where d.attendanceId in :ids and d.stage = :stage group by d.attendanceId")
 List<com.concierge.apiconcierge.dtos.crm.attendance.QuoteTotalDto> findReceiptTotals(@Param("ids") List<Integer> ids, @Param("stage") AttendanceDocumentStage stage);
 @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
 Optional<AttendanceDocument> findFirstByAttendanceIdAndStage(Integer attendanceId, AttendanceDocumentStage stage);
 @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
 @Query("select d from AttendanceDocument d where d.shareTokenHash = :hash")
 Optional<AttendanceDocument> findForShareApproval(@Param("hash") String hash);
 Optional<AttendanceDocument> findByShareTokenHash(String hash);
 Optional<AttendanceDocument> findByAttendanceIdAndId(Integer attendanceId,Integer id);
}
