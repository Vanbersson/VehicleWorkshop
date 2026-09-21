package com.concierge.apiconcierge.validation.budget.requisition;

import com.concierge.apiconcierge.models.budget.BudgetItemRequisition;

public interface IBudgetItemRequisitionValidation {
    public String save(BudgetItemRequisition requisition);

    public String update(BudgetItemRequisition requisition);

    public String delete(BudgetItemRequisition requisition);

    public String listAllRequisition(Integer companyId, Integer resaleId, Integer budgetId);
}
