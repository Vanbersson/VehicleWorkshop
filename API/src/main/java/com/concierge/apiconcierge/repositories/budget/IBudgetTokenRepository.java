package com.concierge.apiconcierge.repositories.budget;

import com.concierge.apiconcierge.models.budget.BudgetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Repository
public interface IBudgetTokenRepository extends JpaRepository<BudgetToken, UUID> {


    @Query(value = "SELECT * FROM `tb_budget_token` WHERE company_id=?1 AND resale_id=?2 AND budget_id=?3", nativeQuery = true)
    BudgetToken filterToken(Integer companyId, Integer resaleId, Integer budgetId);


    @Transactional
    @Modifying
    @Query(value = "DELETE FROM `tb_budget_token` WHERE company_id=?1 AND resale_id=?2 AND budget_id=?3",nativeQuery = true)
    void deleteToken(Integer companyId, Integer resaleId, Integer budgetId);
}
