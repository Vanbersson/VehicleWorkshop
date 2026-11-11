package com.concierge.apiconcierge.repositories.vehicle.budget;
import com.concierge.apiconcierge.models.vehicle.budget.BudgetConciergeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface IBudgetConciergeDocumentRepository extends JpaRepository<BudgetConciergeDocument,Integer> {
    List<BudgetConciergeDocument> findByCompanyIdAndResaleIdAndBudgetId(Integer companyId,Integer resaleId,Integer budgetId);
    Optional<BudgetConciergeDocument> findByCompanyIdAndResaleIdAndBudgetIdAndId(Integer companyId,Integer resaleId,Integer budgetId,Integer id);
    Optional<BudgetConciergeDocument> findByShareTokenHash(String hash);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select d from BudgetConciergeDocument d where d.shareTokenHash=:hash")
    Optional<BudgetConciergeDocument> lockForApproval(@org.springframework.data.repository.query.Param("hash") String hash);
    interface ApprovalScope { Integer getCompanyId(); Integer getResaleId(); Integer getBudgetId(); }
    @org.springframework.data.jpa.repository.Query("select d.companyId as companyId,d.resaleId as resaleId,d.budgetId as budgetId from BudgetConciergeDocument d where d.shareTokenHash=:hash")
    Optional<ApprovalScope> shareScope(@org.springframework.data.repository.query.Param("hash") String hash);
    boolean existsByBudgetId(Integer budgetId);
}
