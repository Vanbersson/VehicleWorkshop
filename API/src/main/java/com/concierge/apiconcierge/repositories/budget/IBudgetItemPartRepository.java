package com.concierge.apiconcierge.repositories.budget;

import com.concierge.apiconcierge.models.budget.BudgetItemPart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface IBudgetItemPartRepository extends JpaRepository<BudgetItemPart, UUID> {
    @Query(value = "SELECT * FROM `tb_budget_item` WHERE company_id=?1 AND resale_id=?2 AND budget_id=?3 order by ordem",
            nativeQuery = true)
    List<BudgetItemPart> listAllParts(Integer companyId, Integer resaleId, Integer budgetId);

    @Transactional
    @Modifying
    @Query(value = "DELETE FROM tb_budget_item WHERE company_id=?1 AND resale_id=?2 AND id=?3", nativeQuery = true)
    void deleteItem(Integer companyId, Integer resaleId, UUID id);

}
