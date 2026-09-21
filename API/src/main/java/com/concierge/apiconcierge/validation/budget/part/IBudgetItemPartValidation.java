package com.concierge.apiconcierge.validation.budget.part;

import com.concierge.apiconcierge.models.budget.BudgetItemPart;

public interface IBudgetItemPartValidation {

    public String save(BudgetItemPart part);

    public String update(BudgetItemPart part);

    public String delete(BudgetItemPart part);

    public String deleteAllDiscount(BudgetItemPart part);

    public String listAllParts(Integer companyId, Integer resaleId, Integer budgetId);
}
