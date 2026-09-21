package com.concierge.apiconcierge.validation.budget.service;

import com.concierge.apiconcierge.models.budget.BudgetItemService;
import com.concierge.apiconcierge.models.budget.enums.StatusBudgetItemEnum;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.stereotype.Service;

@Service
public class BudgetItemServiceValidation implements IBudgetItemServiceValidation {
    @Override
    public String save(BudgetItemService budgetService) {
        if (budgetService.getCompanyId() == null || budgetService.getCompanyId() == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (budgetService.getResaleId() == null || budgetService.getResaleId() == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (budgetService.getBudgetId() == null || budgetService.getBudgetId() == 0)
            return ConstantsMessage.ERROR_BUDGET_ID;
        if (budgetService.getStatus() != StatusBudgetItemEnum.Pending)
            return ConstantsMessage.ERROR_STATUS;
        if (budgetService.getOrdem() == null || budgetService.getOrdem() == 0)
            return ConstantsMessage.ERROR_ORDEM;
        if (budgetService.getDescription().isBlank())
            return ConstantsMessage.ERROR_NAME;
        if (budgetService.getPrice() <= 0)
            return "Price not informed.";
        if (budgetService.getHourService() <= 0)
            return "Hour not informed.";
        if (budgetService.getDiscount() < 0)
            return "Discount error.";

        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String update(BudgetItemService budgetService) {
        if (budgetService.getCompanyId() == null || budgetService.getCompanyId() == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (budgetService.getResaleId() == null || budgetService.getResaleId() == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (budgetService.getId() == null)
            return ConstantsMessage.ERROR_ID;
        if (budgetService.getBudgetId() == null || budgetService.getBudgetId() == 0)
            return ConstantsMessage.ERROR_BUDGET_ID;
        if (budgetService.getStatus() == null)
            return ConstantsMessage.ERROR_STATUS;
        if (budgetService.getOrdem() == null || budgetService.getOrdem() == 0)
            return ConstantsMessage.ERROR_ORDEM;
        if (budgetService.getDescription().isBlank())
            return ConstantsMessage.ERROR_NAME;
        if (budgetService.getPrice() <= 0)
            return "Price not informed.";
        if (budgetService.getHourService() <= 0)
            return "Hour not informed.";
        if (budgetService.getDiscount() < 0)
            return "Discount error.";

        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String listAllServices(Integer companyId, Integer resaleId, Integer budgetId) {
        if (companyId == null || companyId == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (resaleId == null || resaleId == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (budgetId == null || budgetId == 0)
            return ConstantsMessage.ERROR_BUDGET_ID;

        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String delete(BudgetItemService budgetService) {
        if (budgetService.getCompanyId() == null || budgetService.getCompanyId() == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (budgetService.getResaleId() == null || budgetService.getResaleId() == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (budgetService.getId() == null)
            return ConstantsMessage.ERROR_ID;

        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String deleteAllDiscount(BudgetItemService budgetService) {
        if (budgetService.getCompanyId() == null || budgetService.getCompanyId() == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (budgetService.getResaleId() == null || budgetService.getResaleId() == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (budgetService.getId() == null)
            return ConstantsMessage.ERROR_ID;

        return ConstantsMessage.SUCCESS;
    }
}
