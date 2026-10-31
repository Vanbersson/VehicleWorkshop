package com.concierge.apiconcierge.repositories.crm.attendance;
import com.concierge.apiconcierge.models.crm.attendance.AttendanceDocument;
import com.concierge.apiconcierge.dtos.crm.attendance.AttendanceDocumentDto;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface IAttendanceDocumentRepository extends JpaRepository<AttendanceDocument,Integer> {
 @Query("select new com.concierge.apiconcierge.dtos.crm.attendance.AttendanceDocumentDto(d.id,d.fileName,d.contentType,d.size,d.createdAt) from AttendanceDocument d where d.attendanceId = :id order by d.createdAt desc, d.id desc")
 List<AttendanceDocumentDto> listMetadata(@Param("id") Integer id);
 Optional<AttendanceDocument> findByAttendanceIdAndId(Integer attendanceId,Integer id);
}
