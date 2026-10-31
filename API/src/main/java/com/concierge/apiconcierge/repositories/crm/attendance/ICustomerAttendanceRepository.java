package com.concierge.apiconcierge.repositories.crm.attendance;

import com.concierge.apiconcierge.models.crm.attendance.CustomerAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ICustomerAttendanceRepository extends JpaRepository<CustomerAttendance, Integer> {
    @org.springframework.data.jpa.repository.Query("select a from CustomerAttendance a where a.companyId = :companyId and a.resaleId = :resaleId and (:salespersonId is null or a.salespersonId = :salespersonId) and ((:cancelled = true and a.status = :cancelledStatus) or (:cancelled = false and a.status <> :cancelledStatus)) and (:attendanceId is null or a.id = :attendanceId) and (:clientName = '' or locate(lower(:clientName), lower(a.clientName)) > 0) and (:salespersonName = '' or locate(lower(:salespersonName), lower(a.salespersonName)) > 0) order by a.dateCreated desc")
    List<CustomerAttendance> search(@org.springframework.data.repository.query.Param("companyId") Integer companyId,
        @org.springframework.data.repository.query.Param("resaleId") Integer resaleId,
        @org.springframework.data.repository.query.Param("salespersonId") Integer salespersonId,
        @org.springframework.data.repository.query.Param("cancelledStatus") com.concierge.apiconcierge.models.crm.attendance.AttendanceStatus cancelledStatus,
        @org.springframework.data.repository.query.Param("cancelled") boolean cancelled,
        @org.springframework.data.repository.query.Param("attendanceId") Integer attendanceId,
        @org.springframework.data.repository.query.Param("clientName") String clientName,
        @org.springframework.data.repository.query.Param("salespersonName") String salespersonName);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select a from CustomerAttendance a where a.companyId = :companyId and a.resaleId = :resaleId and a.id = :id")
    CustomerAttendance findForQuote(@org.springframework.data.repository.query.Param("companyId") Integer companyId, @org.springframework.data.repository.query.Param("resaleId") Integer resaleId, @org.springframework.data.repository.query.Param("id") Integer id);
    Optional<CustomerAttendance> findByVisitId(Integer visitId);
    Optional<CustomerAttendance> findByCompanyIdAndResaleIdAndId(Integer companyId, Integer resaleId, Integer id);
    List<CustomerAttendance> findByCompanyIdAndResaleIdOrderByDateCreatedDesc(Integer companyId, Integer resaleId);
}
