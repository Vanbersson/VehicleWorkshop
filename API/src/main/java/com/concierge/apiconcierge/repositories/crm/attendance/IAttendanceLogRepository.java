package com.concierge.apiconcierge.repositories.crm.attendance;

import com.concierge.apiconcierge.models.crm.attendance.AttendanceLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IAttendanceLogRepository extends JpaRepository<AttendanceLog, Long> {
    java.util.List<AttendanceLog> findByCompanyIdAndResaleIdAndAttendanceIdOrderByOccurredAtDescIdDesc(Integer companyId, Integer resaleId, Integer attendanceId);
}
