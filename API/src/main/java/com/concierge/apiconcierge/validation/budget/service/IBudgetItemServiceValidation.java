package com.concierge.apiconcierge.validation.budget.service;

import com.concierge.apiconcierge.models.budget.BudgetItemService;

public interface IBudgetItemServiceValidation {
    public String save(BudgetItemService budgetService);

    public String update(BudgetItemService budgetService);

    public String listAllServices(Integer companyId, Integer resaleId, Integer budgetId);

    public String delete(BudgetItemService budgetService);

    public String deleteAllDiscount(BudgetItemService budgetService);
}
