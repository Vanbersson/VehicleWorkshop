package com.concierge.apiconcierge.services.budget.service;

import com.concierge.apiconcierge.models.budget.BudgetItemService;

import java.util.List;

public interface IBudgetItemServiceService {
    public String save(BudgetItemService budgetService);

    public String update(BudgetItemService budgetService);

    public List<BudgetItemService> listAllServices(Integer companyId, Integer resaleId, Integer budgetId);

    public String delete(BudgetItemService budgetService);

    public String deleteAllDiscount(BudgetItemService budgetService);
}
