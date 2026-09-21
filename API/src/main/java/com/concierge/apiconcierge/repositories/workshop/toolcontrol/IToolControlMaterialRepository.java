package com.concierge.apiconcierge.repositories.workshop.toolcontrol;

import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IToolControlMaterialRepository extends JpaRepository<ToolControlMaterial, Integer> {

    @Query(value = "SELECT * FROM `tb_tool_control_material` WHERE company_id=?1 AND resale_id=?2 AND id=?3", nativeQuery = true)
    ToolControlMaterial filterId(Integer companyId, Integer resaleId, Integer materialId);

    @Query(value = "SELECT * FROM `tb_tool_control_material` WHERE company_id=?1 AND resale_id=?2 ", nativeQuery = true)
    List<ToolControlMaterial> listAll(Integer companyId, Integer resaleId);

    @Query(value = "SELECT * FROM `tb_tool_control_material` WHERE company_id=?1 AND resale_id=?2 AND status=0 ", nativeQuery = true)
    List<ToolControlMaterial> listAllEnabled(Integer companyId, Integer resaleId);

}
