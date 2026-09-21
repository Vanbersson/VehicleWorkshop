package com.concierge.apiconcierge.repositories.module;

import com.concierge.apiconcierge.models.module.ConfVehicleEntryChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface IConfVehicleEntryChecklistRepository extends JpaRepository<ConfVehicleEntryChecklist, Integer> {


    @Query(value = "SELECT * FROM `tb_conf_vehicle_entry_checklist` WHERE company_id=?1 AND resale_id=?2", nativeQuery = true)
    ConfVehicleEntryChecklist filterCompanyResale(Integer companyId, Integer resaleId);

}
