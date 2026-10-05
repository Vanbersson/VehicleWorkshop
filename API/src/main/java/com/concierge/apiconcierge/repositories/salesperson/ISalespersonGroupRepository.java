package com.concierge.apiconcierge.repositories.salesperson;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.salesperson.SalespersonGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ISalespersonGroupRepository extends JpaRepository<SalespersonGroup, Integer> {
    @Query(value = "SELECT * FROM `tb_salesperson_group` WHERE company_id=?1 AND resale_id=?2", nativeQuery = true)
    List<SalespersonGroup> listAll(Integer companyId, Integer resaleId);

    @Query(value = "SELECT * FROM `tb_salesperson_group` WHERE company_id=?1 AND resale_id=?2 AND status=?3", nativeQuery = true)
    List<SalespersonGroup> listAllEnabled(Integer companyId, Integer resaleId, StatusEnableDisable status);
}
