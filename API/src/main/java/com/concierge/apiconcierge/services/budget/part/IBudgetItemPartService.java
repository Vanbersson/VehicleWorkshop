package com.concierge.apiconcierge.services.budget.part;

import com.concierge.apiconcierge.models.budget.BudgetItemPart;

import java.util.List;

public interface IBudgetItemPartService {
    public String save(BudgetItemPart part);
    public String update(BudgetItemPart part);
    public String delete(BudgetItemPart part);
    public String deleteAllDiscount(BudgetItemPart part);
    public List<BudgetItemPart> listAllParts(Integer companyId, Integer resaleId, Integer budgetId);
}
