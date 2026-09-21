package com.concierge.apiconcierge.repositories.workshop.toolcontrol;

import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlRequest;
import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.StatusRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IToolControlRequestRepository extends JpaRepository<ToolControlRequest, Integer> {


    @Query(value = "SELECT * FROM tb_tool_control_request WHERE company_id=?1 AND resale_id=?2 AND id=?3", nativeQuery = true)
    ToolControlRequest filterId(Integer companyId, Integer resaleId, Integer id);

    @Query(value = "SELECT * FROM `tb_tool_control_request` WHERE Company_id=?1 AND resale_id=?2 AND status=?3 AND mechanic_id=?4", nativeQuery = true)
    List<ToolControlRequest> filterMechanicId(Integer companyId, Integer resaleId, StatusRequest status, Integer mechanicId);

    @Query(value = "SELECT * FROM `tb_tool_control_request` WHERE Company_id=?1 AND resale_id=?2 AND mechanic_id=?3 AND (status=?4 OR status=?5) ", nativeQuery = true)
    List<ToolControlRequest> filterByMechanicIdStatus(Integer companyId, Integer resaleId, Integer mechanicId, StatusRequest status1, StatusRequest status2);

    @Query(value = "SELECT * FROM `tb_tool_control_request` WHERE Company_id=?1 AND resale_id=?2 AND status=?3 ", nativeQuery = true)
    List<ToolControlRequest> listAllStatus(Integer companyId, Integer resaleId, StatusRequest status);
}
