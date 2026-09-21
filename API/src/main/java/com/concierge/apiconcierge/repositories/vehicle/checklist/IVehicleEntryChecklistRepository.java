package com.concierge.apiconcierge.repositories.vehicle.checklist;

import com.concierge.apiconcierge.models.vehicle.checklist.VehicleEntryChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface IVehicleEntryChecklistRepository extends JpaRepository<VehicleEntryChecklist, Integer> {

    @Query(value = "SELECT * FROM `tb_vehicle_entry_checklist` WHERE company_id=?1 AND resale_id=?2 AND id=?3",
            nativeQuery = true)
    VehicleEntryChecklist filterId(Integer companyId, Integer resaleId, Integer id);

}
