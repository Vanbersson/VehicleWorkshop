package com.concierge.apiconcierge.repositories.workshop.toolcontrol;

import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IToolControlCategoryRepository extends JpaRepository<ToolControlCategory, Integer> {

    @Query(value = "SELECT * FROM `tb_tool_control_category` WHERE company_id=?1 AND resale_id=?2 AND id=?3", nativeQuery = true)
    ToolControlCategory filterId(Integer companyId, Integer resaleId, Integer id);

    @Query(value = "SELECT * FROM `tb_tool_control_category` WHERE company_id=?1 AND resale_id=?2 ", nativeQuery = true)
    List<ToolControlCategory> listAll(Integer companyId, Integer resaleId);

    @Query(value = "SELECT * FROM `tb_tool_control_category` WHERE company_id=?1 AND resale_id=?2 AND status=0 ", nativeQuery = true)
    List<ToolControlCategory> listAllEnabled(Integer companyId, Integer resaleId);
}
