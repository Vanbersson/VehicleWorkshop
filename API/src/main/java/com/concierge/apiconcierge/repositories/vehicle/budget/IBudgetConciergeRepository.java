package com.concierge.apiconcierge.repositories.vehicle.budget;
import com.concierge.apiconcierge.models.vehicle.budget.BudgetConcierge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface IBudgetConciergeRepository extends JpaRepository<BudgetConcierge, Integer> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths="items")
    List<BudgetConcierge> findByCompanyIdAndResaleIdOrderByGenerationDateDescIdDesc(Integer companyId, Integer resaleId);
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths="items")
    java.util.Optional<BudgetConcierge> findByCompanyIdAndResaleIdAndId(Integer companyId,Integer resaleId,Integer id);
    interface BudgetListRow {
        BudgetConcierge getBudget();
        String getVehiclePlate();
    }
    @org.springframework.data.jpa.repository.Query("select b as budget, v.vehiclePlate as vehiclePlate from BudgetConcierge b left join VehicleEntry v on v.id = b.vehicleId and v.companyId = b.companyId and v.resaleId = b.resaleId where b.companyId = :companyId and b.resaleId = :resaleId and b.status = :status order by b.generationDate desc, b.id desc")
    List<BudgetListRow> listByStatus(@org.springframework.data.repository.query.Param("companyId") Integer companyId, @org.springframework.data.repository.query.Param("resaleId") Integer resaleId, @org.springframework.data.repository.query.Param("status") com.concierge.apiconcierge.models.budget.enums.StatusBudgetEnum status);
    @org.springframework.data.jpa.repository.Query("select b as budget, v.vehiclePlate as vehiclePlate from BudgetConcierge b left join VehicleEntry v on v.id = b.vehicleId and v.companyId = b.companyId and v.resaleId = b.resaleId where b.companyId = :companyId and b.resaleId = :resaleId and b.status = :status and exists (select s.id from Salesperson s where s.id = b.salespersonUserId and s.companyId = b.companyId and s.resaleId = b.resaleId and s.userId = :userId) order by b.generationDate desc, b.id desc")
    List<BudgetListRow> listOwnByStatus(@org.springframework.data.repository.query.Param("companyId") Integer companyId, @org.springframework.data.repository.query.Param("resaleId") Integer resaleId, @org.springframework.data.repository.query.Param("status") com.concierge.apiconcierge.models.budget.enums.StatusBudgetEnum status, @org.springframework.data.repository.query.Param("userId") Integer userId);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select b from BudgetConcierge b where b.companyId=:companyId and b.resaleId=:resaleId and b.id=:id")
    java.util.Optional<BudgetConcierge> lockBudget(@org.springframework.data.repository.query.Param("companyId") Integer companyId,@org.springframework.data.repository.query.Param("resaleId") Integer resaleId,@org.springframework.data.repository.query.Param("id") Integer id);
}

