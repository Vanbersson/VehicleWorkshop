package com.concierge.apiconcierge.repositories.workshop.toolcontrol;

import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlKitMec;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IToolControlKitMecRepository extends JpaRepository<ToolControlKitMec, UUID> {

    @Query(value = "SELECT matmec.company_id,matmec.resale_id,matmec.id,matmec.request_id,matmec.quantity_req,matmec.quantity_ret, matmec.user_id_ret,matmec.date_ret,matmec.information_ret,matmec.material_id \n" +
            "FROM tb_tool_control_request as req\n" +
            "INNER JOIN tb_tool_control_kit_mec AS matmec ON req.id=matmec.request_id AND req.company_id=?1 AND req.resale_id=?2 AND req.status=0 AND matmec.material_id=?3 \n" +
            "AND matmec.quantity_ret=0 AND matmec.user_id_ret IS NULL AND matmec.date_ret IS NULL", nativeQuery = true)
    List<ToolControlKitMec> filterMatIdDevPend(Integer companyId, Integer resaleId, Integer materialId);
}
