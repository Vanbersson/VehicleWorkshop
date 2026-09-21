package com.concierge.apiconcierge.services.budget.requisition;

import com.concierge.apiconcierge.models.budget.BudgetItemRequisition;

import java.util.List;

public interface IBudgetItemRequisitionService {
    public String save(BudgetItemRequisition requisition);

    public String update(BudgetItemRequisition requisition);

    public String delete(BudgetItemRequisition requisition);

    public List<BudgetItemRequisition> listAllRequisition(Integer companyId, Integer resaleId, Integer budgetId);
}
