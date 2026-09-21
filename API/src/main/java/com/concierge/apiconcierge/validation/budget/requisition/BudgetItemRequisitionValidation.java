package com.concierge.apiconcierge.validation.budget.requisition;

import com.concierge.apiconcierge.models.budget.BudgetItemRequisition;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.stereotype.Service;

@Service
public class BudgetItemRequisitionValidation implements IBudgetItemRequisitionValidation {
    @Override
    public String save(BudgetItemRequisition requisition) {
        if (requisition.getCompanyId() == null || requisition.getCompanyId() == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (requisition.getResaleId() == null || requisition.getResaleId() == 0)
            return ConstantsMessage.ERROR_RESALE;
        if(requisition.getDescription().isBlank())
            return ConstantsMessage.ERROR_NAME;
        if(requisition.getBudgetId() == null || requisition.getBudgetId() == 0)
            return ConstantsMessage.ERROR_BUDGET_ID;
        if(requisition.getOrdem() == null || requisition.getOrdem() == 0)
            return ConstantsMessage.ERROR_ORDEM;

        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String update(BudgetItemRequisition requisition) {
        if (requisition.getCompanyId() == null || requisition.getCompanyId() == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (requisition.getResaleId() == null || requisition.getResaleId() == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (requisition.getId() == null)
            return ConstantsMessage.ERROR_ID;
        if(requisition.getDescription().isBlank())
            return ConstantsMessage.ERROR_NAME;
        if(requisition.getBudgetId() == null || requisition.getBudgetId() == 0)
            return ConstantsMessage.ERROR_BUDGET_ID;
        if(requisition.getOrdem() == null || requisition.getOrdem() == 0)
            return ConstantsMessage.ERROR_ORDEM;

        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String delete(BudgetItemRequisition requisition) {
        if (requisition.getCompanyId() == null || requisition.getCompanyId() == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (requisition.getResaleId() == null || requisition.getResaleId() == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (requisition.getId() == null)
            return ConstantsMessage.ERROR_ID;

        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String listAllRequisition(Integer companyId, Integer resaleId, Integer budgetId) {
        if (companyId == null || companyId == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (resaleId == null || resaleId == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (budgetId == null || budgetId == 0)
            return ConstantsMessage.ERROR_BUDGET_ID;

        return ConstantsMessage.SUCCESS;
    }
}
