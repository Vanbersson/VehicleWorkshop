package com.concierge.apiconcierge.validation.budget.part;

import com.concierge.apiconcierge.models.budget.BudgetItemPart;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.stereotype.Service;

@Service
public class BudgetItemPartValidation implements IBudgetItemPartValidation {
    @Override
    public String save(BudgetItemPart part) {
        if (part.getCompanyId() == null || part.getCompanyId() == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (part.getResaleId() == null || part.getResaleId() == 0)
            return ConstantsMessage.ERROR_RESALE;
        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String update(BudgetItemPart part) {
        if (part.getCompanyId() == null || part.getCompanyId() == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (part.getResaleId() == null || part.getResaleId() == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (part.getId() == null)
            return ConstantsMessage.ERROR_ID;
        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String delete(BudgetItemPart part) {
        if (part.getCompanyId() == null || part.getCompanyId() == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (part.getResaleId() == null || part.getResaleId() == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (part.getId() == null)
            return ConstantsMessage.ERROR_ID;
        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String deleteAllDiscount(BudgetItemPart part) {
        if (part.getCompanyId() == null || part.getCompanyId() == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (part.getResaleId() == null || part.getResaleId() == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (part.getId() == null)
            return ConstantsMessage.ERROR_ID;
        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String listAllParts(Integer companyId, Integer resaleId, Integer budgetId) {
        if (companyId == null || companyId == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (resaleId == null || resaleId == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (budgetId == null || budgetId == 0)
            return ConstantsMessage.ERROR_ID;

        return ConstantsMessage.SUCCESS;
    }
}
