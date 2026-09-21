package com.concierge.apiconcierge.repositories.budget;

import com.concierge.apiconcierge.models.budget.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface IBudgetRepository extends JpaRepository<Budget, Integer> {

    @Query(value = "SELECT * FROM `tb_budget` WHERE company_id=?1 AND resale_id=?2 AND vehicle_entry_id=?3", nativeQuery = true)
    Budget filterVehicleId(Integer companyId, Integer resaleId, Integer vehicleEntryId);
    @Query(value = "SELECT * FROM `tb_budget` WHERE company_id=?1 AND resale_id=?2 AND id=?3", nativeQuery = true)
    Budget filterBudgetId(Integer companyId, Integer resaleId, Integer budgetId);
}
