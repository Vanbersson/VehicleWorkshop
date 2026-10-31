package com.concierge.apiconcierge.repositories.crm.attendance;
import com.concierge.apiconcierge.models.crm.attendance.AttendanceQuote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface IAttendanceQuoteRepository extends JpaRepository<AttendanceQuote, Integer> {
    @org.springframework.data.jpa.repository.Query("select new com.concierge.apiconcierge.dtos.crm.attendance.QuoteTotalDto(q.attendanceId, q.total) from AttendanceQuote q where q.companyId = :companyId and q.resaleId = :resaleId and q.attendanceId in :ids")
    java.util.List<com.concierge.apiconcierge.dtos.crm.attendance.QuoteTotalDto> findTotals(@org.springframework.data.repository.query.Param("companyId") Integer companyId, @org.springframework.data.repository.query.Param("resaleId") Integer resaleId, @org.springframework.data.repository.query.Param("ids") java.util.List<Integer> ids);
    Optional<AttendanceQuote> findByCompanyIdAndResaleIdAndAttendanceId(Integer companyId, Integer resaleId, Integer attendanceId);
}
